import { each, log, LogContext, parallel, take } from 'starfx';
import {
    configureStore, createLocalStorageAdapter, createPersistor, PERSIST_LOADER_ID, persistStoreMdw
} from 'starfx/store';

import { setupDevTool, subscribeToActions } from './devtools.ts';
import { initialState as schemaInitialState } from './schema.ts';
import { tasks, thunks } from './thunks/index.ts';

const devtoolsEnabled = true;

const persistor = createPersistor({
  adapter: createLocalStorageAdapter(),
  allowlist: ['settings']
});


const store = configureStore({
  initialState: schemaInitialState,
  middleware: [persistStoreMdw(persistor)]
});
window.store = store;

export const setupStore = ({ logs = true, initialState = {} }) => {
  const tsks = [];
  if (logs) {
    // listen to starfx logger for all log events
    tsks.push(function* logger() {
      const ctx = yield* LogContext;
      for (const event of yield* each(ctx)) {
        console.log('event', event)
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

  
  devtoolsEnabled && setupDevTool({}, { name: 'finatr', enabled: true });
  store.run(function* () {
    yield* persistor.rehydrate();
    const group = yield* parallel([
      thunks.bootup,
      ...tsks,
      function* devtools() {
        if (!devtoolsEnabled) return;
        while (true) {
          const action = yield* take('*');
          subscribeToActions({} as any, { action });
        }
      }
    ]);
    yield* group;
  });

  return store;
}
export type AppState = ReturnType<typeof setupStore>;