import { test, expect } from '@playwright/experimental-ct-react17';

import { toHumanInterest } from './dineroUtils';

test.describe(`toHumaan`, () => {
  test.describe('toHumanInterest', () => {
    test(`leading zero on only decimals`, () => {
      const humanInterest = toHumanInterest({
        amount: 100,
        scale: -5,
        trailingSymbol: '%'
      });
      expect(humanInterest).toBe('0.1%');
    });

    test(`no dot on 10s`, () => {
      const humanInterest = toHumanInterest({
        amount: 10000,
        scale: -5,
        trailingSymbol: '%'
      });
      expect(humanInterest).toBe('10%');
    });

    test(`no dot on whole number`, () => {
      const humanInterest = toHumanInterest({
        amount: 28000,
        scale: -5,
        trailingSymbol: '%'
      });
      expect(humanInterest).toBe('28%');
    });

    test(`no dot on single whole number`, () => {
      const humanInterest = toHumanInterest({
        amount: 1000,
        scale: -5,
        trailingSymbol: '%'
      });
      expect(humanInterest).toBe('1%');
    });

    test(`works with larger decimals`, () => {
      const humanInterest = toHumanInterest({
        amount: 875,
        scale: -5,
        trailingSymbol: '%'
      });
      expect(humanInterest).toBe('0.875%');
    });

    test(`works with whole + decimals`, () => {
      const humanInterest = toHumanInterest({
        amount: 87567,
        scale: -6,
        trailingSymbol: '%'
      });
      expect(humanInterest).toBe('8.7567%');
    });
  });
});
