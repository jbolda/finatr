import type { AnyState, UpdaterCtx, Next, Operation } from 'starfx';
import * as Y from 'yjs';

export const yjsStoreUpdater = <S extends AnyState>(
  setState: (state: S) => void,
  getState: () => S,
  getInitialState: () => S
) => {
  console.log('Creating Y.Doc');
  const ydoc = new Y.Doc({ autoLoad: true });
  const root = ydoc.getMap();

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

  root.observeDeep((events, transaction) => {
    console.log('Y.Doc changed', { events, transaction });
    setState(root.toJSON() as S);
  });

  function* updateMdw(ctx: UpdaterCtx<S>, next: Next) {
    console.log({ ctx, next });
    ydoc.transact(() => {
      const ups = Array.isArray(ctx.updater) ? ctx.updater : [ctx.updater];
      for (let up of ups) {
        up(root);
      }
    });
    setState(root.toJSON() as S);
    yield* next();
  }

  const initializeStore: () => Operation<void> = function* () {
    setState(root.toJSON() as S);
  };
  return { updateMdw, initializeStore };
};
