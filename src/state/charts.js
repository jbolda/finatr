import {
  valueOf,
  create,
  ObjectType,
  StringType,
  Primitive
} from 'microstates';
import { Big } from './customTypes.js';
import { TransactionComputed } from './transactions.js';
import { Account } from './accounts.js';
import {
  past,
  future,
  resolveBarChart,
  resolveAccountChart
} from './resolveFinancials';
import format from 'date-fns/fp/format';
import startOfDay from 'date-fns/fp/startOfDay';

class BarChart extends TransactionComputed {
  stack = Array;

  get state() {
    return valueOf(this);
  }
}

class LineChartValues {
  date = StringType;
  value = Big;
}

class LineChart extends Account {
  values = [LineChartValues];
}

class Charts extends Primitive {
  GraphRange = ObjectType;
  BarChartIncome = create([BarChart], [{ id: 'default' }]);
  BarChartExpense = create([BarChart], [{ id: 'default' }]);
  BarChartMax = Big;
  AccountChart = create([LineChart], [{ id: 'default' }]);
  LineChartMax = Big;

  initialize() {
    if (!this.GraphRange.entries.start) {
      let graphRange = { start: past(), end: future(365) };
      return this.GraphRange.set(graphRange);
    } else {
      return this;
    }
  }

  get graphDates() {
    const formatDate = format('yyyy-MM-dd');
    const dates = this.state.GraphRange;
    return { start: formatDate(dates.start), end: formatDate(dates.end) };
  }

  get isStartingToday() {
    const formatDate = format('yyyy-MM-dd');
    const dates = this.state.GraphRange;
    return formatDate(dates.start) === formatDate(past());
  }

  updateStartDate(value) {
    let graphRange = { start: startOfDay(value), end: future(365) };
    return this.GraphRange.set(graphRange);
  }

  calcCharts(transactionsSplit, accounts) {
    return this.calcBarCharts(transactionsSplit).calcAccountLine(accounts);
  }

  calcBarCharts(transactionsSplit) {
    let income = resolveBarChart(transactionsSplit.income, {
      graphRange: this.state.GraphRange
    });

    let expense = resolveBarChart(transactionsSplit.expense, {
      graphRange: this.state.GraphRange
    });

    return this.BarChartIncome.set(income)
      .BarChartExpense.set(expense)
      .BarChartMax.set(
        Math.max(
          income.length !== 0 ? income[0].maxHeight || 0 : 0,
          expense.length !== 0 ? expense[0].maxHeight || 0 : 0
        )
      );
  }

  calcAccountLine(accounts) {
    let { BarChartIncome, BarChartExpense } = this.state;
    let accountLine = resolveAccountChart({
      accounts: accounts,
      income: BarChartIncome,
      expense: BarChartExpense
    });
    return this.AccountChart.set(accountLine).LineChartMax.set(
      accountLine.reduce((lineMax, line) => {
        return Math.max(
          lineMax,
          line.values.reduce(
            (lineDayMax, day) => Math.max(lineDayMax, day.value),
            0
          )
        );
      }, 0)
    );
  }
}

export { Charts };
