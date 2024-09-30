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

const protocol = window.location.protocol === 'https' ? 'wss' : 'ws';
const ydoc = new Y.Doc();
const provider = new WebrtcProvider('your-room-name', ydoc, {
  signaling: [
    `${protocol}//signaling.yjs.dev`,
    `${protocol}//demos.yjs.dev`,
    `${protocol}//y-webrtc-signaling-eu.herokuapp.com`,
    `${protocol}//y-webrtc-signaling-us.herokuapp.com`
  ],
  password: 'optional-room-password'
});
// array of numbers which produce a sum
const yarray = ydoc.getArray('count');
const ymap = ydoc.getMap<{ thing: string }>('list');

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
      'incomeExpected'
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
    // sync Yjs changes to immerjs
    // ydoc.on('update', (update, origin, doc) => {
    //   console.log({ update, origin, doc });
    // });
    // ydoc.on('update', (update, origin, doc) => {
    //   console.log({ update, origin, doc });
    // });
    // ydoc.on('afterAllTransactions', (doc, transactions) => {
    //   console.log({ doc, transactions, ydoc });
    // });
    ymap.observe((event) => {
      console.log({ event, immerState: store.getState() });
      store.dispatch(
        sync([schema.list.set(applyYEvent(store.getState().list, event))])
      );
    });

    // sync immerjs changes to Yjs
    yield* takeEvery('store', function* (action) {
      const patches = action.payload?.patches;
      if (!patches) return;

      console.log({
        action,
        ymapAsJSONBefore: ymap.toJSON()
      });
      try {
        for (const patch of patches) {
          // be cheeky and hard code a guard
          if (patch.path[0] === 'list' && patch.op !== 'replace') {
            applyPatch(ydoc, patch);
          }
        }
      } catch (error) {
        console.error(error);
      }
      console.log({ ymapAsJSON: ymap.toJSON() });
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
