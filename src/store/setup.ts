import { parseJSON } from 'date-fns';
import { dinero } from 'dinero.js';
import {
  Callable,
  createStore,
  createLocalStorageAdapter,
  createPersistor,
  parallel,
  PERSIST_LOADER_ID,
  persistStoreMdw,
  take
} from 'starfx';

import {
  AppState,
  initialState as schemaInitialState,
  schema
} from './schema.ts';
import { connectReduxDevToolsExtension } from './thunks/devtools.ts';
import { tasks, thunks } from './thunks/index.ts';

function reconstitute(sliceName: string, item: unknown) {
  if (!item || (typeof item !== 'object' && Object.entries(item).length > 0))
    return item;

  const reconstituted: Record<string, any> = { ...item };
  for (const [key, value] of Object.entries(item)) {
    if (value && typeof value === 'object') {
      if ('amount' in value && 'currency' in value && 'scale' in value) {
        reconstituted[key] = dinero(value);
      }
    }
  }
  return reconstituted;
}

function reconcilerWithReconstitution(original: any, persisted: any) {
  const reconstituted = { ...persisted };
  const sliceNames = ['accounts', 'transactions'];

  for (const sliceName of sliceNames) {
    if (sliceName in persisted) {
      for (const [key, item] of Object.entries(persisted[sliceName])) {
        const updatedData = reconstitute(sliceName, item);
        reconstituted[sliceName][key] = updatedData;
      }
    }
  }

  if (reconstituted.chartRange) {
    reconstituted.chartRange = {
      start: parseJSON(reconstituted.chartRange.start),
      end: parseJSON(reconstituted.chartRange.end)
    };
  }
  return { ...original, ...reconstituted };
}

const devtoolsEnabled = true;
export function setupStore({ logs = true, initialState = {} }) {
  const persistor = createPersistor({
    key: 'finatr',
    adapter: createLocalStorageAdapter<AppState>(),
    reconciler: reconcilerWithReconstitution,
    allowlist: [
      'settings',
      'chartRange',
      'accounts',
      'transactions',
      'incomeReceived',
      'incomeExpected'
    ]
  });

  const store = createStore({
    initialState: {
      ...schemaInitialState,
      ...initialState
    },
    middleware: [persistStoreMdw(persistor)]
  });

  const tsks: Callable<unknown>[] = [];
  if (logs) {
    // log all actions dispatched
    tsks.push(function* logActions() {
      while (true) {
        const action = yield* take('*');
        console.log(action);
      }
    });
  }
  tsks.push(
    thunks.bootup,
    connectReduxDevToolsExtension({
      name: 'finatr',
      store,
      enabled: devtoolsEnabled
    }),
    ...tasks
  );

  store.run(function* () {
    yield* persistor.rehydrate();
    const group = yield* parallel(tsks);
    yield* schema.update(schema.loaders.success({ id: PERSIST_LOADER_ID }));
    yield* group;
  });

  return store;
}
