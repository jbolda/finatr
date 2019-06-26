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
    if (this.transactions.length === 0 || this.accounts.length === 0) {
      let defaultAccount = [
        {
          name: 'account',
          starting: 0,
          interest: 0,
          vehicle: 'operating'
        }
      ];
      let defaultTransaction = [
        {
          id: `seed-data-id`,
          raccount: `account`,
          description: `seed data`,
          category: `default transaction`,
          type: `income`,
          start: `2018-11-01`,
          rtype: `day`,
          cycle: 3,
          value: 150
        }
      ];

      if (this.transactions.length === 0 && this.accounts.length === 0) {
        return this.transactions
          .set(defaultTransaction)
          .accounts.set(defaultAccount)
          .taxStrategy.incomeReceived.set([])
          .reCalc();
      }

      if (this.transactions.length === 0) {
        return this.transactions
          .set(defaultTransaction)
          .taxStrategy.incomeReceived.set([])
          .reCalc();
      }

      if (this.accounts.length === 0) {
        return this.accounts
          .set(defaultAccount)
          .taxStrategy.incomeReceived.set([])
          .reCalc();
      }
    } else {
      return this;
    }
  }

  get state() {
    return valueOf(this);
  }

  log(message = 'AppModel logged') {
    const notTesting = process.env.JEST_WORKER_ID === undefined;
    if (notTesting) console.log(message, valueOf(this));
    return this;
  }

  setUpload(result) {
    let next = this;

    if (result.settings && result.settings.startDate) {
      next = next.charts.updateStartDate(result.settings.startDate);
    }

    if (result.transactions) {
      next = next.transactions.set(result.transactions);
    }

    if (result.accounts) {
      next = next.accounts.set(result.accounts);
    }

    if (result.taxStrategy) {
      next = next.taxStrategy.set(result.taxStrategy);
    }

    if (result.devToken) {
      next = next.forms.ynabForm.devToken.set(result.devToken);
    }

    if (result.budgetId) {
      next = next.forms.ynabForm.budgetId.set(result.budgetId);
    }

    return next.reCalc();
  }

  updateStartDateReCalc(value) {
    return this.charts.updateStartDate(value).reCalc();
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
      .taxStrategy.reCalc()
      .log('recalc');
  }

  transactionComputer(filteredTransactions = [], categoriesSet = false) {
    const { accounts, transactions } = this.state;
    const transactionPaybacks = coercePaybacks({ accounts });
    const useTransactions =
      filteredTransactions.length === 0 ? transactions : filteredTransactions;

    const sortList = ['income', 'expense', 'transfer'];
    const init = this.transactionsComputed
      .set([
        ...(useTransactions ? useTransactions : []),
        ...(transactionPaybacks ? transactionPaybacks : [])
      ])
      .transactionsComputed.map(transaction => transaction.computeValue())
      .transactionsComputed.sort(
        (a, b) =>
          sortList.indexOf(a.type) - sortList.indexOf(b.type) ||
          Math.abs(a.value) - Math.abs(b.value) ||
          b.value - a.value
      );

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
        if (computed && computed.visible === undefined) computed.visible = true;
        return computed;
      });
    } else {
      computeAccounts = presetAccounts;
    }

    const sortList = ['operating', 'credit line', 'loan', 'investment'];
    return this.accountsComputed
      .set(computeAccounts)
      .accountsComputed.sort(
        (a, b) =>
          sortList.indexOf(a.vehicle) - sortList.indexOf(b.vehicle) ||
          (a.name < b.name ? -1 : 1)
      );
  }

  toggleAccountVisibility(accountName) {
    let next = this.accountsComputed.map(account =>
      accountName === account.name.state ? account.visible.toggle() : account
    );
    return this.reCalc(next.state.accountsComputed);
  }

  toggleAllAccount() {
    let next = this.accountsComputed.map(account => account.visible.toggle());
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
    return this.transactions.filter(t => t.id.state !== id).reCalc();
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
    return this.accounts.filter(a => a.name.state !== name).reCalc();
  }

  upsertAccountTransaction(result) {
    let nextState = this.state.accounts;
    const accountIndex = nextState.map(a => a.name).indexOf(result.debtAccount);
    let account = nextState[accountIndex];

    if (!account.payback) {
      account.payback = {};
    }

    if (!!account.payback && !account.payback.transactions) {
      account.payback.transactions = [];
    }

    let payback = {
      debtAccount: result.debtAccount,
      raccount: result.raccount,
      start: result.start,
      rtype: result.rtype,
      cycle: result.cycle,
      occurrences: result.occurrences,
      value: result.value
    };

    if (!payback.id) {
      payback.id = makeUUID();
    }

    account.payback.transactions.push(payback);

    nextState[accountIndex] = account;
    let nextSetState = this.accounts.set(nextState);
    return nextSetState.reCalc().forms.accountTransactionForm.id.set('');
  }

  modifyAccountTransaction(name, index) {
    const payback = this.state.accounts.find(element => element.name === name)
      .payback;
    return this.forms.accountTransactionForm
      .set(payback.transactions[index])
      .forms.accountTransactionFormVisible.toggle();
  }

  deleteAccountTransaction(name, index) {
    return this.accounts
      .map(element => {
        let next = element;
        if (element.name.state === name) {
          next = element.payback.transactions.set(
            element.state.payback.transactions.filter(
              (payback, ix) => ix !== index
            )
          );
        }
        return next;
      })
      .reCalc();
  }

  addYNAB(tokens, resultantAccounts, resultantTransactions) {
    let nextState = this;
    let indexed = {};
    resultantAccounts.forEach(resultAccount => {
      indexed[resultAccount.name] = resultAccount;
    });
    nextState.state.accounts.forEach(existingAccount => {
      // if the existing account doesn't appear in newly added accounts
      if (!indexed[existingAccount.name]) {
        indexed[existingAccount.name] = existingAccount;
        // if it does exist and it is a newly added added account, merge
        // only update with the new value, everything else comes from existing
      } else {
        indexed[existingAccount.name] = {
          ...existingAccount,
          starting: indexed[existingAccount.name].starting
        };
      }
    });

    let nextSetState = this.transactions
      .set([...this.state.transactions, ...resultantTransactions])
      .accounts.set(Object.keys(indexed).map(key => indexed[key]));

    return nextSetState.forms.ynabForm.devToken
      .set(tokens.devToken)
      .forms.ynabForm.budgetId.set(tokens.budgetId)
      .reCalc();
  }
}

export default AppModel;

export const State = React.createContext();
