import { USD } from '@dinero.js/currencies';
import { test, expect } from '@playwright/experimental-ct-react17';
import { dinero } from 'dinero.js';

import { deriveFIstats } from './stats.ts';

const d = (amount: number) => dinero({ amount, currency: USD });

test.describe(`calculate FI stats`, () => {
  test.describe('first FI milestone', () => {
    test(`calculates half of first FI`, () => {
      const fi = deriveFIstats({
        totalInvest: d(75_000),
        totalDebt: d(25_000),
        dailyExpense: d(0),
        FIconst: 0,
        FIconstIncrease: 0
      });
      expect(fi.percentToFirstFI).toBe(50);
    });

    test(`calculates hitting first FI`, () => {
      const fi = deriveFIstats({
        totalInvest: d(135_000),
        totalDebt: d(35_000),
        dailyExpense: d(0),
        FIconst: 0,
        FIconstIncrease: 0
      });
      expect(fi.percentToFirstFI).toBe(100);
    });

    test(`calculates quarter of first FI`, () => {
      const fi = deriveFIstats({
        totalInvest: d(35_000),
        totalDebt: d(10_000),
        dailyExpense: d(0),
        FIconst: 0,
        FIconstIncrease: 0
      });
      expect(fi.percentToFirstFI).toBe(25);
    });
  });

  test.describe('calculates percentages', () => {
    test.describe('FU Money Considering', () => {
      test(`zero expense`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(0),
          FIconst: 1,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFUMoneyConsidering).toBe(100);
      });

      test(`halfway`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 1,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFUMoneyConsidering).toBe(50);
      });

      test(`goal`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 2,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFUMoneyConsidering).toBe(100);
      });

      test(`surpassed`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 3.2,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFUMoneyConsidering).toBe(160);
      });
    });

    test.describe('FU Money Confident', () => {
      test(`zero expense`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(0),
          FIconst: 1,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFUMoneyConfident).toBe(100);
      });

      test(`halfway`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 1.5,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFUMoneyConfident).toBe(50);
      });

      test(`goal`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 3,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFUMoneyConfident).toBe(100);
      });

      test(`surpassed`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 3.2,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFUMoneyConfident.toPrecision(5)).toBe('106.67');
      });
    });

    test.describe('Half FI', () => {
      test(`zero expense`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(0),
          FIconst: 1,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToHalfFI).toBe(100);
      });

      test(`halfway`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 6.25,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToHalfFI).toBe(50);
      });

      test(`goal`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 12.5,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToHalfFI).toBe(100);
      });

      test(`surpassed`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 14.25,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToHalfFI).toBe(114);
      });
    });

    test.describe('Lean FI', () => {
      test(`zero expense`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(0),
          FIconst: 1,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToLeanFI).toBe(100);
      });

      test(`halfway`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 8.75,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToLeanFI).toBe(50);
      });

      test(`goal`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 17.5,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToLeanFI).toBe(100);
      });

      test(`surpassed`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 18,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToLeanFI.toPrecision(5)).toBe('102.86');
      });
    });

    test.describe('Flex FI', () => {
      test(`zero expense`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(0),
          FIconst: 1,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFlexFI).toBe(100);
      });

      test(`halfway`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 10,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFlexFI).toBe(50);
      });

      test(`goal`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 20,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFlexFI).toBe(100);
      });

      test(`surpassed`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 23,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFlexFI).toBe(115);
      });
    });

    test.describe('FI', () => {
      test(`zero expense`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(0),
          FIconst: 1,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFINumber).toBe(100);
      });

      test(`halfway`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 12.5,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFINumber).toBe(50);
      });

      test(`goal`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 25,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFINumber).toBe(100);
      });

      test(`surpassed`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 28,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFINumber).toBe(112);
      });
    });

    test.describe('Fat FI', () => {
      test(`zero expense`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(0),
          FIconst: 1,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFatFI).toBe(100);
      });

      test(`halfway`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 15,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFatFI).toBe(50);
      });

      test(`goal`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 30,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFatFI).toBe(100);
      });

      test(`surpassed`, () => {
        const fi = deriveFIstats({
          dailyExpense: d(5000),
          FIconst: 42,
          totalDebt: d(0),
          totalInvest: d(0),
          FIconstIncrease: 0
        });
        expect(fi.percentToFatFI).toBe(140);
      });
    });
  });

  test.describe('calculates years', () => {
    test.describe('FU Money Considering', () => {
      // hit 2
      test(`forever`, () => {
        const fi = deriveFIstats({
          FIconst: 1,
          FIconstIncrease: 0,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFUMoneyConsidering).toBe(999);
      });

      test(`partway on start`, () => {
        const fi = deriveFIstats({
          FIconst: 1,
          FIconstIncrease: 0.1,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFUMoneyConsidering).toBe(10);
      });

      test(`partway on increase`, () => {
        const fi = deriveFIstats({
          FIconst: 0.2,
          FIconstIncrease: 1,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFUMoneyConsidering).toBe(1.8);
      });

      test(`goal in one year`, () => {
        const fi = deriveFIstats({
          FIconst: 1.5,
          FIconstIncrease: 0.5,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFUMoneyConsidering).toBe(1);
      });

      test(`surpassed`, () => {
        const fi = deriveFIstats({
          FIconst: 3.2,
          FIconstIncrease: 1,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFUMoneyConsidering).toBe(0);
      });
    });

    test.describe('FU Money Confident', () => {
      // hit 3
      test(`forever`, () => {
        const fi = deriveFIstats({
          FIconst: 1,
          FIconstIncrease: 0,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFUMoneyConfident).toBe(999);
      });

      test(`partway on start`, () => {
        const fi = deriveFIstats({
          FIconst: 1.5,
          FIconstIncrease: 0.1,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFUMoneyConfident).toBe(15);
      });

      test(`partway on increase`, () => {
        const fi = deriveFIstats({
          FIconst: 0.2,
          FIconstIncrease: 1,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFUMoneyConfident).toBe(2.8);
      });

      test(`goal in one year`, () => {
        const fi = deriveFIstats({
          FIconst: 2.75,
          FIconstIncrease: 0.25,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFUMoneyConfident).toBe(1);
      });

      test(`surpassed`, () => {
        const fi = deriveFIstats({
          FIconst: 3.2,
          FIconstIncrease: 1,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFUMoneyConfident).toBe(0);
      });
    });

    test.describe('Half FI', () => {
      // hit 12
      test(`forever`, () => {
        const fi = deriveFIstats({
          FIconst: 1,
          FIconstIncrease: 0,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToHalfFI).toBe(999);
      });

      test(`partway on start`, () => {
        const fi = deriveFIstats({
          FIconst: 9,
          FIconstIncrease: 0.2,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToHalfFI).toBe(17.5);
      });

      test(`partway on increase`, () => {
        const fi = deriveFIstats({
          FIconst: 3,
          FIconstIncrease: 6,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToHalfFI.toPrecision(5)).toBe('1.5833');
      });

      test(`goal in one year`, () => {
        const fi = deriveFIstats({
          FIconst: 11,
          FIconstIncrease: 1.5,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToHalfFI).toBe(1);
      });

      test(`surpassed`, () => {
        const fi = deriveFIstats({
          FIconst: 13.2,
          FIconstIncrease: 1.2,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToHalfFI).toBe(0);
      });
    });

    test.describe('Lean FI', () => {
      // hit 17.5
      test(`forever`, () => {
        const fi = deriveFIstats({
          FIconst: 1,
          FIconstIncrease: 0,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToLeanFI).toBe(999);
      });

      test(`partway on start`, () => {
        const fi = deriveFIstats({
          FIconst: 9,
          FIconstIncrease: 0.2,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToLeanFI).toBe(42.5);
      });

      test(`partway on increase`, () => {
        const fi = deriveFIstats({
          FIconst: 2,
          FIconstIncrease: 6,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToLeanFI.toPrecision(5)).toBe('2.5833');
      });

      test(`goal in one year`, () => {
        const fi = deriveFIstats({
          FIconst: 17,
          FIconstIncrease: 0.5,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToLeanFI).toBe(1);
      });

      test(`surpassed`, () => {
        const fi = deriveFIstats({
          FIconst: 17.8,
          FIconstIncrease: 2.1,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToLeanFI).toBe(0);
      });
    });

    test.describe('Flex FI', () => {
      // hit 20
      test(`forever`, () => {
        const fi = deriveFIstats({
          FIconst: 1,
          FIconstIncrease: 0,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFlexFI).toBe(999);
      });

      test(`partway on start`, () => {
        const fi = deriveFIstats({
          FIconst: 9,
          FIconstIncrease: 0.2,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFlexFI).toBe(55);
      });

      test(`partway on increase`, () => {
        const fi = deriveFIstats({
          FIconst: 3.3,
          FIconstIncrease: 6.2,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFlexFI.toPrecision(5)).toBe('2.6935');
      });

      test(`goal in one year`, () => {
        const fi = deriveFIstats({
          FIconst: 19.5,
          FIconstIncrease: 0.5,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFlexFI).toBe(1);
      });

      test(`surpassed`, () => {
        const fi = deriveFIstats({
          FIconst: 22.4,
          FIconstIncrease: 0.2,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFlexFI).toBe(0);
      });
    });

    test.describe('FI', () => {
      // hit 25
      test(`forever`, () => {
        const fi = deriveFIstats({
          FIconst: 1,
          FIconstIncrease: 0,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFINumber).toBe(999);
      });

      test(`partway on start`, () => {
        const fi = deriveFIstats({
          FIconst: 12,
          FIconstIncrease: 0.2,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFINumber).toBe(65);
      });

      test(`partway on increase`, () => {
        const fi = deriveFIstats({
          FIconst: 3,
          FIconstIncrease: 10,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFINumber).toBe(2.2);
      });

      test(`goal in one year`, () => {
        const fi = deriveFIstats({
          FIconst: 22,
          FIconstIncrease: 3,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFINumber).toBe(1);
      });

      test(`surpassed`, () => {
        const fi = deriveFIstats({
          FIconst: 28.2,
          FIconstIncrease: 1.2,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFINumber).toBe(0);
      });
    });

    test.describe('Fat FI', () => {
      // hit 30
      test(`forever`, () => {
        const fi = deriveFIstats({
          FIconst: 1,
          FIconstIncrease: 0,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFatFI).toBe(999);
      });

      test(`partway on start`, () => {
        const fi = deriveFIstats({
          FIconst: 15,
          FIconstIncrease: 0.2,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFatFI).toBe(75);
      });

      test(`partway on increase`, () => {
        const fi = deriveFIstats({
          FIconst: 6,
          FIconstIncrease: 12,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFatFI).toBe(2);
      });

      test(`goal in one year`, () => {
        const fi = deriveFIstats({
          FIconst: 28.5,
          FIconstIncrease: 1.5,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFatFI).toBe(1);
      });

      test(`surpassed`, () => {
        const fi = deriveFIstats({
          FIconst: 33.2,
          FIconstIncrease: 11.2,
          dailyExpense: d(0),
          totalDebt: d(0),
          totalInvest: d(0)
        });
        expect(fi.yearsToFatFI).toBe(0);
      });
    });
  });
});
