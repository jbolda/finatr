import { each, log, LogContext, parallel, take } from 'starfx';
import {
    configureStore, createLocalStorageAdapter, createPersistor, PERSIST_LOADER_ID, persistStoreMdw
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
  const tsks = [];
  tsks.push(thunks.bootup);
  if (logs) {
    // listen to starfx logger for all log events
    tsks.push(function* logger() {
      const ctx = yield* LogContext;
      for (const event of yield* each(ctx)) {
        if (event.type.startsWith('error:')) {
          console.error(event.payload);
        } else if (event.type === 'action') {
          console.log(event.payload);
        }
        yield* each.next();
      }
    });
    // log all actions dispatched
    tsks.push(function* logActions() {
      while (true) {
        const action = yield* take('*');
        yield* log({ type: 'action', payload: action });
      }
    });
  }
  tsks.push(...tasks);
  
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
export type AppState = ReturnType<typeof setupStore>;