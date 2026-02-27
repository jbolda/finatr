import { createStore, parallel, takeEvery } from 'starfx';
import type { AnyState, Operation } from 'starfx';

import { localPersistor, schemas } from './schema/index.ts';
import { connectReduxDevToolsExtension } from './thunks/devtools.ts';
import { tasks, thunks } from './thunks/index.ts';

const devtoolsEnabled = true;
export function setupStore({
  logs = true
}: {
  logs: boolean;
  initialState: AnyState;
}) {
  const store = createStore({ schemas });

  const tsks: (() => Operation<void>)[] = [];
  if (logs) {
    // log all actions dispatched
    tsks.push(() =>
      takeEvery('*', function* logActions(action) {
        console.log(action);
      })
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
