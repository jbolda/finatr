import { CalendarDate } from '@internationalized/date';
import { parse } from 'date-fns';
import { addYears } from 'date-fns';

import { schema } from '../schema.ts';
import { thunks } from './foundation.ts';

export const updateChartDateRange = thunks.create<CalendarDate | null>(
  'chartDateRange:update',
  function* (ctx, next) {
    if (ctx.payload) {
      const startDateInput = ctx.payload.toString();
      const start = parse(startDateInput, 'yyyy-MM-dd', new Date());
      const end = addYears(start, 1);

      yield* schema.update(schema.chartRange.set({ start, end }));
    }
    yield* next();
  }
);
