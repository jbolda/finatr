import { parseISO } from 'date-fns';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'starfx/react';

import { schema } from '~/src/store/schema';

import { FlexTable } from '~/src/components/FlexTable';
import { TabView } from '~/src/components/TabView';

import { Button } from '~/src/elements/Button';

import { transactionRemove } from '../../store/thunks/transactions';

const TransactionsFlow = () => {
  const [activeTab, setActiveTab] = useState(0);
  const transactions = useSelector(schema.transactions.selectTableAsList);

  return (
    <TabView
      id="transactions"
      activeTab={activeTab}
      tabClick={setActiveTab}
      tabTitles={['All Transactions', 'Income', 'Expenses', 'Transfers']}
      tabContents={[
        <React.Fragment>
          {/* <div className="buttons py-2">
            {Object.keys(model.state.transactionCategories).map((category) => (
              <button
                key={category}
                className="inline-flex items-center px-2 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                onClick={model.filterTransactionsComputed.bind(this, category)}
              >
                {category}
              </button>
            ))}
          </div> */}
          <TransactionTable data={transactions} />
        </React.Fragment>,
        <TransactionTable
          data={transactions.filter(
            (transaction) => transaction.type === 'income'
          )}
        />,
        <TransactionTable
          data={transactions.filter(
            (transaction) => transaction.type === 'expense'
          )}
        />,
        <TransactionTable
          data={transactions.filter(
            (transaction) => transaction.type === 'transfer'
          )}
        />
      ]}
    />
  );
};

export default TransactionsFlow;

const TransactionTable = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return data.length === 0 || !data ? (
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
            onPress={() =>
              navigate('/transactions/set', {
                state: {
                  navigateTo: '/planning',
                  transaction: {
                    id: transaction.id,
                    raccount: transaction.raccount,
                    description: transaction.description,
                    category: transaction.category,
                    type: transaction.type,
                    start: transaction.start,
                    ending: transaction.ending ?? 'never',
                    rtype: transaction.rtype,
                    beginAfterOccurrences:
                      transaction.beginAfterOccurrences ?? 0,
                    cycle: transaction.cycle.toFixed(0),
                    value: transaction.value.toFixed(2),
                    valueType: transaction.valueType ?? 'static'
                  }
                }
              })
            }
            isDisabled={transaction.fromAccount}
          >
            <strong>M</strong>
          </Button>,
          <Button
            onPress={() => dispatch(transactionRemove({ id: transaction.id }))}
            isDisabled={transaction.fromAccount}
          >
            <strong>X</strong>
          </Button>
        ]
      }))}
    />
  );
};
