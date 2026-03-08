import { format, parseISO } from 'date-fns';
import eachDayOfInterval from 'date-fns/fp/eachDayOfInterval/index.js';
import { createSelector } from 'starfx';

import {
  defaultChartBarRange,
  loroSchema as schema
} from '~/store/schema/index.ts';

export const accountMetaFromSerialized = createSelector(
  schema.accountMeta.select,
  (accountMeta) => {
    const snapshotDate = parseISO(accountMeta.snapshotDate);
    return {
      snapshotDate
    };
  }
);

export const chartRangeFromSerialized = createSelector(
  schema.chartRange.select,
  accountMetaFromSerialized,
  (chartRange, accountMeta) => {
    const parsed = {
      start: parseISO(chartRange.start),
      end: parseISO(chartRange.end)
    };
    if (accountMeta.snapshotDate && parsed.start < accountMeta.snapshotDate) {
      const floorDateRange = defaultChartBarRange(accountMeta.snapshotDate);
      parsed.start = parseISO(floorDateRange.start);
      parsed.end = parseISO(floorDateRange.end);
    }

    return parsed;
  }
);

export const dateRangeWithStrings = createSelector(
  chartRangeFromSerialized,
  (chartRange) => {
    const { start, end } = chartRange;
    return {
      start,
      startString: format(start, 'yyyy-MM-dd'),
      end,
      endString: format(end, 'yyyy-MM-dd')
    };
  }
);

export const dateRangeConsideringAccountStart = createSelector(
  chartRangeFromSerialized,
  accountMetaFromSerialized,
  (chartRange, accountMeta) => {
    return {
      // start can't be earlier than the snapshot date
      //  so we use the snapshot date if it exists
      //  and our date range is larger than the interval from
      //  the start to end as start can be after the snapshot date
      start: accountMeta.snapshotDate
        ? accountMeta.snapshotDate
        : chartRange.start,
      end: chartRange.end
    };
  }
);

export const eachDay = createSelector(
  dateRangeConsideringAccountStart,
  (chartRange) => eachDayOfInterval(chartRange)
);
