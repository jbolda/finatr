import React from 'react';
import { map } from 'microstates';
import { State } from '../../state';

import { Box, Heading, Button } from 'rebass';
import TabView from '../../components/view/tabView';
import TransactionInput from './transactionInput';

class TransactionsFlow extends React.Component {
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
                        <Button
                          key={category}
                          m={2}
                          variant={
                            model.state.transactionCategories[category]
                              ? 'primary'
                              : 'outline'
                          }
                          onClick={model.filterTransactionsComputed.bind(
                            this,
                            category
                          )}
                        >
                          {category}
                        </Button>
                      )
                    )}
                  </div>
                  <TransactionTable
                    data={model.state.transactionsComputed}
                    actions={{
                      model: model,
                      setTransactionForm: this.setTransactionForm,
                      deleteTransaction: model.deleteTransaction
                    }}
                  />
                </React.Fragment>,
                <TransactionInput tabClick={this.tabClick} />,
                <TransactionTable
                  data={model.state.transactionsComputed.filter(
                    transaction => transaction.type === 'income'
                  )}
                  actions={{
                    model: model,
                    setTransactionForm: this.setTransactionForm,
                    deleteTransaction: model.deleteTransaction
                  }}
                />,
                <TransactionTable
                  data={model.state.transactionsComputed.filter(
                    transaction => transaction.type === 'expense'
                  )}
                  actions={{
                    model: model,
                    setTransactionForm: this.setTransactionForm,
                    deleteTransaction: model.deleteTransaction
                  }}
                />,
                <TransactionTable
                  data={model.state.transactionsComputed.filter(
                    transaction => transaction.type === 'transfer'
                  )}
                  actions={{
                    model: model,
                    setTransactionForm: this.setTransactionForm,
                    deleteTransaction: model.deleteTransaction
                  }}
                />
              ]}
            />
          </section>
        )}
      </State.Consumer>
    );
  }
}

export default TransactionsFlow;

const TransactionTable = ({ data, actions }) =>
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
        {map(data, transaction => (
          <tr
            key={transaction.id}
            style={
              transaction.fromAccount ? { backgroundColor: 'seashell' } : null
            }
          >
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
                disabled={transaction.fromAccount}
              >
                M
              </button>
            </td>
            <td>
              <button
                className="button is-rounded is-small is-danger"
                onClick={actions.deleteTransaction.bind(this, transaction.id)}
                disabled={transaction.fromAccount}
              >
                <strong>X</strong>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
