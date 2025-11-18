import { LoroDoc, LoroMap } from 'loro-crdt';
import {
  Err,
  Ok,
  type Operation,
  type Result,
  type AnyState,
  type Next,
  updateStore,
  type UpdaterCtx,
  StoreContext
} from 'starfx';

import { buildDocSubtree, RootDoc } from './updater';

export const PERSIST_LOADER_ID = '@@starfx/persist';

export interface PersistAdapter<S extends AnyState> {
  getItem(key: string): Operation<Result<Partial<S>>>;
  setItem(key: string, item: Partial<S>): Operation<Result<unknown>>;
  removeItem(key: string): Operation<Result<unknown>>;
}

export interface PersistProps<S extends AnyState> {
  adapter: PersistAdapter<S>;
  key: string;
  rehydrate: () => Operation<Result<unknown>>;
}

export function createLocalStorageAdapter<
  S extends AnyState
>(): PersistAdapter<S> {
  return {
    getItem: function* (key: string) {
      try {
        const storage = localStorage.getItem(key);

        if (!storage) return Ok(undefined);

        // Parse the JSON string back into a regular array
        const retrievedArray = JSON.parse(storage);

        // Convert the regular array back to a Uint8Array
        const retrievedSnapshot = new Uint8Array(retrievedArray);

        console.log(retrievedSnapshot);

        return Ok(retrievedSnapshot);
      } catch (err: any) {
        return Err(err);
      }
    },
    setItem: function* (key: string, s: Partial<S>) {
      const doc = s as unknown as LoroDoc;
      const snapshot = doc.export({ mode: 'snapshot' });

      // Convert Uint8Array to a regular array
      const regularArray = Array.from(snapshot);

      // Convert the regular array to a JSON string
      const jsonString = JSON.stringify(regularArray);

      // Store the JSON string in localStorage
      try {
        localStorage.setItem(key, jsonString);
      } catch (err: any) {
        return Err(err);
      }
      return Ok(undefined);
    },
    removeItem: function* (key: string) {
      localStorage.removeItem(key);
      return Ok(undefined);
    }
  };
}

export function createDocPersistor<S extends AnyState>({
  adapter,
  key = 'starfx'
}: Pick<PersistProps<S>, 'adapter'> &
  Partial<PersistProps<S>>): PersistProps<S> {
  function* rehydrate(): Operation<Result<undefined>> {
    try {
      const persistedState = yield* adapter.getItem(key);
      if (!persistedState.ok) {
        return Err(persistedState.error);
      }

      const store = yield* StoreContext.expect();
      const scope = store.getScope();
      let plan = null;
      if (!persistedState.value) {
        const store = yield* StoreContext.expect();
        const ldoc = yield* RootDoc.expect();
        const root = ldoc.getMap('root');

        const initial = store.getInitialState();
        root.set('settings', Object.entries(initial['settings']));

        // set up a map for all sources
        const sources = root.setContainer('sources', new LoroMap());
        // then a default subdoc for local data
        const local = sources.setContainer('local', new LoroMap());
        plan = local.setContainer('plan', new LoroMap());
        buildDocSubtree({ initial, parent: plan });
        ldoc.commit();
        scope.set(RootDoc, ldoc);
      } else {
        const stateFromStorage = persistedState.value;
        const newDoc = LoroDoc.fromSnapshot(
          stateFromStorage as unknown as Uint8Array
        );
        scope.set(RootDoc, newDoc);

        plan = newDoc
          .getMap('root')
          .getOrCreateContainer('sources', new LoroMap())!
          .getOrCreateContainer('local', new LoroMap())!
          .getOrCreateContainer('plan', new LoroMap())!;
      }

      yield* updateStore<S>(() => {
        return plan.toJSON() as S;
      });

      return Ok(undefined);
    } catch (err: any) {
      return Err(err);
    }
  }

  return {
    key,
    adapter,
    rehydrate
  };
}

export function persistDocMdw<S extends AnyState>({
  adapter,
  key
}: PersistProps<S>) {
  return function* (_: UpdaterCtx<S>, next: Next) {
    yield* next();
    const doc = yield* RootDoc.expect();

    yield* adapter.setItem(key, doc as unknown as Partial<S>);
  };
}
