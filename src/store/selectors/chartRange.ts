import { format } from 'date-fns';
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
