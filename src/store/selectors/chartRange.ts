import { format } from 'date-fns';
import eachDayOfInterval from 'date-fns/fp/eachDayOfInterval/index.js';
import { createSelector } from 'starfx';

import { schema } from '~/src/store/schema.ts';

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

export const eachDay = createSelector(schema.chartRange.select, (chartRange) =>
  eachDayOfInterval(chartRange)
);
