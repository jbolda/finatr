import { CalendarDate } from '@internationalized/date';
import { parse } from 'date-fns';
import { addYears } from 'date-fns';

import { schema } from '../schema/index.ts';
import { thunks } from './foundation.ts';

export const updateChartDateRange = thunks.create<{
  calendar: CalendarDate | null;
  snapshotDate: Date;
}>('chartDateRange:update', function* (ctx, next) {
  if (ctx.payload && ctx.payload.calendar) {
    const startDateInput = ctx.payload.calendar.toString();
    const start = parse(startDateInput, 'yyyy-MM-dd', new Date());
    const end = addYears(start, 1);

    // check minimum date here rather than in the component
    if (start > ctx.payload.snapshotDate)
      yield* schema.update(schema.chartRange.set({ start, end }));
  }
  yield* next();
});
