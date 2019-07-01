import { create, valueOf } from 'microstates';
import { Big } from './customTypes.js';
import { default as _Big } from 'big.js';

class Stats {
  dailyIncome = create(Big, 0);
  dailyExpense = create(Big, 0);
  savingsRate = create(Big, 0);
  expenseMultiple = Big;
  percentToPositiveNetWorth = Big;
  percentToFirstFI = Big;
  percentToFUMoneyConsidering = Big;
  percentToFUMoneyConfident = Big;
  percentToHalfFI = Big;
  percentToLeanFI = Big;
  percentToFlexFI = Big;
  percentToFINumber = Big;
  percentToFatFI = Big;
  yearsToFUMoneyConsidering = Big;
  yearsToFUMoneyConfident = Big;
  yearsToHalfFI = Big;
  yearsToLeanFI = Big;
  yearsToFlexFI = Big;
  yearsToFINumber = Big;
  yearsToFatFI = Big;

  get state() {
    return valueOf(this);
  }

  reCalc({ accounts }, { BarChartIncome, BarChartExpense }) {
    let dailyIncome = BarChartIncome.reduce(
      (accumulator, d) =>
        d.type === 'income' ? d.dailyRate.add(accumulator) : accumulator,
      _Big(0)
    );

    let dailyExpense = BarChartExpense.reduce(
      (accumulator, d) =>
        d.type === 'expense' ? d.dailyRate.add(accumulator) : accumulator,
      _Big(0)
    );

    let dailyInvest = BarChartIncome.reduce((accumulator, d) => {
      let account = accounts.find(acc => acc.name === d.raccount);

      if (account && account.vehicle === 'investment') {
        return d.dailyRate.add(accumulator);
      } else {
        return accumulator;
      }
    }, _Big(0));

    let totalInvest = accounts.reduce((accumulator, d) => {
      if (d.vehicle === 'investment') {
        return _Big(d.starting).add(accumulator);
      } else {
        return accumulator;
      }
    }, _Big(0));

    let totalDebt = accounts.reduce((accumulator, d) => {
      if (
        d.vehicle === 'debt' ||
        d.vehicle === 'loan' ||
        d.vehicle === 'credit line'
      ) {
        return _Big(d.starting).add(accumulator);
      } else {
        return accumulator;
      }
    }, _Big(0));

    const FIconst = dailyExpense.eq(0)
      ? _Big(100)
      : totalInvest.div(dailyExpense.times(365));

    const FIconstpercent = FIconst.times(100);

    const yearlyMultipleIncrease = dailyInvest.eq(0)
      ? _Big(0)
      : dailyInvest.div(dailyExpense.eq(0) ? 1 : dailyExpense).times(365);

    return this.dailyIncome
      .set(dailyIncome)
      .dailyExpense.set(dailyExpense)
      .savingsRate.set(
        dailyExpense.eq(0)
          ? 100
          : dailyInvest.times(100).div(dailyIncome.eq(0) ? 1 : dailyIncome)
      )
      .percentToPositiveNetWorth.set(
        totalDebt.eq(0) ? 100 : totalInvest.times(100).div(totalDebt)
      )
      .expenseMultiple.set(FIconst)
      .percentToFirstFI.set(totalInvest.times(100).div(totalDebt.plus(100000)))
      .percentToFUMoneyConsidering.set(
        dailyExpense.eq(0) ? 100 : FIconstpercent.div(2)
      )
      .yearsToFUMoneyConsidering.set(
        yearlyMultipleIncrease.eq(0) || FIconst.gte(2)
          ? 999
          : _Big(2)
              .minus(FIconst)
              .div(yearlyMultipleIncrease)
      )
      .percentToFUMoneyConfident.set(
        dailyExpense.eq(0) ? 100 : FIconstpercent.div(3)
      )
      .yearsToFUMoneyConfident.set(
        yearlyMultipleIncrease.eq(0) || FIconst.gte(3)
          ? 999
          : _Big(3)
              .minus(FIconst)
              .div(yearlyMultipleIncrease)
      )
      .percentToHalfFI.set(dailyExpense.eq(0) ? 100 : FIconstpercent.div(12.5))
      .yearsToHalfFI.set(
        yearlyMultipleIncrease.eq(0) || FIconst.gte(12.5)
          ? 999
          : _Big(12.5)
              .minus(FIconst)
              .div(yearlyMultipleIncrease)
      )
      .percentToLeanFI.set(dailyExpense.eq(0) ? 100 : FIconstpercent.div(17.5))
      .yearsToLeanFI.set(
        yearlyMultipleIncrease.eq(0) || FIconst.gte(17.5)
          ? 999
          : _Big(17.5)
              .minus(FIconst)
              .div(yearlyMultipleIncrease)
      )
      .percentToFlexFI.set(dailyExpense.eq(0) ? 100 : FIconstpercent.div(20))
      .yearsToFlexFI.set(
        yearlyMultipleIncrease.eq(0) || FIconst.gte(20)
          ? 999
          : _Big(20)
              .minus(FIconst)
              .div(yearlyMultipleIncrease)
      )
      .percentToFINumber.set(dailyExpense.eq(0) ? 100 : FIconstpercent.div(25))
      .yearsToFINumber.set(
        yearlyMultipleIncrease.eq(0) || FIconst.gte(25)
          ? 999
          : _Big(25)
              .minus(FIconst)
              .div(yearlyMultipleIncrease)
      )
      .percentToFatFI.set(dailyExpense.eq(0) ? 100 : FIconstpercent.div(30))
      .yearsToFatFI.set(
        yearlyMultipleIncrease.eq(0) || FIconst.gte(30)
          ? 999
          : _Big(2)
              .minus(FIconst)
              .div(yearlyMultipleIncrease)
      );
  }
}

export { Stats };
