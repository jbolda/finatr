import {
  type AnyState,
  type UpdaterCtx,
  type Next,
  type Operation,
  createContext
} from 'starfx';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

export const yjsWebsocket = createContext('yjs-ws');
export const yjsIndexedDB = createContext('yjs-idb');

export const yjsStoreUpdater = <S extends AnyState>(
  setState: (state: S) => void,
  _getState: () => S,
  getInitialState: () => S
) => {
  const ydoc = new Y.Doc({ autoLoad: true });
  const root = ydoc.getMap();

  const wsProvider = new WebsocketProvider(
    '',
    // 'ws://localhost:1234',
    'my-roomname',
    ydoc,
    { connect: false }
  );
  const idbProvider = new IndexeddbPersistence('finatr', ydoc);

  // wsProvider.on('status', (event) => {
  //   console.log(event.status); // logs "connected" or "disconnected"
  // });
  // idbProvider.on('synced', () => {
  //   console.log('content from the database is loaded');
  // });

  const initial = getInitialState();
  for (let objDoc of ['settings', 'auth', 'accountMeta', 'chartRange']) {
    const item = initial[objDoc];
    const itemMap = new Y.Map(Object.entries(item));
    root.set(objDoc, itemMap);
  }

  for (let objTable of [
    'transactions',
    'accounts',
    'incomeReceived',
    'incomeExpected'
  ]) {
    const item = initial[objTable];
    const itemMap = new Y.Map(Object.entries(item));
    root.set(objTable, itemMap);
  }

  root.observeDeep((_events, _transaction) => {
    setState(root.toJSON() as S);
  });

  function* updateMdw(ctx: UpdaterCtx<S>, next: Next) {
    ydoc.transact(() => {
      const ups = Array.isArray(ctx.updater) ? ctx.updater : [ctx.updater];
      for (let up of ups) {
        // @ts-expect-error not quite type compatible yet
        up(root);
      }
    });
    setState(root.toJSON() as S);
    yield* next();
  }

  const initializeStore: () => Operation<void> = function* () {
    yield* yjsWebsocket.set(wsProvider);
    yield* yjsIndexedDB.set(idbProvider);
    setState(root.toJSON() as S);
  };
  return { updateMdw, initializeStore };
};
