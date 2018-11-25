import React from 'react';
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
    this.state = {
      activeTabTransactions: 0,
      activeTabAccounts: 0,
      TransactionType: { income: true, expense: true, transfer: true }
    };
  }

  tabClickTransactions(index) {
    this.setState({ activeTabTransactions: index });
  }

  tabClickAccounts(index) {
    this.setState({ activeTabAccounts: index });
  }

  clickTransactionType(type, model, event) {
    this.setState((prevState, props) => {
      console.log(prevState.TransactionType);
      let newState = { ...prevState };
      newState.TransactionType[type] = !prevState.TransactionType[type];
      console.log('new', newState.TransactionType);
      return newState;
    });
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
                tabClick={this.tabClickTransactions.bind(this)}
                tabTitles={['All Transactions', 'Add Transaction']}
                tabContents={[
                  <React.Fragment>
                    <div className="buttons">
                      {['income', 'expense', 'transfer'].map(type => (
                        <button
                          key={type}
                          className={
                            this.state.TransactionType[type]
                              ? 'button is-primary'
                              : 'button is-secondary'
                          }
                          onClick={this.clickTransactionType.bind(
                            this,
                            type,
                            model
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {transactionTable(model.state.transactionsComputed, {
                      modifyTransaction: model.modifyTransaction,
                      deleteTransaction: model.deleteTransaction
                    })}
                  </React.Fragment>,
                  <TransactionInput />
                ]}
              />
            </section>

            <section className="section">
              <TabView
                activeTab={this.state.activeTabAccounts}
                tabClick={this.tabClickAccounts.bind(this)}
                tabTitles={['All Accounts', 'Add Account', 'Debt']}
                tabContents={[
                  accountTable(model.state.accounts, {
                    modifyAccount: model.modifyAccount,
                    deleteAccount: model.deleteAccount
                  }),
                  <AccountInput />,
                  <React.Fragment>
                    {debtTable(model.state.accounts, {
                      modifyAccount: model.modifyAccount,
                      deleteAccount: model.deleteAccount
                    })}
                    <AccountTransactionInput
                      ref={ref => (this.AccountTransactionForm = ref)}
                    />
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

const transactionTable = (data, actions) => (
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
      {!data
        ? null
        : data
            .filter(state => !state.fromAccount)
            .map(transaction => (
              <tr key={transaction.id}>
                <td>{transaction.raccount}</td>
                <td>{transaction.description}</td>
                <td>{transaction.category}</td>
                <td>{transaction.type}</td>
                <td>{transaction.start}</td>
                <td>{transaction.rtype}</td>
                <td>
                  {!transaction.cycle ? '' : transaction.cycle.toFixed(0)}
                </td>
                <td>
                  {!transaction.value ? '' : transaction.value.toFixed(2)}
                </td>
                <td>{transaction.dailyRate.toFixed(2)}</td>
                <td>
                  <button
                    className="button is-rounded is-small is-info"
                    onClick={actions.modifyTransaction.bind(
                      this,
                      transaction.id
                    )}
                  >
                    M
                  </button>
                </td>
                <td>
                  <button
                    className="delete"
                    onClick={actions.deleteTransaction.bind(
                      this,
                      transaction.id
                    )}
                  />
                </td>
              </tr>
            ))}
    </tbody>
  </table>
);

const accountTable = (data, actions) => (
  <table className="table is-striped is-hoverable">
    <thead>
      <tr>
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
      {data.map(account => (
        <tr key={account.name}>
          <th>{account.name}</th>
          <td>{account.starting}</td>
          <td>{account.interest}%</td>
          <td>{account.vehicle}</td>
          <td>
            <button
              className="button is-rounded is-small is-info"
              onClick={actions.modifyAccount.bind(this, account.name)}
            >
              M
            </button>
          </td>
          <td>
            <button
              className="delete"
              onClick={actions.deleteAccount.bind(this, account.name)}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const debtTable = (data, actions) =>
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
            onClick={actions.modifyAccount.bind(this, account.name)}
          >
            M
          </button>
          <button
            className="delete"
            onClick={actions.deleteAccount.bind(this, account.name)}
          />
        </div>
      </div>
    ));

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
