import { valueOf, NumberType, StringType, BooleanType } from 'microstates';
import { default as _Big } from 'big.js';
import makeUUID from './makeUUID.js';

class AppModel {
  forms = Forms;
  transaction = Array;
  accounts = Array;
  charts = Charts;
  stats = Stats;
}

class Charts {
  BarChartIncome = Array;
  BarChartExpense = Array;
  BarChartMax = Big;
  AccountChart = Array;
  LineChartMax = Big;
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
}

class AccountForm {
  name = StringType;
  starting = Big;
  interest = Big;
  vehicle = StringType;
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
