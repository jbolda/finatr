import {
    Callable, configureStore, createLocalStorageAdapter, createPersistor, parallel,
    PERSIST_LOADER_ID, persistStoreMdw, take
} from 'starfx';

import { AppState, initialState as schemaInitialState, schema } from './schema.ts';
import { setupDevTool, subscribeToActions } from './thunks/devtools.ts';
import { tasks, thunks } from './thunks/index.ts';

const devtoolsEnabled = true;
export function setupStore({ logs = true, initialState = {} }) {
  const persistor = createPersistor({
    adapter: createLocalStorageAdapter<AppState>(),
    allowlist: ['settings']
  });

  const store = configureStore({
    initialState: {
      ...schemaInitialState,
      ...initialState
    },
    middleware: [persistStoreMdw(persistor)]
  });

  window['fx'] = store;
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
  tsks.push(thunks.bootup, ...tasks);
  tsks.push(function* devtools() {
    if (!devtoolsEnabled) return;
    while (true) {
      const action = yield* take('*');
      subscribeToActions({} as any, { action });
    }
  });

  devtoolsEnabled && setupDevTool({}, { name: 'finatr', enabled: true });
  store.run(function* () {
    yield* persistor.rehydrate();
    const group = yield* parallel(tsks);
    yield* schema.update(schema.loaders.success({ id: PERSIST_LOADER_ID}));
    yield* group;
  });

  return store;
}
