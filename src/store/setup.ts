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

  store.run(function* () {
    const metaResult = yield* metaPersistor.rehydrate();
    if (!metaResult.ok) {
      console.error('meta rehydrate failed', metaResult.error);
    }

    // now the settings have been populated; only load the larger document if
    // the user previously enabled persistence.
    // TODO typings: the generic isn't coming through and is only FxMap
    let state = store.getState() as any;
    const hasLocalSnapshot =
      typeof localStorage !== 'undefined' &&
      Boolean(localStorage.getItem(localPersistor.key));

    if (state.settings?.['persist'] || hasLocalSnapshot) {
      yield* localPersistor.rehydrate();

      // If we recovered from an existing snapshot, keep persist enabled so
      // later updates continue writing the document.
      if (hasLocalSnapshot && !state.settings?.['persist']) {
        yield* schema.update(
          schema.settings.update({ key: 'persist', value: true })
        );
        state = store.getState() as any;
      }
    }

    const group = yield* parallel(tsks);
    yield* schema.update(schema.loaders.success({ id: PERSIST_LOADER_ID }));
    yield* group;
  });

  return store;
}
