import { CalendarDate } from '@internationalized/date';
import { parse } from 'date-fns';
import { addYears } from 'date-fns';
import { format } from 'date-fns';

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
    if (start > ctx.payload.snapshotDate) {
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');
      yield* schema.update(
        schema.chartRange.set({ start: startStr, end: endStr })
      );
    }
  }
  yield* next();
});
