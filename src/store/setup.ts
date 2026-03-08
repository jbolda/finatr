import { createStore, parallel, takeEvery } from 'starfx';
import type { AnyState, Operation } from 'starfx';

import { PERSIST_LOADER_ID } from './persist.ts';
import {
  localPersistor,
  schemas,
  metaSchema as schema,
  metaPersistor
} from './schema/index.ts';
import { connectReduxDevToolsExtension } from './thunks/devtools.ts';
import { tasks, thunks } from './thunks/index.ts';

const devtoolsEnabled = true;
export function setupStore({
  logs = true
}: {
  logs: boolean;
  initialState: AnyState;
}) {
  // schema array has heterogeneous generics; TS complains even though the
  // runtime accepts it. cast to any for now and revisit upstream type defs.
  // @ts-expect-error schema list too wide
  const store = createStore({ schemas: schemas });

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
    yield* metaPersistor.rehydrate();

    // now the settings have been populated; only load the larger document if
    // the user previously enabled persistence.
    // TODO typings: the generic isn't coming through and is only FxMap
    const state = store.getState() as any;
    if (state.settings?.['persist']) {
      yield* localPersistor.rehydrate();
    }

    const group = yield* parallel(tsks);
    // loader update typing is messy since schema type is broad
    // @ts-expect-error loader updater mismatched
    yield* schema.update(schema.loaders.success({ id: PERSIST_LOADER_ID }));
    yield* group;
  });

  return store;
}
