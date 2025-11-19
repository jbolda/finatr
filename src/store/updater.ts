import { LoroDoc, LoroMap } from 'loro-crdt';
import {
  type AnyState,
  type UpdaterCtx,
  type Next,
  type Operation,
  createContext,
  type Scope
} from 'starfx';

export const RootDoc = createContext<LoroDoc>('starfx:loroDoc');

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
  getScope: () => Scope,
  _getInitialState: () => S
) => {
  function* updateMdw(ctx: UpdaterCtx<S>, next: Next) {
    const root = yield* RootDoc.get();
    if (!root) {
      console.error('LoroDoc not found in context');
      throw new Error('LoroDoc not found in context');
    }
    const plan = root
      .getMap('root')
      .getOrCreateContainer('sources', new LoroMap())!
      .getOrCreateContainer('local', new LoroMap())!
      .getOrCreateContainer('plan', new LoroMap())!;
    const ups = Array.isArray(ctx.updater) ? ctx.updater : [ctx.updater];
    for (let up of ups) {
      up(plan as unknown as S);
    }
    root.commit();
    setState(plan.toJSON() as S);
    yield* next();
  }

  function* initializeStore(): Operation<void> {
    const ldoc = new LoroDoc();

    const scope = getScope();
    scope.set(RootDoc, ldoc);
  }
  return { updateMdw, initializeStore };
};
