import { Big } from 'big.js';
import { create, valueOf } from 'microstates';

class Stats {
  dailyIncome = create(Big, 0);
  dailyExpense = create(Big, 0);
  savingsRate = create(Big, 0);
  expenseMultiple = Big;
  expenseMultipleIncreasePerYear = Big;
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
      let account = accounts.find((acc) => acc.name === d.raccount);

      if (account && account.vehicle === 'investment') {
        return d.dailyRate.add(accumulator);
      } else {
        return accumulator;
      }
    }, _Big(0));

    let dailyInvestInterest = BarChartIncome.reduce(
      (accumulator, d) => {
        let account = accounts.find((acc) => acc.name === d.raccount);

        if (account && account.vehicle === 'investment') {
          const increaseQuantity = _Big(1).add(accumulator.quantity);
          const increaseVal = d.dailyRate.add(accumulator.value);
          return { quantity: increaseQuantity, value: increaseVal };
        } else {
          return accumulator;
        }
      },
      { quantity: _Big(0), value: _Big(0) }
    );

    let totalInvest = accounts.reduce((accumulator, d) => {
      if (d.vehicle === 'investment') {
        return _Big(d.starting).add(accumulator);
      } else {
        return accumulator;
      }
    }, _Big(0));

    let totalInvestInterest = accounts.reduce(
      (accumulator, d) => {
        if (d.vehicle === 'investment') {
          const increaseQuantity = _Big(1).add(accumulator.quantity);
          const increaseVal = _Big(d.interest).add(accumulator.value);
          return { quantity: increaseQuantity, value: increaseVal };
        } else {
          return accumulator;
        }
      },
      { quantity: _Big(0), value: _Big(0) }
    );

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
      .expenseMultipleIncreasePerYear.set(simpleInterested)
      .percentToFirstFI.set(totalInvest.times(100).div(totalDebt.plus(100000)))
      .percentToFUMoneyConsidering.set(
        dailyExpense.eq(0) ? 100 : FIconstpercent.div(2)
      )
      .yearsToFUMoneyConsidering.set(
        simpleInterested.eq(0) || FIconst.gte(2)
          ? 999
          : _Big(2).minus(FIconst).div(simpleInterested)
      )
      .percentToFUMoneyConfident.set(
        dailyExpense.eq(0) ? 100 : FIconstpercent.div(3)
      )
      .yearsToFUMoneyConfident.set(
        simpleInterested.eq(0) || FIconst.gte(3)
          ? 999
          : _Big(3).minus(FIconst).div(simpleInterested)
      )
      .percentToHalfFI.set(dailyExpense.eq(0) ? 100 : FIconstpercent.div(12.5))
      .yearsToHalfFI.set(
        simpleInterested.eq(0) || FIconst.gte(12.5)
          ? 999
          : _Big(12.5).minus(FIconst).div(simpleInterested)
      )
      .percentToLeanFI.set(dailyExpense.eq(0) ? 100 : FIconstpercent.div(17.5))
      .yearsToLeanFI.set(
        simpleInterested.eq(0) || FIconst.gte(17.5)
          ? 999
          : _Big(17.5).minus(FIconst).div(simpleInterested)
      )
      .percentToFlexFI.set(dailyExpense.eq(0) ? 100 : FIconstpercent.div(20))
      .yearsToFlexFI.set(
        simpleInterested.eq(0) || FIconst.gte(20)
          ? 999
          : _Big(20).minus(FIconst).div(simpleInterested)
      )
      .percentToFINumber.set(dailyExpense.eq(0) ? 100 : FIconstpercent.div(25))
      .yearsToFINumber.set(
        simpleInterested.eq(0) || FIconst.gte(25)
          ? 999
          : _Big(25).minus(FIconst).div(simpleInterested)
      )
      .percentToFatFI.set(dailyExpense.eq(0) ? 100 : FIconstpercent.div(30))
      .yearsToFatFI.set(
        simpleInterested.eq(0) || FIconst.gte(30)
          ? 999
          : _Big(30).minus(FIconst).div(simpleInterested)
      );
  }
}

export { Stats };
