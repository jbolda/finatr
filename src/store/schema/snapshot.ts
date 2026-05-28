import type { Draft } from 'immer';
import type { FxMap, SliceFromSchema, StoreUpdater } from 'starfx';

const SCHEMA_SNAPSHOT = Symbol('schema:snapshot');

export type SchemaSnapshotUpdater<O extends FxMap> = StoreUpdater<
  SliceFromSchema<O>
> & {
  [SCHEMA_SNAPSHOT]: true;
};

export function createSchemaSnapshotUpdater<O extends FxMap>(
  snapshot: SliceFromSchema<O>,
  managedKeys: string[]
): SchemaSnapshotUpdater<O> {
  return Object.assign(
    (draft: Draft<SliceFromSchema<O>>) => {
      const nextState = snapshot as unknown as Record<string, unknown>;
      const draftState = draft as unknown as Record<string, unknown>;

      for (const key of managedKeys) {
        if (!(key in nextState)) {
          delete draftState[key];
        }
      }

      for (const key of managedKeys) {
        if (key in nextState) {
          draftState[key] = nextState[key];
        }
      }
    },
    { [SCHEMA_SNAPSHOT]: true as const }
  );
}

export function isSchemaSnapshotUpdater<O extends FxMap>(
  updater: unknown
): updater is SchemaSnapshotUpdater<O> {
  return (
    typeof updater === 'function' &&
    Reflect.get(updater, SCHEMA_SNAPSHOT) === true
  );
}
