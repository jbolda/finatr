import { test, expect } from '@playwright/experimental-ct-react17';
import isWithinInterval from 'date-fns/fp/isWithinInterval';

test.describe(`testing interval functions`, () => {
  const testInterval = {
    start: new Date(2018, 2, 3),
    end: new Date(2018, 2, 7)
  };
  const testWithin = isWithinInterval(testInterval);

  test(`falls directly within intervals`, () => {
    expect(testWithin(new Date(2018, 2, 4))).toBe(true);
  });

  test(`falls outside intervals`, () => {
    expect(testWithin(new Date(2018, 2, 2))).toBe(false);
  });

  test(`falls directly on start of interval`, () => {
    expect(testWithin(new Date(2018, 2, 3))).toBe(true);
  });

  test(`falls directly on end of interval`, () => {
    expect(testWithin(new Date(2018, 2, 7))).toBe(true);
  });
});
