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

  log(message = 'AppModel logged') {
    console.log(message, valueOf(this));
    return this;
  }

  transactionUpsert(value) {
    let nextState = this.state.transactions;
    if (value.id || value.id !== '') {
      let existingTransactionIndex = nextState.map(t => t.id).indexOf(value.id);
      if (existingTransactionIndex === -1) {
        nextState.push(value);
      } else {
        nextState.splice(existingTransactionIndex, 1, value);
      }
    } else {
      nextState.push({ ...value, id: makeUUID() });
    }
    let splitTransactions = transactionSplitter({
      transactions: nextState,
      accounts: this.state.accounts
    });
    return this.transactions
      .set(nextState)
      .transactionsSplit.set(splitTransactions)
      .charts.calcCharts(splitTransactions, valueOf(this.accounts))
      .forms.transactionForm.id.set('');
  }

  modifyTransaction(id) {
    return this.forms.transactionForm.set(
      this.state.transactions.find(element => element.id === id)
    );
  }

  deleteTransaction(id) {
    return this.transactions.filter(t => t.id !== id);
  }

  upsertAccount(value) {
    let nextState = this.state.accounts;
    let existingAccountIndex = nextState.map(t => t.name).indexOf(value.name);
    if (existingAccountIndex === -1) {
      nextState.push(value);
    } else {
      nextState.splice(existingAccountIndex, 1, value);
    }
    return this.accounts.set(nextState).forms.accountForm.name.set('');
  }

  modifyAccount(name) {
    return this.forms.accountForm.set(
      this.accounts.state.find(element => element.name === name)
    );
  }

  deleteAccount(name) {
    return this.accounts.filter(a => a.name !== name);
  }

  addAccountTransaction(result) {
    let nextState = this.state.accounts;
    let accountIndex = nextState.map(a => a.name).indexOf(result.debtAccount);
    let payback = { ...nextState[accountIndex].payback };
    payback.id = makeUUID();
    if (!payback.transactions) {
      payback.transactions = [];
    }
    payback.transactions.push({
      raccount: result.raccount,
      start: result.start,
      rtype: result.rtype,
      cycle: result.cycle,
      occurences: result.occurences,
      value: result.value
    });
    return this.accounts.set(nextState).forms.accountTransactionForm.id.set('');
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

  get state() {
    return valueOf(this);
  }

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

  get state() {
    return valueOf(this);
  }
}

class Forms {
  transactionForm = TransactionForm;
  accountForm = AccountForm;
  accountTransactionForm = AccountTransactionForm;
  ynabForm = YNABForm;

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

class YNABForm {
  devToken = StringType;
  budgetId = StringType;
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
