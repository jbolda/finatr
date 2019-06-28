import { create, valueOf } from 'microstates';
import { Big } from './customTypes.js';
import { default as _Big } from 'big.js';

class Stats {
  dailyIncome = create(Big, 0);
  dailyExpense = create(Big, 0);
  savingsRate = create(Big, 0);
  fiNumber = create(Big, 0);

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
      let accountRaw = accounts.find(acc => acc.name === d.raccount);

      if (accountRaw && accountRaw.vehicle === 'investment') {
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

    return this.dailyIncome
      .set(dailyIncome)
      .dailyExpense.set(dailyExpense)
      .savingsRate.set(
        dailyExpense.eq(0) ? 100 : dailyInvest.times(100).div(dailyIncome)
      )
      .fiNumber.set(
        dailyExpense.eq(0)
          ? 100
          : totalInvest
              .times(100)
              .div(dailyExpense.times(365))
              .div(25) || null
      );
  }
}

export { Stats };
