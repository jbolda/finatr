import { valueOf, ObjectType, StringType, BooleanType } from 'microstates';
import {
  transactionSplitter,
  past,
  future,
  resolveBarChart
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
      .charts.calcBarCharts(splitTransactions);
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
}

class TransactionMutated extends Transaction {
  dailyRate = Big;
}

class Account {
  account = StringType;
  interest = Big;
  vehicle = StringType;
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

  calcBarCharts(splitTransactions) {
    let income = resolveBarChart(splitTransactions.income, {
      graphRange: valueOf(this.GraphRange)
    });
    let expenses = resolveBarChart(splitTransactions.expenses, {
      graphRange: valueOf(this.GraphRange)
    });
    return this.BarChartIncome.set(income).BarChartExpense.set(expenses);
  }
}

class BarChart extends Transaction {
  stack = Array;
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
