import { default as _Big } from 'big.js';

class AppModel {
  modal = ModalModel;
  counter = Number;
  counterBig = Big;
  transactionForm = TransactionForm;
  accountForm = AccountForm;
  accountTransactionForm = AccountTransactionForm;

  modalClick() {
    return this.counter
      .increment()
      .modal.isOpen.toggle()
      .counterBig.add(2);
  }
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

/*
constructor() {
  super();
  this.state = {
    transaction: [],
    accounts: [],
    BarChartIncome: [],
    BarChartExpense: [],
    BarChartMax: 0,
    dailyIncome: 0,
    dailyExpense: 0,
    dailyRate: 0,
    savingsRate: 0,
    fiNumber: 0,
    AccountChart: [],
    LineChartMax: 0,
    transactionForm: {
      id: ``,
      raccount: `account`,
      description: `description`,
      category: `test default`,
      type: `income`,
      start: `2018-03-22`,
      rtype: `day`,
      cycle: 3,
      value: 150
    },
    accountForm: {
      name: 'new account',
      starting: 1000,
      interest: 0.0,
      vehicle: 'operating'
    },
    accountTransactionForm: {
      id: ``,
      debtAccount: `account`,
      raccount: `account`,
      start: `2018-03-22`,
      rtype: `day`,
      cycle: 3,
      generatedOccurences: 0,
      value: 150
    }
  };
}
*/
