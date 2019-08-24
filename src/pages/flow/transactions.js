import React from 'react';
import { State } from '../../state';

import { Flex, Box, Button } from 'rebass';
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
    <Box m={2}>There are no transactions to show.</Box>
  ) : (
    <React.Fragment>
      <HeaderRow
        columns={[11]}
        items={[
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
      />
      {data.map(transaction => (
        <DataRow
          key={transaction.id}
          itemKey={transaction.id}
          columns={11}
          items={[
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
              variant="outline"
              color="blue"
              onClick={() =>
                actions.setTransactionForm(actions.model, 1, transaction.id)
              }
              disabled={transaction.fromAccount}
            >
              M
            </Button>,
            <Button
              variant="outline"
              color="red"
              onClick={actions.deleteTransaction.bind(this, transaction.id)}
              disabled={transaction.fromAccount}
            >
              <strong>X</strong>
            </Button>
          ]}
        />
      ))}
    </React.Fragment>
  );

const HeaderRow = ({ items, columns }) => (
  <Flex>
    {items.map(item => (
      <HeaderItem columns={columns || items.count} key={item}>
        {item}
      </HeaderItem>
    ))}
  </Flex>
);

const HeaderItem = ({ children, columns }) => (
  <Box m={1} width={[null, 1 / columns]}>
    {children}
  </Box>
);

const DataRow = ({ items, columns, itemKey }) => (
  <Flex>
    {items.map((item, index) => (
      <DataItem columns={columns || items.count} key={`${itemKey}=${index}`}>
        {item}
      </DataItem>
    ))}
  </Flex>
);

const DataItem = ({ children, columns }) => (
  <React.Fragment>
    {/* <Box m={1} width={[1 / 2, null]}>
      {children}
    </Box> */}
    <Box m={1} width={[1 / 2, 1 / columns]}>
      {children}
    </Box>
  </React.Fragment>
);
