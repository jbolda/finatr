import React from 'react';
import { valueOf, ObjectType } from 'microstates';
import { Transaction, TransactionComputed } from './transactions.js';
import { Account, AccountComputed } from './accounts.js';
import { Charts } from './charts.js';
import { Stats } from './stats.js';
import { Forms } from './forms.js';
import { TaxStrategy } from './taxStrategy.js';
import { coercePaybacks, transactionSplitter } from './resolveFinancials';
import { transactionCompute } from './resolveFinancials/resolveTransactions';
import makeUUID from './resolveFinancials/makeUUID.js';

class AppModel {
  forms = Forms;
  transactions = [Transaction];
  transactionsComputed = [TransactionComputed];
  transactionsSplit = ObjectType;
  transactionCategories = ObjectType;
  accounts = [Account];
  accountsComputed = [AccountComputed];
  charts = Charts;
  stats = Stats;
  taxStrategy = TaxStrategy;

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
        .taxStrategy.incomeReceived.set([])
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

  setUpload(result) {
    return this.transactions
      .set(result.transactions)
      .accounts.set(result.accounts)
      .taxStrategy.set(result.taxStrategy)
      .forms.ynabForm.devToken.set(result.devToken)
      .forms.ynabForm.budgetId.set(result.budgetId)
      .reCalc();
  }

  reCalc(presetAccounts = []) {
    const init = this.transactionComputer().accountComputer(presetAccounts);
    const { transactionsComputed, accountsComputed } = init.state;
    const splitTransactions = transactionSplitter({
      transactions: transactionsComputed,
      accounts: accountsComputed
    });

    const chartsCalced = init.transactionsSplit
      .set(splitTransactions)
      .charts.calcCharts(
        splitTransactions,
        accountsComputed.filter(account => account.visible)
      );

    return chartsCalced.stats
      .reCalc(chartsCalced.state, chartsCalced.charts.state)
      .log('recalc');
  }

  transactionComputer(filteredTransactions = [], categoriesSet = false) {
    const { accounts, transactions } = this.state;
    const transactionPaybacks = coercePaybacks({ accounts });
    const useTransactions =
      filteredTransactions.length === 0 ? transactions : filteredTransactions;
    const init = this.transactionsComputed.set([
      ...useTransactions,
      ...transactionPaybacks
    ]);

    // returns a microstate with the transactionsComputed set
    return categoriesSet
      ? init.transactionsComputed.map(transaction =>
          transactionCompute({ transaction })
        )
      : init.transactionsComputed
          .map(transaction => transactionCompute({ transaction }))
          .transactionCategories.set(
            init.state.transactionsComputed.reduce(
              (categories, transaction) => {
                let next = { ...categories };
                next[transaction.category] = true;
                return next;
              },
              {}
            )
          );
  }

  filterTransactionsComputed(category) {
    const { transactionCategories, transactions } = this.state;
    const categories = transactionCategories;
    categories[category] = !categories[category];
    const filterBy = Object.keys(categories).reduce(
      (filters, category) =>
        categories[category] ? filters : filters.concat([category]),
      []
    );
    const next = transactions.filter(
      transaction =>
        !filterBy.reduce(
          (toFilter, filter) =>
            toFilter || transaction.category === filter ? true : toFilter,
          false
        )
    );

    // return as a microstate where next is just an array
    // this does not recompute graphs or stats
    return this.transactionComputer(next, true).transactionCategories.set(
      categories
    );
  }

  accountComputer(presetAccounts = []) {
    let computeAccounts;
    if (presetAccounts.length === 0) {
      const { accounts } = this.state;
      computeAccounts = accounts.map(account => {
        let computed = account;
        computed.visible = true;
        return computed;
      });
    } else {
      computeAccounts = presetAccounts;
    }
    return this.accountsComputed.set(computeAccounts);
  }

  toggleAccountVisibility(accountName) {
    let next = this.accountsComputed.map(account =>
      accountName === account.name.state ? account.visible.toggle() : account
    );
    return this.reCalc(next.state.accountsComputed);
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
      this.state.accountsComputed.find(element => element.name === name)
    );
  }

  deleteAccount(name) {
    let deleted = this.accounts.filter(a => a.name !== name);
    let nextSetState = this.accounts.set(deleted);
    return nextSetState.reCalc();
  }

  upsertAccountTransaction(result) {
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

  modifyAccountTransaction(name, index) {
    let payback = this.state.accounts.find(element => element.name === name)
      .payback;
    return this.forms.accountTransactionForm
      .set({
        ...payback,
        ...payback.transactions[index]
      })
      .log('modAT');
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

export const State = React.createContext();
