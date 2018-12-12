import React from 'react';
import { map } from 'microstates';
import { Consumer } from '@microstates/react';
import BarChart from './barChart';

import TabView from './components/view/tabView';
import TransactionInput from './forms/transactionInput';
import AccountInput from './forms/accountInput';
import AccountTransactionInput from './forms/accountTransactionInput';
import Importing from './importing.js';

class Financial extends React.Component {
  constructor(props) {
    super();
    this.setAccountForm = this.setAccountForm.bind(this);
    this.setTransactionForm = this.setTransactionForm.bind(this);
    this.tabClickAccounts = this.tabClickAccounts.bind(this);
    this.tabClickTransactions = this.tabClickTransactions.bind(this);
    this.state = {
      activeTabTransactions: 0,
      activeTabAccounts: 0,
      TransactionType: { income: true, expense: true, transfer: true }
    };
  }

  tabClickTransactions(index) {
    this.setState({ activeTabTransactions: index });
  }

  setTransactionForm(model, index, id) {
    this.setState({ activeTabTransactions: index });
    model.modifyTransaction(id);
  }

  tabClickAccounts(index) {
    this.setState({ activeTabAccounts: index });
  }

  setAccountForm(model, index, name) {
    this.setState({ activeTabAccounts: index });
    model.modifyAccount(name);
  }

  render() {
    return (
      <Consumer>
        {model => (
          <React.Fragment>
            <section className="section">
              <div className="level">
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Daily Income</p>
                    <p className="heading">
                      ${model.stats.dailyIncome.state.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Daily Expenses</p>
                    <p className="heading">
                      ${model.stats.dailyExpense.state.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Savings Rate</p>
                    <p className="heading">
                      {model.stats.savingsRate.state.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">% to FI</p>
                    <p className="heading">
                      {model.stats.fiNumber.state.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
              <BarChart data={model.charts.state} />
            </section>

            <section className="section">
              <TabView
                activeTab={this.state.activeTabTransactions}
                tabClick={this.tabClickTransactions}
                tabTitles={[
                  'All Transactions',
                  'Add Transaction',
                  'Income',
                  'Expenses',
                  'Transfers'
                ]}
                tabContents={[
                  <React.Fragment>
                    <div className="buttons">
                      {Object.keys(model.state.transactionCategories).map(
                        category => (
                          <button
                            key={category}
                            className={
                              model.state.transactionCategories[category]
                                ? 'button is-primary'
                                : 'button is-secondary'
                            }
                            onClick={model.filterTransactionsComputed.bind(
                              this,
                              category
                            )}
                          >
                            {category}
                          </button>
                        )
                      )}
                    </div>
                    {transactionTable(model.state.transactionsComputed, {
                      model: model,
                      setTransactionForm: this.setTransactionForm,
                      deleteTransaction: model.deleteTransaction
                    })}
                  </React.Fragment>,
                  <TransactionInput tabClick={this.tabClickTransactions} />,
                  transactionTable(
                    model.state.transactionsComputed.filter(
                      transaction => transaction.type === 'income'
                    ),
                    {
                      model: model,
                      setTransactionForm: this.setTransactionForm,
                      deleteTransaction: model.deleteTransaction
                    }
                  ),
                  transactionTable(
                    model.state.transactionsComputed.filter(
                      transaction => transaction.type === 'expense'
                    ),
                    {
                      model: model,
                      setTransactionForm: this.setTransactionForm,
                      deleteTransaction: model.deleteTransaction
                    }
                  ),
                  transactionTable(
                    model.state.transactionsComputed.filter(
                      transaction => transaction.type === 'transfer'
                    ),
                    {
                      model: model,
                      setTransactionForm: this.setTransactionForm,
                      deleteTransaction: model.deleteTransaction
                    }
                  )
                ]}
              />
            </section>

            <section className="section">
              <TabView
                activeTab={this.state.activeTabAccounts}
                tabClick={this.tabClickAccounts}
                tabTitles={['All Accounts', 'Add Account', 'Debt']}
                tabContents={[
                  accountTable(model.accountsComputed, {
                    model: model,
                    setAccountForm: this.setAccountForm,
                    deleteAccount: model.deleteAccount,
                    toggleAccountVisibility: model.toggleAccountVisibility
                  }),
                  <AccountInput tabClick={this.tabClickAccounts} />,
                  <React.Fragment>
                    <div>
                      {debtTable(model.state.accountsComputed, {
                        model: model,
                        setAccountForm: this.setAccountForm,
                        deleteAccount: model.deleteAccount
                      })}
                    </div>
                    <div>
                      {model.state.accountsComputed.filter(
                        account => account.vehicle === 'debt'
                      ).length === 0 ? null : (
                        <AccountTransactionInput
                          tabClick={this.tabClickAccounts}
                        />
                      )}
                    </div>
                  </React.Fragment>
                ]}
              />
            </section>

            <section className="section">
              <Importing />
            </section>
          </React.Fragment>
        )}
      </Consumer>
    );
  }
}

export default Financial;

const transactionTable = (data, actions) =>
  data.length === 0 || !data ? (
    <div>There are no transactions to show.</div>
  ) : (
    <table className="table is-striped is-hoverable">
      <thead>
        <tr>
          <th>
            <abbr title="real account">raccount</abbr>
          </th>
          <th>description</th>
          <th>category</th>
          <th>type</th>
          <th>
            <abbr title="start date">start</abbr>
          </th>
          <th>
            <abbr title="repeat type">rtype</abbr>
          </th>
          <th>cycle</th>
          <th>value</th>
          <th>Daily Rate</th>
          <th>Modify</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {map(data.filter(state => !state.fromAccount), transaction => (
          <tr key={transaction.id}>
            <td>{transaction.raccount}</td>
            <td>{transaction.description}</td>
            <td>{transaction.category}</td>
            <td>{transaction.type}</td>
            <td>{transaction.start}</td>
            <td>{transaction.rtype}</td>
            <td>{!transaction.cycle ? '' : transaction.cycle.toFixed(0)}</td>
            <td>{!transaction.value ? '' : transaction.value.toFixed(2)}</td>
            <td>{transaction.dailyRate.toFixed(2)}</td>
            <td>
              <button
                className="button is-rounded is-small is-info"
                onClick={() =>
                  actions.setTransactionForm(actions.model, 1, transaction.id)
                }
              >
                M
              </button>
            </td>
            <td>
              <button
                className="delete"
                onClick={actions.deleteTransaction.bind(this, transaction.id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

const accountTable = (data, actions) =>
  data.length === 0 || !data ? (
    <div>There are no accounts to show.</div>
  ) : (
    <table className="table is-striped is-hoverable">
      <thead>
        <tr>
          <th />
          <th>name</th>
          <th>
            <abbr title="starting balance">starting</abbr>
          </th>
          <th>interest</th>
          <th>vehicle</th>
          <th>Modify</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {map(data, account => (
          <tr key={account.name.state}>
            <td
              onClick={actions.toggleAccountVisibility.bind(
                this,
                account.name.state
              )}
            >
              {account.visible.state ? `👀` : `🤫`}
            </td>
            <th>{account.name.state}</th>
            <td>{account.starting.toFixed}</td>
            <td>{account.interest.toFixed}%</td>
            <td>{account.vehicle.state}</td>
            <td>
              <button
                className="button is-rounded is-small is-info"
                onClick={() =>
                  actions.setAccountForm(actions.model, 1, account.name.state)
                }
              >
                M
              </button>
            </td>
            <td>
              <button
                className="delete"
                onClick={actions.deleteAccount.bind(this, account.name.state)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

const debtTable = (data, actions) =>
  data.filter(account => account.vehicle === 'debt').length === 0 || !data ? (
    <div>There are no debts to show.</div>
  ) : (
    data
      .filter(account => account.vehicle === 'debt')
      .map(account => (
        <div className="media box" key={account.name}>
          <div className="media-content">
            <div className="content">
              <p>
                <strong>{account.name}</strong>{' '}
                <small>{`$${account.starting} @ ${account.interest}%`}</small>
              </p>
            </div>
            {account.payback ? paybackTable(account.payback, actions) : null}
          </div>
          <div className="media-right">
            <button
              className="button is-rounded is-small is-success"
              onClick={actions.toggleAccountTransactionVisibility}
            >
              +
            </button>
            <button
              className="button is-rounded is-small is-info"
              onClick={() =>
                actions.setAccountForm(actions.model, 1, account.name)
              }
            >
              M
            </button>
            <button
              className="delete"
              onClick={actions.deleteAccount.bind(this, account.name)}
            />
          </div>
        </div>
      ))
  );

const paybackTable = (data, actions) =>
  data.transactions.map(payback => (
    <div className="media" key={payback.id}>
      <div className="media-content">
        <p>
          <strong>{payback.start}</strong>{' '}
          <small>{`${payback.rtype} @ ${payback.cycle} for ${
            payback.value
          }`}</small>
        </p>
        <p>{payback.description}</p>
      </div>
      <div className="media-right">
        <button
          className="button is-rounded is-small is-info"
          onClick={actions.modifyAccount.bind(this, payback.id)}
        >
          M
        </button>
        <button
          className="delete"
          onClick={actions.deleteAccount.bind(this, payback.id)}
        />
      </div>
    </div>
  ));
