import { createStore, takeEvery, expectStore } from 'starfx';
import type { AnyState } from 'starfx';

import { PERSIST_LOADER_ID } from './persist.ts';
import {
  localPersistor,
  loroSchema,
  metaSchema as schema,
  metaPersistor
} from './schema/index.ts';
import { connectReduxDevToolsExtension } from './thunks/devtools.ts';
import { tasks } from './thunks/index.ts';

const devtoolsEnabled = true;
export function setupStore({
  logs = true
}: {
  logs: boolean;
  initialState: AnyState;
}) {
  const store = createStore({
    schema: {
      default: schema,
      loro: loroSchema
    },
    tasks: [
      () =>
        takeEvery('*', function* logActions(action) {
          if (logs) {
            console.log(action);
          }
        }),
      connectReduxDevToolsExtension({
        name: 'finatr',
        enabled: devtoolsEnabled
      }),
      ...tasks,
      function* () {
        const runtimeStore = yield* expectStore<typeof schema>();
        const metaResult = yield* metaPersistor.rehydrate();
        if (!metaResult.ok) {
          console.error('meta rehydrate failed', metaResult.error);
        }

        // now the settings have been populated; only load the larger document if
        // the user previously enabled persistence.
        // TODO typings: the generic isn't coming through and is only FxMap
        let state = runtimeStore.getState();
        const hasLocalSnapshot =
          typeof localStorage !== 'undefined' &&
          Boolean(localStorage.getItem(localPersistor.key));

        if (state['settings']?.['persist'] || hasLocalSnapshot) {
          yield* localPersistor.rehydrate();

          // If we recovered from an existing snapshot, keep persist enabled so
          // later updates continue writing the document.
          if (hasLocalSnapshot && !state['settings']?.['persist']) {
            yield* schema.update(
              schema.settings.update({ key: 'persist', value: true })
            );
            state = runtimeStore.getState();
          }
        }
        yield* schema.update(schema.loaders.success({ id: PERSIST_LOADER_ID }));
      }
    ]
  });

  return store;
}
