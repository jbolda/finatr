import {
  valueOf,
  create,
  ObjectType,
  StringType,
  BooleanType
} from 'microstates';
import {
  sortTransactionOrder,
  coercePaybacks,
  transactionSplitter,
  past,
  future,
  resolveBarChart,
  resolveAccountChart
} from './resolveFinancials';
import { transactionCompute } from '/src/resolveFinancials/resolveTransactions.js';
import { default as _Big } from 'big.js';
import makeUUID from '/src/resolveFinancials/makeUUID.js';

class AppModel {
  forms = Forms;
  transactions = [Transaction];
  transactionsComputed = [TransactionComputed];
  transactionsSplit = ObjectType;
  accounts = [Account];
  charts = Charts;
  stats = Stats;

  initialize() {
    if (this.transactions.length === 0 && this.accounts.length === 0) {
      let defaultAccount = {
        name: 'account',
        starting: 0,
        interest: 0,
        vehicle: 'operating'
      };
      let defaultTransaction = {
        id: `seed-data-id`,
        raccount: `account`,
        description: `seed data`,
        category: `default transaction`,
        type: `income`,
        start: `2018-11-01`,
        rtype: `day`,
        cycle: 3,
        value: 150
      };
      return this.transactions
        .set([defaultTransaction])
        .accounts.set([defaultAccount])
        .reCalc();
    } else {
      return this;
    }
  }

  get state() {
    return valueOf(this);
  }

  log(message = 'AppModel logged') {
    console.log(message, valueOf(this));
    return this;
  }

  reCalc() {
    let { accounts } = this.state;
    let transactionPaybacks = coercePaybacks({ accounts });
    let init = this.transactionsComputed.set([
      ...this.state.transactions,
      ...transactionPaybacks
    ]);
    let computedTransactions = init.transactionsComputed.map(transaction =>
      transactionCompute({ transaction })
    );

    let { transactionsComputed } = computedTransactions.state;
    let splitTransactions = transactionSplitter({
      transactions: transactionsComputed,
      accounts: accounts
    });

    let chartsCalced = computedTransactions.transactionsSplit
      .set(splitTransactions)
      .charts.calcCharts(splitTransactions, accounts);

    return chartsCalced.stats
      .reCalc(chartsCalced.state, chartsCalced.charts.state)
      .log('recalc');
  }

  transactionUpsert(value) {
    let nextState = this.state.transactions;
    if (value.id && value.id !== '') {
      let existingTransactionIndex = nextState.map(t => t.id).indexOf(value.id);
      if (existingTransactionIndex === -1) {
        nextState.push(value);
      } else {
        nextState.splice(existingTransactionIndex, 1, value);
      }
    } else {
      let nextValue = { ...value, id: makeUUID() };
      nextState.push(nextValue);
    }
    // let sortedNextState = nextState.sort(sortTransactionOrder);
    let sortedNextState = nextState;

    return this.transactions
      .set(sortedNextState)
      .reCalc()
      .forms.transactionForm.id.set('');
  }

  modifyTransaction(id) {
    return this.forms.transactionForm.set(
      this.state.transactions.find(element => element.id === id)
    );
  }

  deleteTransaction(id) {
    let deleted = this.transactions.filter(t => t.id !== id);
    let nextSetState = this.transactions.set(deleted);
    return nextSetState.reCalc();
  }

  upsertAccount(value) {
    let nextState = this.state.accounts;
    let existingAccountIndex = nextState.map(t => t.name).indexOf(value.name);
    if (existingAccountIndex === -1) {
      nextState.push(value);
    } else {
      nextState.splice(existingAccountIndex, 1, value);
    }
    let nextSetState = this.accounts.set(nextState);
    return nextSetState.reCalc().forms.accountForm.name.set('');
  }

  modifyAccount(name) {
    return this.forms.accountForm.set(
      this.accounts.state.find(element => element.name === name)
    );
  }

  deleteAccount(name) {
    let deleted = this.accounts.filter(a => a.name !== name);
    let nextSetState = this.accounts.set(deleted);
    return nextSetState.reCalc();
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

    let nextSetState = this.accounts.set(nextState);
    return nextSetState.reCalc().forms.accountTransactionForm.id.set('');
  }

  addYNAB(tokens, resultantAccounts, resultantTransactions) {
    let nextState = this;
    let indexed = {};
    resultantAccounts.forEach(resultAccount => {
      indexed[resultAccount.name] = resultAccount;
    });
    nextState.state.accounts.forEach(existingAccount => {
      if (!indexed[existingAccount.name]) {
        indexed[existingAccount.name] = existingAccount;
      } else {
        indexed[existingAccount.name] = {
          name: existingAccount.name,
          starting: indexed[existingAccount.name].starting,
          interest: existingAccount.interest ? existingAccount.interest : 0,
          vehicle: existingAccount.vehicle
            ? existingAccount.vehicle
            : 'operating'
        };
      }
    });

    let nextSetState = this.transactions
      .set([...this.state.transactions, ...resultantTransactions])
      .accounts.set(Object.keys(indexed).map(key => indexed[key]));

    return nextSetState
      .reCalc()
      .forms.ynabForm.devToken.set(tokens.devToken)
      .forms.ynabForm.budgetId.set(tokens.budgetId);
  }
}

class Transaction {
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

class TransactionComputed extends Transaction {
  dailyRate = Big;
  y = Big;
}

class Account {
  account = StringType;
  starting = Big;
  interest = Big;
  vehicle = StringType;

  get state() {
    return valueOf(this);
  }
}

class Charts {
  GraphRange = ObjectType;
  BarChartIncome = create([BarChart], [{ id: 'default' }]);
  BarChartExpense = create([BarChart], [{ id: 'default' }]);
  BarChartMax = Big;
  AccountChart = create([LineChart], [{ id: 'default' }]);
  LineChartMax = Big;

  initialize(length = 365) {
    if (!this.GraphRange.start) {
      let graphRange = { start: past(), end: future(length) };
      return this.GraphRange.set(graphRange);
    } else {
      return this;
    }
  }

  get state() {
    return valueOf(this);
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
  savingsRate = Big;
  fiNumber = Big;

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
    }, 0);

    let totalInvest = accounts.reduce((accumulator, d) => {
      if (d.vehicle === 'investment') {
        return _Big(d.starting).add(accumulator);
      } else {
        return accumulator;
      }
    }, 0);

    return this.dailyIncome
      .set(dailyIncome)
      .dailyExpense.set(dailyExpense)
      .savingsRate.set(
        dailyExpense.eq(0) ? 100 : dailyInvest.times(100).div(dailyExpense)
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

  div(value) {
    return this.state.div(value);
  }

  eq(value) {
    return this.state.eq(value);
  }

  get toFixed() {
    return this.state.toFixed(2);
  }

  get toNumber() {
    return Number(this.state);
  }

  get state() {
    return valueOf(this);
  }
}

export default AppModel;
