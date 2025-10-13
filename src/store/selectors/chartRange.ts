import { format } from 'date-fns';
import eachDayOfInterval from 'date-fns/fp/eachDayOfInterval/index.js';
import { createSelector } from 'starfx';

import { schema } from '~/src/store/schema/index.ts';

export const dateRangeWithStrings = createSelector(
  schema.chartRange.select,
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
  schema.chartRange.select,
  schema.accountMeta.select,
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
