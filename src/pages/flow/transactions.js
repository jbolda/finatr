import React from 'react';
import { map } from 'microstates';
import { State } from '../../state';

import TabView from '../../components/view/tabView';
import TransactionInput from '../../forms/transactionInput';

class Financial extends React.Component {
  constructor(props) {
    super();
    this.setTransactionForm = this.setTransactionForm.bind(this);
    this.tabClick = this.tabClick.bind(this);
    this.state = { activeTab: 0 };
  }

  tabClick(index) {
    this.setState({ activeTab: index });
  }

  setTransactionForm(model, index, id) {
    this.setState({ activeTab: index });
    model.modifyTransaction(id);
  }

  render() {
    return (
      <State.Consumer>
        {model => (
          <section className="section" id="transactions">
            <TabView
              activeTab={this.state.activeTab}
              tabClick={this.tabClick}
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
        )}
      </State.Consumer>
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
