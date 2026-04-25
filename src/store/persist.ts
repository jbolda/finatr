import { LoroDoc, LoroMap } from 'loro-crdt';
import {
  Err,
  Ok,
  type Operation,
  type Result,
  type AnyState,
  type Next,
  type UpdaterCtx,
  StoreContext,
  select
} from 'starfx';

import { RootDoc } from './schema/context.ts';
import { createSchemaSnapshotUpdater } from './schema/snapshot.ts';

export const PERSIST_LOADER_ID = '@@starfx/persist';

export interface PersistAdapter<S extends AnyState> {
  getItem(key: string): Operation<Result<Partial<S> | undefined>>;
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

        const parsed = JSON.parse(storage);

        // Persisted format: serialized Uint8Array -> JSON number[]
        if (!Array.isArray(parsed)) {
          throw new Error('Persisted snapshot is not a byte array');
        }

        const retrievedSnapshot = new Uint8Array(parsed);
        return Ok(retrievedSnapshot as unknown as Partial<S>);
      } catch (err: any) {
        console.error('persist getItem parse failed', err);
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
      console.log('rehydrating from storage', { persistedState });
      if (persistedState.value) {
        const stateFromStorage = persistedState.value;
        const newDoc = LoroDoc.fromSnapshot(
          stateFromStorage as unknown as Uint8Array
        );
        const plan = newDoc
          .getMap('root')
          .getOrCreateContainer('sources', new LoroMap())!
          .getOrCreateContainer('local', new LoroMap())!
          .getOrCreateContainer('plan', new LoroMap())!;
        const nextPlanState = plan.toJSON() as AnyState;

        console.log('newDoc', newDoc);
        scope.set(RootDoc, newDoc);

        const loroSchema = store.schemas['loro'];
        if (loroSchema) {
          yield* loroSchema.update(
            createSchemaSnapshotUpdater(
              nextPlanState,
              Object.keys(nextPlanState)
            )
          );
        }
      }

      return Ok(undefined);
    } catch (err: any) {
      console.error('persist rehydrate failed', err);
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

    // only write the document if persistence has been enabled in settings.
    // we avoid importing the schema here to keep the module graph acyclic;
    // the field name is hard‑coded but that’s acceptable given our limited
    // scope.
    const shouldPersist: boolean = yield* select((s: any) => {
      return s?.settings?.persist;
    });
    if (!shouldPersist) {
      return;
    }

    const doc = yield* RootDoc.expect();
    yield* adapter.setItem(key, doc as unknown as Partial<S>);
  };
}
