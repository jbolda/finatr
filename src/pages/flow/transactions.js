/** @jsx jsx */
import { jsx } from 'theme-ui';
import React from 'react';
import { State } from '../../state';

import { Box, Button } from 'rebass';
import TabView from '../../components/view/tabView';
import FlexTable from '../../components/bootstrap/FlexTable';
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
                <div className="buttons">
                  {Object.keys(model.state.transactionCategories).map(
                    category => (
                      <Button
                        key={category}
                        m={2}
                        sx={{
                          variant: model.state.transactionCategories[category]
                            ? 'buttons.primary'
                            : 'buttons.outline'
                        }}
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
        )}
      </State.Consumer>
    );
  }
}

export default TransactionsFlow;

const TransactionTable = ({ data, actions }) =>
  data.length === 0 || !data ? (
    <Box m={2}>There are no transactions to show.</Box>
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
      itemData={data.map(transaction => ({
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
