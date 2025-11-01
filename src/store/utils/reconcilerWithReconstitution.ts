import { parseJSON } from 'date-fns';

import { defaultChartBarRange } from '../schema';
import { redinero } from './dineroUtils.ts';

export function reconstitute<Item>(_sliceName: string, item: unknown): Item {
  if (!item || (typeof item !== 'object' && Object.entries(item).length > 0))
    return item as Item;

  const reconstituted: Record<string, any> = { ...item };
  for (const [key, value] of Object.entries(item)) {
    if (value && typeof value === 'object') {
      if ('amount' in value) {
        reconstituted[key] = redinero(value);
      }
    }
  }
  return reconstituted as Item;
}

export function reconstituteField<Item>(item: unknown, fields: string[]): Item {
  if (!item || typeof item !== 'object') return item as Item;

  const source = item as Record<string, any>;
  const reconstituted = { ...source };
  for (const field of fields) {
    const value = source[field];
    if (value && typeof value === 'object') {
      if ('amount' in value) {
        reconstituted[field] = redinero(value);
      }
    }
  }
  return reconstituted as Item;
}

export function reconcilerWithReconstitution(original: any, persisted: any) {
  const reconstituted = { ...persisted };
  const sliceNames = ['accounts', 'transactions'];

  for (const sliceName of sliceNames) {
    if (sliceName in persisted) {
      for (const [key, item] of Object.entries(persisted[sliceName])) {
        const updatedData = reconstitute(sliceName, item);
        reconstituted[sliceName][key] = updatedData;
      }
    }
  }

  if (reconstituted.chartRange) {
    reconstituted.chartRange = {
      start: parseJSON(reconstituted.chartRange.start),
      end: parseJSON(reconstituted.chartRange.end)
    };
  }
  if (reconstituted.accountMeta) {
    reconstituted.accountMeta = {
      snapshotDate: parseJSON(reconstituted.accountMeta.snapshotDate)
    };

    // Ensure the chart range is not before the snapshot date
    // for form ensures this, but the data here may not match this expectation
    // reset the chart range off the snapshot date if it is before
    if (
      reconstituted.chartRange.start < reconstituted.accountMeta.snapshotDate
    ) {
      const floorDateRange = defaultChartBarRange(
        reconstituted.accountMeta.snapshotDate
      );
      reconstituted.chartRange.start = floorDateRange.start;
      reconstituted.chartRange.end = floorDateRange.end;
    }
  }
  return { ...original, ...reconstituted };
}
