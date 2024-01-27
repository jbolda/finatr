import { LogContext, each, log, parallel, take } from 'starfx';
import {
  PERSIST_LOADER_ID,
  configureStore,
  createLocalStorageAdapter,
  createPersistor,
  persistStoreMdw
} from 'starfx/store';
import { initialState as schemaInitialState } from './schema.ts';
import { thunks, tasks } from './thunks/index.ts';

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
  tsks.push(...thunks, ...tasks);

  store.run(function* () {
    yield* persistor.rehydrate();
    const group = yield* parallel(tsks);
    yield* group;
  });

  return store;
}
