import { valueOf, ObjectType } from 'microstates';
import { Transaction, TransactionComputed } from './transactions.js';
import { Account } from './accounts.js';
import { Charts } from './charts.js';
import { Stats } from './stats.js';
import { Forms } from './forms.js';
import { coercePaybacks, transactionSplitter } from './resolveFinancials';
import { transactionCompute } from './resolveFinancials/resolveTransactions';
import makeUUID from './resolveFinancials/makeUUID.js';

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
        value: 150,
        occurrences: 3,
        beginAfterOccurrences: 1
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

export default AppModel;
