import { Callable, parallel, take } from 'starfx';
import {
  configureStore,
  createLocalStorageAdapter,
  createPersistor,
  persistStoreMdw
} from 'starfx/store';

import { initialState as schemaInitialState } from './schema.ts';
import { setupDevTool, subscribeToActions } from './thunks/devtools.ts';
import { tasks, thunks } from './thunks/index.ts';

const devtoolsEnabled = true;
export function setupStore({ logs = true, initialState = {} }) {
  const persistor = createPersistor({
    adapter: createLocalStorageAdapter(),
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
    yield* group;
  });

  return store;
}
