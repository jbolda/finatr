import React from 'react';
import { Consumer } from '@microstates/react';
import BarChart from './barChart';

import TabView from '/src/components/view/tabView';
import TransactionInput from '/src/forms/transactionInput';
import AccountInput from '/src/forms/accountInput';
import AccountTransactionInput from '/src/forms/accountTransactionInput';
import Importing from '/src/importing.js';

class Financial extends React.Component {
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
                ref={ref => (this.transactionTabs = ref)}
                tabTitles={['All Transactions', 'Add Transaction']}
                tabContents={[
                  transactionTable(model.state.transactions, {
                    modifyTransaction: model.modifyTransaction,
                    deleteTransaction: model.deleteTransaction
                  }),
                  <TransactionInput />
                ]}
              />
            </section>

            <section className="section">
              <TabView
                ref={ref => (this.accountTabs = ref)}
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
        : data.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.raccount}</td>
              <td>{transaction.description}</td>
              <td>{transaction.category}</td>
              <td>{transaction.type}</td>
              <td>{transaction.start}</td>
              <td>{transaction.rtype}</td>
              <td>{transaction.cycle}</td>
              <td>{transaction.value}</td>
              <td>{transaction.dailyRate}</td>
              <td>
                <button
                  className="button is-rounded is-small is-info"
                  onClick={actions.modifyTransaction.bind(this, transaction.id)}
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
  data.filter(account => account.vehicle === 'debt').map(account => (
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
