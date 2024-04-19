import { USD } from '@dinero.js/currencies';
import {
  dinero,
  add,
  subtract,
  multiply,
  equal,
  normalizeScale,
  toSnapshot,
  trimScale,
  type Dinero
} from 'dinero.js';
import { createSelector } from 'starfx';

import { schema } from '../schema';

const ratioAmounts = (r1, r2): number => {
  const [sc1, sc2] = normalizeScale([r1, r2]);
  const sc1s = toSnapshot(sc1);
  const sc2s = toSnapshot(sc2);
  return sc1s.amount / sc2s.amount;
};

export const deriveDailies = (transactions) => {
  const zero = dinero({ amount: 0, currency: USD });

  const income = transactions.reduce(
    (accumulator, d) =>
      d.type === 'income' ? add(d.dailyRate, accumulator) : accumulator,
    zero
  );

  const expense = transactions.reduce(
    (accumulator, d) =>
      d.type === 'expense' ? add(d.dailyRate, accumulator) : accumulator,
    zero
  );

  return { income, expense };
};

export const deriveFIstats = ({
  totalDebt,
  dailyExpense,
  totalInvest,
  FIconst,
  FIconstIncrease
}: {
  totalDebt: Dinero<number>;
  dailyExpense: Dinero<number>;
  totalInvest: Dinero<number>;
  FIconst: number;
  FIconstIncrease: number;
}) => {
  const zero = dinero({ amount: 0, currency: USD });
  const FIconstpercent = (FIconst ?? 0) * 100;

  return {
    // this can reasonable use debt as it is a first milestone
    //   and has a bit of a basis in a net worth type calculation
    percentToFirstFI: ratioAmounts(
      multiply(subtract(totalInvest, totalDebt), 100),
      dinero({ amount: 100_000, currency: USD })
    ),

    // the remaining calculations do not consider debt as it is more than likely
    //  already covered in the expenses, we are conservatively expecting
    //  that debt payment to continue forever with these high level numbers
    percentToFUMoneyConsidering: equal(dailyExpense, zero)
      ? 100
      : FIconstpercent / 2,
    yearsToFUMoneyConsidering:
      FIconst >= 2
        ? 0
        : FIconstIncrease === 0
          ? 999
          : (2 - FIconst) / FIconstIncrease,

    percentToFUMoneyConfident: equal(dailyExpense, zero)
      ? 100
      : FIconstpercent / 3,
    yearsToFUMoneyConfident:
      FIconst >= 3
        ? 0
        : FIconstIncrease === 0
          ? 999
          : (3 - FIconst) / FIconstIncrease,

    percentToHalfFI: equal(dailyExpense, zero) ? 100 : FIconstpercent / 12.5,
    yearsToHalfFI:
      FIconst >= 12.5
        ? 0
        : FIconstIncrease === 0
          ? 999
          : (12.5 - FIconst) / FIconstIncrease,

    percentToLeanFI: equal(dailyExpense, zero) ? 100 : FIconstpercent / 17.5,
    yearsToLeanFI:
      FIconst >= 17.5
        ? 0
        : FIconstIncrease === 0
          ? 999
          : (17.5 - FIconst) / FIconstIncrease,

    percentToFlexFI: equal(dailyExpense, zero) ? 100 : FIconstpercent / 20,
    yearsToFlexFI:
      FIconst >= 20
        ? 0
        : FIconstIncrease === 0
          ? 999
          : (20 - FIconst) / FIconstIncrease,

    percentToFINumber: equal(dailyExpense, zero) ? 100 : FIconstpercent / 25,
    yearsToFINumber:
      FIconst >= 25
        ? 0
        : FIconstIncrease === 0
          ? 999
          : (25 - FIconst) / FIconstIncrease,

    percentToFatFI: equal(dailyExpense, zero) ? 100 : FIconstpercent / 30,
    yearsToFatFI:
      FIconst >= 30
        ? 0
        : FIconstIncrease === 0
          ? 999
          : (30 - FIconst) / FIconstIncrease
  };
};

export const determineFI = ({
  totalExpense,
  totalInvest,
  totalInvestInterest
}: {
  totalExpense: Dinero<number>;
  totalInvest: Dinero<number>;
  totalInvestInterest: Dinero<number>;
}) => {
  const zero = dinero({ amount: 0, currency: USD });
  const FIconst = equal(totalExpense, zero)
    ? 100
    : ratioAmounts(totalInvest, totalExpense);

  const increase = equal(totalExpense, zero)
    ? 100
    : ratioAmounts(add(totalInvest, totalInvestInterest), totalExpense) -
      FIconst;

  return { constant: FIconst, increase };
};

export const financialStats = createSelector(
  schema.transactions.selectTableAsList,
  schema.accounts.selectTableAsList,
  (transactions, accounts) => {
    const zero = dinero({ amount: 0, currency: USD });
    const daily = deriveDailies(transactions);

    let dailyInvest = transactions.reduce((accumulator, d) => {
      let account = accounts.find((acc) => acc.name === d.raccount);

      if (account && account.vehicle === 'investment') {
        return add(d.dailyRate, accumulator);
      } else {
        return accumulator;
      }
    }, zero);

    const savingsRate = equal(daily.expense, zero)
      ? 100
      : ratioAmounts(
          multiply(dailyInvest, 100),
          equal(daily.income, zero)
            ? dinero({ amount: 1, currency: USD })
            : daily.income
        );

    let totalInvest = accounts.reduce((accumulator, d) => {
      if (d.vehicle === 'investment') {
        return add(d.starting, accumulator);
      } else {
        return accumulator;
      }
    }, zero);

    let totalInvestInterest = accounts.reduce((accumulator, d) => {
      if (d.vehicle === 'investment') {
        return add(multiply(d.starting, d.interest), accumulator);
      } else {
        return accumulator;
      }
    }, zero);

    let totalDebt = accounts.reduce((accumulator, d) => {
      if (
        d.vehicle === 'debt' ||
        d.vehicle === 'loan' ||
        d.vehicle === 'credit line'
      ) {
        return add(d.starting, accumulator);
      } else {
        return accumulator;
      }
    }, zero);
    const totalExpense = multiply(daily.expense, 365);

    const fi = determineFI({ totalInvest, totalExpense, totalInvestInterest });

    const {
      percentToFUMoneyConsidering,
      yearsToFUMoneyConsidering,
      percentToFUMoneyConfident,
      yearsToFUMoneyConfident,
      percentToFirstFI,
      percentToHalfFI,
      yearsToHalfFI,
      percentToLeanFI,
      yearsToLeanFI,
      percentToFlexFI,
      yearsToFlexFI,
      percentToFINumber,
      yearsToFINumber,
      percentToFatFI,
      yearsToFatFI
    } = deriveFIstats({
      totalDebt,
      dailyExpense: daily.expense,
      totalInvest,
      FIconst: fi.constant,
      FIconstIncrease: fi.increase
    });

    return {
      dailyIncome: daily.income,
      dailyExpense: daily.expense,
      dailyInvest,
      totalInvest: trimScale(totalInvest),
      totalInvestInterest: trimScale(totalInvestInterest),
      savingsRate,

      percentToPositiveNetWorth: equal(totalDebt, zero)
        ? ratioAmounts(
            multiply(totalInvest, 100),
            dinero({ amount: 1, currency: USD })
          )
        : ratioAmounts(multiply(totalInvest, 100), totalDebt),

      investToExpenseMultiple: fi.constant,
      investToExpenseIncreasePerYear: fi.increase,

      percentToFUMoneyConsidering,
      yearsToFUMoneyConsidering,
      percentToFUMoneyConfident,
      yearsToFUMoneyConfident,
      percentToFirstFI,
      percentToHalfFI,
      yearsToHalfFI,
      percentToLeanFI,
      yearsToLeanFI,
      percentToFlexFI,
      yearsToFlexFI,
      percentToFINumber,
      yearsToFINumber,
      percentToFatFI,
      yearsToFatFI
    };
  }
);
