import { parseJSON } from 'date-fns';
import { dinero } from 'dinero.js';

import { defaultChartBarRange } from '../schema';

function reconstitute(sliceName: string, item: unknown) {
  if (!item || (typeof item !== 'object' && Object.entries(item).length > 0))
    return item;

  const reconstituted: Record<string, any> = { ...item };
  for (const [key, value] of Object.entries(item)) {
    if (value && typeof value === 'object') {
      if ('amount' in value && 'currency' in value && 'scale' in value) {
        reconstituted[key] = dinero(value);
      }
    }
  }
  return reconstituted;
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
