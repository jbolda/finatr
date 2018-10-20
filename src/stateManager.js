import { valueOf, ObjectType, StringType, BooleanType } from 'microstates';
import { default as _Big } from 'big.js';
import makeUUID from './makeUUID.js';

class AppModel {
  forms = Forms;
  transactions = [Transaction];
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
    return this.transactions.push(value);
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
  BarChartIncome = [BarChart];
  BarChartExpense = [BarChart];
  BarChartMax = Big;
  AccountChart = [LineChart];
  LineChartMax = Big;
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
