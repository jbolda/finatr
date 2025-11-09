import { LoroDoc, LoroMap } from 'loro-crdt';
import {
  type AnyState,
  type UpdaterCtx,
  type Next,
  type Operation
} from 'starfx';

export const buildDocSubtree = ({
  initial,
  parent
}: {
  initial: AnyState;
  parent: LoroMap;
}) => {
  for (let [key, value] of Object.entries(initial)) {
    console.log('building subtree key', key, value);
    if (Object.keys(value).length !== 0) {
      parent.set(key, value);
    } else if (['accounts', 'transactions'].includes(key)) {
      parent.setContainer(key, new LoroMap());
    }
  }
};

export const loroStoreUpdater = <S extends AnyState>(
  setState: (state: S) => void,
  _getState: () => S,
  getInitialState: () => S
) => {
  const ldoc = new LoroDoc();
  const root = ldoc.getMap('root');

  const initial = getInitialState();
  root.set('settings', Object.entries(initial['settings']));

  // set up a map for all sources
  root.setContainer('sources', new LoroMap());
  // then a default subdoc for local data
  const local = root.setContainer('local', new LoroMap());
  const plan = local.setContainer('plan', new LoroMap());
  buildDocSubtree({ initial, parent: plan });
  ldoc.commit();

  root.subscribe(() => {
    const data = plan.toJSON() as S;
    console.log('loro doc updated', data);
    setState(data);
  });

  function* updateMdw(ctx: UpdaterCtx<S>, next: Next) {
    const ups = Array.isArray(ctx.updater) ? ctx.updater : [ctx.updater];
    for (let up of ups) {
      up(plan as unknown as S);
    }
    ldoc.commit();
    yield* next();
  }

  function* initializeStore(): Operation<void> {
    // setState(root.toJSON() as S);
  }
  return { updateMdw, initializeStore };
};
