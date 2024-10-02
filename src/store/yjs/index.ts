import { type Patch } from 'immer';
import * as Y from 'yjs';

import { JSONArray, JSONObject, JSONValue } from './types';
import {
  isJSONArray,
  isJSONObject,
  notImplemented,
  toPlainValue,
  toYDataType
} from './utils.ts';

export type Snapshot = JSONObject | JSONArray;

export function applyYEvent<T extends JSONValue>(
  base: T,
  event: Y.YEvent<any>
) {
  if (event instanceof Y.YMapEvent && isJSONObject(base)) {
    // @ts-expect-error JSONValue doesn't play nice here
    const nextBase = { ...base };
    const source = event.target as Y.Map<any>;

    event.changes.keys.forEach((change, key) => {
      switch (change.action) {
        case 'add':
        case 'update':
          nextBase[key] = toPlainValue(source.get(key));
          break;
        case 'delete':
          delete nextBase[key];
          break;
      }
    });
    return nextBase;
  } else if (event instanceof Y.YArrayEvent && isJSONArray(base)) {
    const arr = base as unknown as any[];

    let retain = 0;
    event.changes.delta.forEach((change) => {
      if (change.retain) {
        retain += change.retain;
      }
      if (change.delete) {
        arr.splice(retain, change.delete);
      }
      if (change.insert) {
        if (Array.isArray(change.insert)) {
          arr.splice(retain, 0, ...change.insert.map(toPlainValue));
        } else {
          arr.splice(retain, 0, toPlainValue(change.insert));
        }
        retain += change.insert.length;
      }
    });
    return arr;
  }
}

const PATCH_REPLACE = 'replace';
const PATCH_ADD = 'add';
const PATCH_REMOVE = 'remove';

export function applyPatch(
  target: Y.Map<any> | Y.Array<any> | Y.Doc,
  patch: Patch
) {
  const { path, op, value } = patch;

  if (!path.length) {
    if (op !== PATCH_REPLACE) {
      notImplemented('no path, add or remove');
    }

    if (target instanceof Y.Map && isJSONObject(value)) {
      target.clear();
      for (const k in value) {
        target.set(k, toYDataType(value[k]));
      }
    } else if (target instanceof Y.Array && isJSONArray(value)) {
      target.delete(0, target.length);
      target.push(value.map(toYDataType));
    } else {
      notImplemented('no path, not Map or Array');
    }

    return;
  }

  let base = target;
  for (let i = 0; i < path.length - 1; i++) {
    const step = path[i];
    base = base.get(step as never);
  }

  const property = path[path.length - 1];

  if (property === '@@starfx/persist') return;

  if (base instanceof Y.Map && typeof property === 'string') {
    switch (op) {
      case PATCH_ADD:
      // skip this for now to cheekily avoid the loop
      case PATCH_REPLACE:
        base.set(property, toYDataType(value));
        break;
      case PATCH_REMOVE:
        base.delete(property);
        break;
    }
  } else if (base instanceof Y.Array && typeof property === 'string') {
    switch (op) {
      case PATCH_ADD:
        base.push([toYDataType(value)]);
        break;
    }
  } else if (base instanceof Y.Array && typeof property === 'number') {
    switch (op) {
      case PATCH_ADD:
        base.insert(property, [toYDataType(value)]);
        break;
      case PATCH_REPLACE:
        base.delete(property);
        base.insert(property, [toYDataType(value)]);
        break;
      case PATCH_REMOVE:
        base.delete(property);
        break;
    }
  } else if (base instanceof Y.Array && property === 'length') {
    if (value < base.length) {
      const diff = base.length - value;
      base.delete(value, diff);
    }
  } else {
    notImplemented('not specific Map/Array property, or non-standard');
  }
}
