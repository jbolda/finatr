import { LoroMap } from 'loro-crdt';
import { createSelector } from 'reselect';
import { type IdProp, type BaseSchema, type SliceState } from 'starfx';

interface PropId {
  id: IdProp;
}

interface PropIds {
  ids: IdProp[];
}

type ObjState = Record<string, unknown>;
type TableData<Entity extends ObjState> = Record<IdProp, Entity>;
type PatchEntity<T> = Record<string, Partial<T[keyof T]>>;
export type LoroWriteState = LoroMap<Record<string, unknown>>;
type LoroTableOps = {
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown;
  delete: (key: string) => void;
  clear: () => void;
};

const excludesFalse = <T>(n?: T): n is T => Boolean(n);
type EntityOrFactory<Entity> = Entity | (() => Entity);
const isFactory = <T>(value: T | (() => T)): value is () => T =>
  typeof value === 'function';
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object';

export interface TableSelectors<Entity extends ObjState, S extends ObjState> {
  findById: (d: TableData<Entity>, p: PropId) => Entity | undefined;
  findByIds: (d: TableData<Entity>, p: PropIds) => Entity[];
  tableAsList: (d: TableData<Entity>) => Entity[];
  selectTable: (s: S) => TableData<Entity>;
  selectTableAsList: (state: S) => Entity[];
  selectById: (s: S, p: PropId) => Entity | undefined;
  selectByIds: (s: S, p: PropIds) => Entity[];
}

function tableSelectors<
  Entity extends ObjState,
  S extends ObjState,
  Empty extends EntityOrFactory<Entity> | undefined = EntityOrFactory<Entity>
>(selectTable: (s: S) => TableData<Entity>, empty: Empty) {
  const tableAsList = ((data) =>
    Object.values(data).filter(excludesFalse)) satisfies TableSelectors<
    Entity,
    S
  >['tableAsList'];

  const findById = ((data, { id }) => data[id]) satisfies TableSelectors<
    Entity,
    S
  >['findById'];

  const findByIds = ((data, { ids }) =>
    ids.map((id) => data[id]).filter(excludesFalse)) satisfies TableSelectors<
    Entity,
    S
  >['findByIds'];

  const selectById = ((state, { id }) => {
    const data = selectTable(state);
    return findById(data, { id });
  }) satisfies TableSelectors<Entity, S>['selectById'];

  return {
    findById,
    findByIds,
    tableAsList,
    selectTable,
    selectTableAsList: createSelector(selectTable, (data) => tableAsList(data)),
    selectById: !empty
      ? selectById
      : (state, { id }) => {
          if (isFactory(empty)) {
            return selectById(state, { id }) || (empty() as Entity);
          }
          return selectById(state, { id }) || (empty as Entity);
        },
    selectByIds: createSelector(
      selectTable,
      (_, p: PropIds) => p.ids,
      (data, ids) => findByIds(data, { ids })
    )
  } satisfies TableSelectors<Entity, S>;
}

export interface TableActions<
  Entity extends ObjState,
  W extends LoroWriteState = LoroWriteState
> {
  add: (e: SliceState<Entity>) => (s: W) => void;
  set: (e: SliceState<Entity>) => (s: W) => void;
  remove: (ids: IdProp[]) => (s: W) => void;
  patch: (e: PatchEntity<SliceState<Entity>>) => (s: W) => void;
  merge: (e: PatchEntity<SliceState<Entity>>) => (s: W) => void;
  reset: () => (s: W) => void;
}

export interface TableOutput<
  Entity extends ObjState,
  S extends ObjState,
  W extends LoroWriteState = LoroWriteState
> extends BaseSchema<Record<IdProp, Entity>>,
    TableActions<Entity, W>,
    TableSelectors<Entity, S> {
  schema: 'table';
  initialState: Record<IdProp, Entity>;
  empty: Entity | undefined;
}

export function createTable<
  Entity extends ObjState,
  S extends ObjState = ObjState,
  W extends LoroWriteState = LoroWriteState
>({
  name,
  empty,
  initialState
}: {
  name: keyof S;
  initialState?: Record<IdProp, Entity>;
  empty?: Entity | (() => Entity);
}): TableOutput<Entity, S, W> {
  const tableInitialState: TableData<Entity> = initialState ?? {};
  const tableName = String(name);
  const selectors = tableSelectors<Entity, S, typeof empty>(
    (s) => (s[name] as TableData<Entity>) ?? {},
    empty
  );

  const getTableContainer = (state: W) =>
    state.getOrCreateContainer(
      tableName,
      new LoroMap()
    ) as unknown as LoroTableOps;

  return {
    schema: 'table',
    name: name as string,
    initialState: tableInitialState,
    empty: empty === undefined ? undefined : isFactory(empty) ? empty() : empty,
    add: (entities) => (state) => {
      const table = getTableContainer(state);
      for (const id of Object.keys(entities)) {
        table.set(id, entities[id]);
      }
    },
    set: (entities) => (state) => {
      const table = getTableContainer(state);
      table.clear();
      for (const id of Object.keys(entities)) {
        table.set(id, entities[id]);
      }
    },
    remove: (ids) => (state) => {
      const table = getTableContainer(state);
      for (const id of ids) {
        table.delete(String(id));
      }
    },
    patch: (entities) => (state) => {
      const table = getTableContainer(state);
      for (const id of Object.keys(entities)) {
        const existing = table.get(id);
        const patch = entities[id];
        if (existing && patch && isRecord(existing)) {
          table.set(id, { ...existing, ...patch });
        }
      }
    },
    merge: (entities) => (state) => {
      const table = getTableContainer(state);
      for (const id of Object.keys(entities)) {
        const src = entities[id];
        if (!src || !isRecord(src)) continue;
        const srcRecord = src as Record<string, unknown>;

        const current = table.get(id);
        const target: Record<string, unknown> = isRecord(current)
          ? { ...current }
          : {};

        for (const prop of Object.keys(srcRecord)) {
          const value = srcRecord[prop];
          if (Array.isArray(value)) {
            const arr = Array.isArray(target[prop]) ? target[prop] : [];
            target[prop] = [...arr, ...value];
          } else {
            target[prop] = value;
          }
        }

        table.set(id, target);
      }
    },
    reset: () => (state) => {
      const table = getTableContainer(state);
      table.clear();
      for (const id of Object.keys(tableInitialState)) {
        table.set(id, tableInitialState[id]);
      }
    },
    ...selectors
  };
}

export function table<
  Entity extends ObjState = ObjState,
  S extends ObjState = ObjState,
  W extends LoroWriteState = LoroWriteState
>(
  options: {
    initialState?: Record<IdProp, Entity>;
    empty?: Entity | (() => Entity);
  } = {}
): (n: string) => TableOutput<Entity, S, W> {
  const { initialState, empty } = options;
  return (name: string) =>
    createTable<Entity, S, W>({
      name: name as keyof S,
      empty,
      initialState
    });
}
