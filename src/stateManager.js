import { default as _Big } from 'big.js';
import makeUUID from './makeUUID.js';

class AppModel {
  modal = ModalModel;
  counter = Number;
  counterBig = Big;
  transactionForm = TransactionForm;
  accountForm = AccountForm;
  accountTransactionForm = AccountTransactionForm;
  transaction = Array;
  accounts = Array;
  BarChartIncome = Array;
  BarChartExpense = Array;
  BarChartMax = Big;
  dailyIncome = Big;
  dailyExpense = Big;
  dailyRate = Big;
  savingsRate = Big;
  fiNumber = Big;
  AccountChart = Array;
  LineChartMax = Big;
}

class TransactionForm {
  id = String;
  raccount = String;
  description = String;
  category = String;
  type = String;
  start = String;
  rtype = String;
  cycle = Big;
  value = Big;
}

class AccountForm {
  name = String;
  starting = Big;
  interest = Big;
  vehicle = String;
}

class AccountTransactionForm {
  id = String;
  debtAccount = String;
  raccount = String;
  start = String;
  rtype = String;
  cycle = Big;
  generatedOccurences = Big;
  value = Big;
}

class Big {
  initialize(value = 0) {
    return value instanceof _Big ? value : _Big(Number(value));
  }

  add(value) {
    return this.state.add(value);
  }
}

class ModalModel {
  content = String;
  isOpen = Boolean;
}

export default AppModel;
