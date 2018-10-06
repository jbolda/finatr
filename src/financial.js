import React from 'react';
import BarChart from './barChart';
import resolveData from './resolveFinancials';
import makeUUID from './makeUUID.js';

import TransactionInput from './transactionInput';
import AccountInput from './accountInput';
import AccountTransactionInput from './accountTransactionInput';
import YNABInput from './ynabInput.js';

import fileDownload from 'js-file-download';
import FileReaderInput from 'react-file-reader-input';

class Financial extends React.Component {
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

  componentDidMount() {
    let data = [];
    let dOne = {
      id: `oasidjas1`,
      raccount: `account`,
      description: `description`,
      category: `test default`,
      type: `income`,
      start: `2018-03-22`,
      rtype: `day`,
      cycle: 3,
      value: 150
    };
    data.push(dOne);
    let dTwo = {
      id: `oasis2`,
      raccount: `account`,
      description: `description`,
      category: `test default occurences`,
      type: `income`,
      start: `2018-09-22`,
      occurences: 7,
      rtype: `day`,
      cycle: 1,
      value: 100
    };
    data.push(dTwo);
    let dThree = {
      id: `oasis3`,
      raccount: `account`,
      description: `description`,
      category: `test complex`,
      type: `income`,
      start: `2018-03-22`,
      rtype: `day of week`,
      cycle: 2,
      value: 35
    };
    data.push(dThree);
    let dFour = {
      id: `oasis6`,
      raccount: `account`,
      description: `description`,
      category: `test complex`,
      type: `income`,
      start: `2018-03-22`,
      rtype: `day of month`,
      cycle: 1,
      value: 90
    };
    data.push(dFour);
    let dThreePointFive = {
      id: `oasis92`,
      raccount: `account`,
      description: `description`,
      category: `test complex`,
      type: `income`,
      start: `2018-09-22`,
      rtype: `none`,
      value: 190
    };
    data.push(dThreePointFive);
    let dFive = {
      id: `oasis8`,
      raccount: `account`,
      description: `description`,
      category: `test comp`,
      type: `expense`,
      start: `2018-03-22`,
      rtype: `day of month`,
      cycle: 1,
      value: 112
    };
    data.push(dFive);
    let dSix = {
      id: `oasis8asg`,
      raccount: `account2`,
      description: `description`,
      category: `test comp`,
      type: `transfer`,
      start: `2018-03-22`,
      rtype: `day`,
      cycle: 1,
      value: 112
    };
    data.push(dSix);

    let dataArray = {
      transactions: data,
      accounts: [
        {
          name: 'account',
          starting: 3000,
          interest: 0.01,
          vehicle: 'operating'
        },
        {
          name: 'account2',
          starting: 30000,
          interest: 0.01,
          vehicle: 'investment'
        },
        {
          name: 'account3',
          starting: 30000,
          interest: 6.0,
          vehicle: 'debt',
          payback: {
            id: `sasdqljg`,
            description: `payback`,
            category: 'account3 payback',
            type: 'expense',
            payoffBalance: 1500,
            transactions: [
              {
                raccount: 'account',
                start: `2018-03-15`,
                rtype: `day of month`,
                cycle: 15,
                value: 112
              },
              {
                raccount: 'account',
                start: `2018-03-15`,
                rtype: `day of month`,
                cycle: 15,
                visibleOccurrences: 1,
                value: 'payoffBalance'
              }
            ]
          }
        }
      ]
    };

    let resolvedData = Promise.resolve(resolveData(dataArray));
    requestAnimationFrame(() => {
      resolvedData.then(data => this.setState(data));
    });
  }

  handleUpload = (event, results) => {
    let result = JSON.parse(results[0][0].target.result);
    console.log(result);
    let calculated = resolveData(result);
    this.setState(calculated);
  };

  handleDownload = () => {
    let outputData = {
      transactions: [...this.state.transactions],
      accounts: [...this.state.accounts],
      devToken: this.state.devToken,
      budgetId: this.state.budgetId
    };
    let fileData = JSON.stringify(outputData);
    fileDownload(fileData, 'financials.json');
  };

  addTransaction = result => {
    let newState = { ...this.state };
    if (result.id || result.id !== '') {
      let existingTransactionIndex = newState.transactions
        .map(t => t.id)
        .indexOf(result.id);
      if (existingTransactionIndex === -1) {
        newState.transactions.push(result);
      } else {
        newState.transactions.splice(existingTransactionIndex, 1, result);
      }
    } else {
      newState.transactions.push({ ...result, id: makeUUID() });
    }
    newState.transactionForm.id = '';
    this.setState(resolveData(newState));
    this.transactionTabs.tabClick(0);
  };

  modifyTransaction = id => {
    let newState = { ...this.state };
    newState.transactionForm = this.state.transactions.find(
      element => element.id === id
    );
    this.setState(resolveData(newState));
    this.transactionTabs.tabClick(1);
  };

  deleteTransaction = id => {
    let newState = { ...this.state };
    newState.transactions.splice(
      this.state.transactions.findIndex(element => element.id === id),
      1
    );
    this.setState(resolveData(newState));
  };

  addAccount = result => {
    let newState = { ...this.state };
    let existingAccountIndex = newState.accounts
      .map(t => t.name)
      .indexOf(result.name);
    if (existingAccountIndex === -1) {
      newState.accounts.push(result);
    } else {
      newState.accounts.splice(existingAccountIndex, 1, result);
    }
    this.setState(resolveData(newState));
    this.accountTabs.tabClick(0);
  };

  modifyAccount = name => {
    let newState = { ...this.state };
    newState.accountForm = this.state.accounts.find(
      element => element.name === name
    );
    this.setState(resolveData(newState));
    this.accountTabs.tabClick(1);
  };

  deleteAccount = name => {
    let newState = { ...this.state };
    newState.accounts.splice(
      this.state.accounts.findIndex(element => element.name === name),
      1
    );
    this.setState(resolveData(newState));
  };

  addAccountTransaction = result => {
    let newState = { ...this.state };
    let accountIndex = newState.accounts
      .map(a => a.name)
      .indexOf(result.debtAccount);
    let payback = { ...newState.accounts[accountIndex].payback };
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
    newState.accountTransactionForm.id = '';
    this.setState(resolveData(newState));
  };

  addYNAB = (tokens, resultantAccounts, resultantTransactions) => {
    let newState = { ...this.state };
    let indexed = {};
    resultantAccounts.forEach(resultAccount => {
      indexed[resultAccount.name] = resultAccount;
    });
    this.state.accounts.forEach(existingAccount => {
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

    newState.accounts = Object.keys(indexed).map(key => indexed[key]);
    newState.transactions = [
      ...this.state.transactions,
      ...resultantTransactions
    ];
    newState.devToken = tokens.devToken;
    newState.budgetId = tokens.budgetId;
    this.setState(resolveData(newState));
  };

  render() {
    return (
      <React.Fragment>
        <section className="section">
          <div className="level">
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Daily Income</p>
                <p className="heading">{this.state.dailyIncome}</p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Daily Expenses</p>
                <p className="heading">{this.state.dailyExpense}</p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Savings Rate</p>
                <p className="heading">{this.state.savingsRate}%</p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">% to FI</p>
                <p className="heading">{this.state.fiNumber}%</p>
              </div>
            </div>
          </div>
          <BarChart data={this.state} />
        </section>

        <nav className="level">
          <div className="level-left">
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Get your current</p>
                <p className="heading">data out:</p>
                <button
                  className="button is-success"
                  onClick={this.handleDownload}
                >
                  Download
                </button>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Import data from</p>
                <p className="heading">your computer:</p>
                <FileReaderInput
                  as="text"
                  id="my-file-input"
                  onChange={this.handleUpload}
                >
                  <button className="button is-link">Select a file!</button>
                </FileReaderInput>
              </div>
            </div>
          </div>
        </nav>

        <section className="section">
          <TabView
            ref={ref => (this.transactionTabs = ref)}
            tabTitles={['All Transactions', 'Add Transaction']}
            tabContents={[
              transactionTable(this.state.transactions, {
                modifyTransaction: this.modifyTransaction,
                deleteTransaction: this.deleteTransaction
              }),
              <TransactionInput
                accounts={this.state.accounts}
                addTransaction={this.addTransaction}
                initialValues={this.state.transactionForm}
              />
            ]}
          />
        </section>

        <section className="section">
          <TabView
            ref={ref => (this.accountTabs = ref)}
            tabTitles={['All Accounts', 'Add Account', 'Debt']}
            tabContents={[
              accountTable(this.state.accounts, {
                modifyAccount: this.modifyAccount,
                deleteAccount: this.deleteAccount
              }),
              <AccountInput
                addAccount={this.addAccount}
                initialValues={this.state.accountForm}
              />,
              <React.Fragment>
                {debtTable(this.state.accounts, {
                  modifyAccount: this.modifyAccount,
                  deleteAccount: this.deleteAccount
                })}
                <AccountTransactionInput
                  ref={ref => (this.AccountTransactionForm = ref)}
                  accounts={this.state.accounts}
                  addAccountTransaction={this.addAccountTransaction}
                  initialValues={this.state.accountTransactionForm}
                />
              </React.Fragment>
            ]}
          />
        </section>

        <section className="section">
          <div className="container is-fluid">
            <YNABInput
              initialDevToken={this.state.devToken}
              initialBudgetId={this.state.budgetId}
              addYNAB={this.addYNAB}
            />
          </div>
        </section>
      </React.Fragment>
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

class TabView extends React.Component {
  constructor() {
    super();
    this.state = { activeTab: 0 };
  }

  tabClick(index) {
    this.setState({ activeTab: index });
  }

  render() {
    return (
      <React.Fragment>
        <div className="tabs">
          <ul>
            {this.props.tabTitles.map((tab, index) => (
              <li
                key={tab}
                className={index === this.state.activeTab ? 'is-active' : ''}
                onClick={this.tabClick.bind(this, index)}
              >
                <a>{tab}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="container is-fluid">
          {this.props.tabContents[this.state.activeTab]}
        </div>
      </React.Fragment>
    );
  }
}
