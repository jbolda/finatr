import { valueOf, ObjectType, StringType, BooleanType } from 'microstates';
import {
  transactionSplitter,
  past,
  future,
  resolveBarChart,
  resolveAccountChart
} from './resolveFinancials';
import { default as _Big } from 'big.js';
import makeUUID from './makeUUID.js';

class AppModel {
  forms = Forms;
  transactions = [Transaction];
  transactionsSplit = ObjectType;
  accounts = [Account];
  charts = Charts;
  stats = Stats;

  get state() {
    return valueOf(this);
  }

  log() {
    console.log(valueOf(this));
    return this;
  }

  transactionUpsert(value) {
    // console.log(this.state);
    let nextState = this.transactions.push(value);
    let splitTransactions = transactionSplitter(nextState.state);
    return this.transactions
      .set(nextState.transactions)
      .transactionsSplit.set(splitTransactions)
      .charts.calcCharts(splitTransactions, valueOf(this.accounts));
  }

  accountUpsert(value) {
    return this.accounts.push(value);
  }
}

class Transaction {
  id = StringType;
  raccount = StringType;
  category = StringType;
  type = StringType;
  start = StringType;
  rtype = StringType;
  cycle = Big;
  value = Big;

  get state() {
    return valueOf(this);
  }
}

class TransactionMutated extends Transaction {
  dailyRate = Big;
}

class Account {
  account = StringType;
  interest = Big;
  vehicle = StringType;

  get state() {
    return valueOf(this);
  }
}

class Charts {
  // initialize(length = 365) {
  //   let initialized = this;
  //   let graphRange = { start: past(), end: future(length) };
  //   initialized = initialized.GraphRange.set(graphRange);
  //   return initialized;
  // }

  GraphRange = ObjectType;
  BarChartIncome = [BarChart];
  BarChartExpense = [BarChart];
  BarChartMax = Big;
  AccountChart = [LineChart];
  LineChartMax = Big;

  calcCharts(splitTransactions, accounts) {
    return this.calcBarCharts(splitTransactions).calcAccountLine(accounts);
  }

  calcBarCharts(splitTransactions) {
    let income = resolveBarChart(splitTransactions.income, {
      graphRange: valueOf(this.GraphRange)
    });

    let expenses = resolveBarChart(splitTransactions.expenses, {
      graphRange: valueOf(this.GraphRange)
    });

    let accountLine = resolveAccountChart({
      transactions: [].concat(
        splitTransactions.income,
        splitTransactions.expenses
      ),
      income,
      expenses
    });

    return this.BarChartIncome.set(income)
      .BarChartExpense.set(expenses)
      .BarChartMax.set(
        Math.max(
          income.length !== 0 ? income[0].maxHeight || 0 : 0,
          expenses.length !== 0 ? expenses[0].maxHeight || 0 : 0
        )
      );
  }

  calcAccountLine(accounts) {
    let accountLine = resolveAccountChart({
      accounts: accounts,
      income: valueOf(this.BarChartIncome),
      expenses: valueOf(this.BarChartExpense)
    });
    return this.AccountChart.set(accountLine).LineChartMax.set(
      accountLine.reduce(
        (lineMax, line) =>
          Math.max(
            lineMax,
            line.values.reduce(
              (lineDayMax, day) => Math.max(lineDayMax, day.value),
              0
            )
          ),
        0
      )
    );
  }
}

class BarChart extends Transaction {
  stack = Array;

  get state() {
    return valueOf(this);
  }
}

class LineChart extends Account {
  values = [LineChartValues];
}

class LineChartValues {
  date = StringType;
  value = Big;
}

class Stats {
  dailyIncome = Big;
  dailyExpense = Big;
  dailyRate = Big;
  savingsRate = Big;
  fiNumber = Big;
}

class Forms {
  transactionForm = TransactionForm;
  accountForm = AccountForm;
  accountTransactionForm = AccountTransactionForm;

  get state() {
    return valueOf(this);
  }
}

class TransactionForm {
  id = StringType;
  raccount = StringType;
  description = StringType;
  category = StringType;
  type = StringType;
  start = StringType;
  rtype = StringType;
  cycle = Big;
  value = Big;

  get state() {
    return valueOf(this);
  }
}

class AccountForm {
  name = StringType;
  starting = Big;
  interest = Big;
  vehicle = StringType;

  get state() {
    return valueOf(this);
  }
}

class AccountTransactionForm {
  id = StringType;
  debtAccount = StringType;
  raccount = StringType;
  start = StringType;
  rtype = StringType;
  cycle = Big;
  generatedOccurences = Big;
  value = Big;

  get state() {
    return valueOf(this);
  }
}

class Big {
  initialize(value = 0) {
    return value instanceof _Big ? value : _Big(value);
  }

  add(value) {
    return this.state.add(value);
  }

  get state() {
    return valueOf(this);
  }
}

export default AppModel;
