import { test, expect } from '@playwright/experimental-ct-react17';
import parseISO from 'date-fns/fp/parseISO/index.js';
import startOfDay from 'date-fns/fp/startOfDay/index.js';

import { convertRangeToInterval } from './index.js';

test.describe(`check convertRangeToInterval`, () => {
  test(`returns range start shifted forward`, () => {
    const transaction = { start: `2018-03-22` };
    let graphRange = {
      start: startOfDay(parseISO('2018-01-01')),
      end: startOfDay(parseISO('2018-06-01'))
    };
    let interval = convertRangeToInterval(transaction, graphRange);
    expect(interval.start).toEqual(startOfDay(parseISO('2018-03-22')));
    expect(interval.end).toEqual(startOfDay(parseISO('2018-06-01')));
  });

  test(`returns range start before`, () => {
    const transaction = { start: `2017-08-01` };
    let graphRange = {
      start: startOfDay(parseISO('2018-01-15')),
      end: startOfDay(parseISO('2018-06-01'))
    };
    let interval = convertRangeToInterval(transaction, graphRange);
    expect(interval.start).toEqual(startOfDay(parseISO('2018-01-15')));
    expect(interval.end).toEqual(startOfDay(parseISO('2018-06-01')));
  });

  test(`returns range end shifted back`, () => {
    const transaction = { start: `2018-03-22`, end: '2018-05-02' };
    let graphRange = {
      start: startOfDay(parseISO('2018-01-01')),
      end: startOfDay(parseISO('2018-06-01'))
    };
    let interval = convertRangeToInterval(transaction, graphRange);
    expect(interval.start).toEqual(startOfDay(parseISO('2018-03-22')));
    expect(interval.end).toEqual(startOfDay(parseISO('2018-05-02')));
  });

  test(`returns range end after`, () => {
    const transaction = { start: `2017-08-22`, end: '2018-08-02' };
    let graphRange = {
      start: startOfDay(parseISO('2018-01-15')),
      end: startOfDay(parseISO('2018-06-01'))
    };
    let interval = convertRangeToInterval(transaction, graphRange);
    expect(interval.start).toEqual(startOfDay(parseISO('2018-01-15')));
    expect(interval.end).toEqual(startOfDay(parseISO('2018-06-01')));
  });
});
