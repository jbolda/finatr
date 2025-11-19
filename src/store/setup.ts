import { createStore, parallel, takeEvery } from 'starfx';
import type { AnyState, Operation } from 'starfx';

import {
  createDocPersistor,
  createLocalStorageAdapter,
  persistDocMdw
} from './persist.ts';
import { initialState as schemaInitialState } from './schema/index.ts';
import type { AppState } from './schema/index.ts';
import { connectReduxDevToolsExtension } from './thunks/devtools.ts';
import { tasks, thunks } from './thunks/index.ts';
import { loroStoreUpdater } from './updater.ts';

const localPersistor = createDocPersistor({
  key: 'finatr',
  adapter: createLocalStorageAdapter<AppState>()
});

const devtoolsEnabled = true;
export function setupStore({
  logs = true,
  initialState = {}
}: {
  logs: boolean;
  initialState: AnyState;
}) {
  const store = createStore({
    initialState: {
      ...schemaInitialState,
      ...initialState
    },
    // @ts-expect-error not quite type compatible yet
    setStoreUpdater: loroStoreUpdater,
    middleware: [persistDocMdw(localPersistor)]
  });

  const tsks: (() => Operation<void>)[] = [];
  if (logs) {
    // log all actions dispatched
    tsks.push(
      takeEvery('*', function* logActions(action) {
        console.log(action);
      }) as unknown as () => Operation<void>
    );
  }
  tsks.push(
    thunks.register,
    connectReduxDevToolsExtension({
      name: 'finatr',
      store,
      enabled: devtoolsEnabled
    }),
    ...tasks
  );

  store.initialize(function* () {
    yield* localPersistor.rehydrate();
    const group = yield* parallel(tsks);
    // yield* schema.update(schema.loaders.success({ id: PERSIST_LOADER_ID }));
    yield* group;
  });

  return store;
}
