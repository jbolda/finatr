import {
  Callable,
  createStore,
  createLocalStorageAdapter,
  createPersistor,
  parallel,
  PERSIST_LOADER_ID,
  persistStoreMdw,
  take,
  takeEvery
} from 'starfx';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

import {
  AppState,
  initialState as schemaInitialState,
  schema
} from './schema.ts';
import { connectReduxDevToolsExtension } from './thunks/devtools.ts';
import { sync, tasks, thunks } from './thunks/index.ts';
import { reconcilerWithReconstitution } from './utils/reconcilerWithReconstitution.ts';
import { applyPatch, applyYEvent } from './yjs/index.ts';

const protocol = 'wss'; // window.location.protocol === 'https' ? 'wss' : 'ws';
const ydoc = new Y.Doc();
const provider = new WebrtcProvider('your-room-name', ydoc, {
  signaling: [`${protocol}://demos.yjs.dev/ws`],
  password: 'optional-room-password'
});
// array of numbers which produce a sum
const yarray = ydoc.getArray('count');
const ymap = ydoc.getMap<{ thing: string }>('list');

const yjsAllowlist: (keyof typeof schema)[] = ['count', 'list'];

const devtoolsEnabled = true;
export function setupStore({ logs = true, initialState = {} }) {
  const persistor = createPersistor({
    key: 'finatr',
    adapter: createLocalStorageAdapter<AppState>(),
    reconciler: reconcilerWithReconstitution,
    allowlist: [
      'settings',
      'chartRange',
      'accounts',
      'transactions',
      'incomeReceived',
      'incomeExpected',
      'list'
    ]
  });

  const store = createStore({
    initialState: {
      ...schemaInitialState,
      ...initialState
    },
    middleware: [persistStoreMdw(persistor)]
  });

  const tsks: Callable<unknown>[] = [];
  if (logs) {
    // log all actions dispatched
    tsks.push(function* logActions() {
      while (true) {
        const action = yield* take('*');
        console.log('everyActionLogger', action);
      }
    });
  }

  tsks.push(function* syncWithYjs() {
    for (let allowedTypeKey of yjsAllowlist) {
      const allowedType = ydoc.share.get(allowedTypeKey);
      if (!allowedType)
        throw new Error(`${allowedTypeKey} is not part of ydoc`);
      allowedType.observe((event) => {
        if (!event.transaction.local) {
          store.dispatch(
            sync([
              schema.list.set(
                // @ts-expect-error type index issue but :shrug:
                applyYEvent(store.getState()[allowedTypeKey], event)
              )
            ])
          );
        }
      });
    }

    // sync immerjs changes to Yjs
    yield* takeEvery('store', function* (action) {
      const patches = action.payload?.patches;
      // meta is reliant on the patch to `schema.update()`
      if (!patches || action.payload?.meta?.sync) return;

      try {
        for (const patch of patches) {
          if (yjsAllowlist.includes(patch.path[0])) {
            applyPatch(ydoc, patch);
          }
        }
      } catch (error) {
        console.error(error);
      }
    });
  });

  tsks.push(
    thunks.bootup,
    connectReduxDevToolsExtension({
      name: 'finatr',
      store,
      enabled: devtoolsEnabled
    }),
    ...tasks
  );

  store.run(function* () {
    yield* persistor.rehydrate();
    const group = yield* parallel(tsks);
    yield* schema.update(schema.loaders.success({ id: PERSIST_LOADER_ID }));
    yield* group;
  });

  return store;
}
