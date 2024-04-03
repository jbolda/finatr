import { Big } from 'big.js';
import { createSelector } from 'starfx';

import { schema } from '../schema';

export const financialStats = createSelector(
  schema.transactions.selectTableAsList,
  schema.accounts.selectTableAsList,
  (transactions, accounts) => {
    let dailyIncome = transactions.reduce(
      (accumulator, d) =>
        d.type === 'income' ? d.dailyRate.add(accumulator) : accumulator,
      Big(0)
    );

    let dailyExpense = transactions.reduce(
      (accumulator, d) =>
        d.type === 'expense' ? d.dailyRate.add(accumulator) : accumulator,
      Big(0)
    );

    let dailyInvest = transactions.reduce((accumulator, d) => {
      let account = accounts.find((acc) => acc.name === d.raccount);

      if (account && account.vehicle === 'investment') {
        return d.dailyRate.add(accumulator);
      } else {
        return accumulator;
      }
    }, Big(0));

    let dailyInvestInterest = transactions.reduce(
      (accumulator, d) => {
        let account = accounts.find((acc) => acc.name === d.raccount);

        if (account && account.vehicle === 'investment') {
          const increaseQuantity = Big(1).add(accumulator.quantity);
          const increaseVal = d.dailyRate.add(accumulator.value);
          return { quantity: increaseQuantity, value: increaseVal };
        } else {
          return accumulator;
        }
      },
      { quantity: Big(0), value: Big(0) }
    );

    let totalInvest = accounts.reduce((accumulator, d) => {
      if (d.vehicle === 'investment') {
        return Big(d.starting).add(accumulator);
      } else {
        return accumulator;
      }
    }, Big(0));

    let totalInvestInterest = accounts.reduce(
      (accumulator, d) => {
        if (d.vehicle === 'investment') {
          const increaseQuantity = Big(1).add(accumulator.quantity);
          const increaseVal = Big(d.interest).add(accumulator.value);
          return { quantity: increaseQuantity, value: increaseVal };
        } else {
          return accumulator;
        }
      },
      { quantity: Big(0), value: Big(0) }
    );

    let totalDebt = accounts.reduce((accumulator, d) => {
      if (
        d.vehicle === 'debt' ||
        d.vehicle === 'loan' ||
        d.vehicle === 'credit line'
      ) {
        return Big(d.starting).add(accumulator);
      } else {
        return accumulator;
      }
    }, Big(0));

    const FIconst = dailyExpense.eq(0)
      ? Big(100)
      : totalInvest.div(dailyExpense.times(365));

    const FIconstpercent = FIconst.times(100);

    const simpleInterested = totalInvest
      .times(
        totalInvestInterest.value
          .div(
            totalInvestInterest.quantity.eq(0)
              ? 1
              : totalInvestInterest.quantity
          )
          .div(100)
      )
      .add(
        dailyInvest.times(365).times(
          dailyInvestInterest.value
            .div(
              dailyInvestInterest.quantity.eq(0)
                ? 1
                : dailyInvestInterest.quantity
            )
            .div(100)
            .add(1)
        )
      )
      .div(dailyExpense.eq(0) ? 1 : dailyExpense.times(365));

    return {
      dailyIncome: dailyIncome,
      dailyExpense: dailyExpense,
      savingsRate: dailyExpense.eq(0)
        ? 100
        : dailyInvest.times(100).div(dailyIncome.eq(0) ? 1 : dailyIncome),

      percentToPositiveNetWorth: totalDebt.eq(0)
        ? 100
        : totalInvest.times(100).div(totalDebt),

      expenseMultiple: FIconst,
      expenseMultipleIncreasePerYear: simpleInterested,
      percentToFirstFI: totalInvest.times(100).div(totalDebt.plus(100000)),
      percentToFUMoneyConsidering: dailyExpense.eq(0)
        ? 100
        : FIconstpercent.div(2),

      yearsToFUMoneyConsidering:
        simpleInterested.eq(0) || FIconst.gte(2)
          ? 999
          : Big(2).minus(FIconst).div(simpleInterested),

      percentToFUMoneyConfident: dailyExpense.eq(0)
        ? 100
        : FIconstpercent.div(3),

      yearsToFUMoneyConfident:
        simpleInterested.eq(0) || FIconst.gte(3)
          ? 999
          : Big(3).minus(FIconst).div(simpleInterested),

      percentToHalfFI: dailyExpense.eq(0) ? 100 : FIconstpercent.div(12.5),
      yearsToHalfFI:
        simpleInterested.eq(0) || FIconst.gte(12.5)
          ? 999
          : Big(12.5).minus(FIconst).div(simpleInterested),

      percentToLeanFI: dailyExpense.eq(0) ? 100 : FIconstpercent.div(17.5),
      yearsToLeanFI:
        simpleInterested.eq(0) || FIconst.gte(17.5)
          ? 999
          : Big(17.5).minus(FIconst).div(simpleInterested),

      percentToFlexFI: dailyExpense.eq(0) ? 100 : FIconstpercent.div(20),
      yearsToFlexFI:
        simpleInterested.eq(0) || FIconst.gte(20)
          ? 999
          : Big(20).minus(FIconst).div(simpleInterested),

      percentToFINumber: dailyExpense.eq(0) ? 100 : FIconstpercent.div(25),
      yearsToFINumber:
        simpleInterested.eq(0) || FIconst.gte(25)
          ? 999
          : Big(25).minus(FIconst).div(simpleInterested),

      percentToFatFI: dailyExpense.eq(0) ? 100 : FIconstpercent.div(30),
      yearsToFatFI:
        simpleInterested.eq(0) || FIconst.gte(30)
          ? 999
          : Big(30).minus(FIconst).div(simpleInterested)
    };
  }
);
