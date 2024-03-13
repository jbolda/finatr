import { format } from 'date-fns';
import { createSelector } from 'starfx/store';

import { schema } from '~/src/store/schema.ts';

export const dateRangeWithStrings = createSelector(
  schema.chartBarRange.select,
  (graphRange) => {
    const { start, end } = graphRange;
    return {
      start,
      startString: format(start, 'yyyy-MM-dd'),
      end,
      endString: format(end, 'yyyy-MM-dd')
    };
  }
);
