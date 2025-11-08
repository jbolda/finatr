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

export const buildDocSubtree = ({
  initial,
  parent
}: {
  initial: AnyState;
  parent: Y.Map<any>;
}) => {
  for (let [key, value] of Object.entries(initial)) {
    console.log('building subtree key', key, value);
    const itemMap = new Y.Map();
    if (Object.keys(value).length !== 0) {
      for (let [childKey, childValue] of Object.entries(value)) {
        itemMap.set(childKey, childValue);
      }
    }
    parent.set(key, itemMap);
  }
};

export const yjsStoreUpdater = <S extends AnyState>(
  setState: (state: S) => void,
  _getState: () => S,
  getInitialState: () => S
) => {
  const ydoc = new Y.Doc({ autoLoad: true });
  const root = ydoc.getMap();

  // const wsProvider = new WebsocketProvider(
  //   '',
  //   // 'ws://localhost:1234',
  //   'my-roomname',
  //   ydoc,
  //   { connect: false }
  // );
  // const idbProvider = new IndexeddbPersistence('finatr', ydoc);

  const initial = getInitialState();
  if (!root.has('settings')) {
    const itemMap = new Y.Map(Object.entries(initial['settings']));
    root.set('settings', itemMap);
  }

  if (!root.has('sources')) {
    // set up a map for all sources
    const sources = new Y.Map();
    // then a default subdoc for local data
    const local = new Y.Doc();
    root.set('sources', sources);
    if (local.getMap().size === 0) {
      const plan = new Y.Map();
      local.getMap().set('plan', plan);
      buildDocSubtree({ initial, parent: plan });
      if (!root.has('current')) {
        const copy = new Y.Doc({ guid: local.guid });
        root.set('current', copy);
      }
    }
  }

  root.observeDeep((_events, _transaction) => {
    // const current = root.get('current');
    // if (current && root.get(current)) {
    //   console.log('observed deep', current);
    //   setState(root.get(current).toJSON() as S);
    // }
  });

  function* updateMdw(ctx: UpdaterCtx<S>, next: Next) {
    ydoc.transact(() => {
      const ups = Array.isArray(ctx.updater) ? ctx.updater : [ctx.updater];
      for (let up of ups) {
        // @ts-expect-error not quite type compatible yet
        up(root.get('current'));
      }
    });
    // we don't need to set the state as the observer will take care of it
    yield* next();
  }

  function* initializeStore(): Operation<void> {
    // yield* yjsWebsocket.set(wsProvider);
    // yield* yjsIndexedDB.set(idbProvider);
    console.log('entries', ...root.entries());

    const current = root.get('current');
    current.load();
    console.log('current', current);
    console.log('current map', current.getMap().toJSON());

    if (current) {
      setState(current.getMap().toJSON() as S);
    }
  }
  return { updateMdw, initializeStore };
};
