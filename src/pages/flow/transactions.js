import React from 'react';
import { State } from '~src/state';

import { TabView } from '~src/components/TabView';
import { FlexTable } from '~src/components/FlexTable';
import { Button } from '~src/elements/Button';
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
        {(model) => (
          <TabView
            id="transactions"
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
                <div className="buttons py-2">
                  {Object.keys(model.state.transactionCategories).map(
                    (category) => (
                      <button
                        key={category}
                        className="inline-flex items-center px-2 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
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
                  (transaction) => transaction.type === 'income'
                )}
                actions={{
                  model: model,
                  setTransactionForm: this.setTransactionForm,
                  deleteTransaction: model.deleteTransaction
                }}
              />,
              <TransactionTable
                data={model.state.transactionsComputed.filter(
                  (transaction) => transaction.type === 'expense'
                )}
                actions={{
                  model: model,
                  setTransactionForm: this.setTransactionForm,
                  deleteTransaction: model.deleteTransaction
                }}
              />,
              <TransactionTable
                data={model.state.transactionsComputed.filter(
                  (transaction) => transaction.type === 'transfer'
                )}
                actions={{
                  model: model,
                  setTransactionForm: this.setTransactionForm,
                  deleteTransaction: model.deleteTransaction
                }}
              />
            ]}
          />
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
    <FlexTable
      itemHeaders={[
        'raccount',
        'description',
        'category',
        'type',
        'start',
        'rtype',
        'cycle',
        'value',
        'Daily Rate',
        'Modify',
        'Delete'
      ]}
      itemData={data.map((transaction) => ({
        key: transaction.id,
        data: [
          transaction.raccount,
          transaction.description,
          transaction.category,
          transaction.type,
          transaction.start,
          transaction.rtype,
          !transaction.cycle ? '' : transaction.cycle.toFixed(0),
          !transaction.value ? '' : transaction.value.toFixed(2),
          transaction.dailyRate.toFixed(2),
          <Button
            m={0}
            sx={{ variant: 'buttons.outline', color: 'blue' }}
            onClick={() =>
              actions.setTransactionForm(actions.model, 1, transaction.id)
            }
            disabled={transaction.fromAccount}
          >
            M
          </Button>,
          <Button
            m={0}
            sx={{ variant: 'buttons.outline', color: 'red' }}
            onClick={actions.deleteTransaction.bind(this, transaction.id)}
            disabled={transaction.fromAccount}
          >
            <strong>X</strong>
          </Button>
        ]
      }))}
      actions={actions}
    />
  );
