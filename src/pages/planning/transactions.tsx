import { toDecimal } from 'dinero.js';
import { Pencil, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Group } from 'react-aria-components';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import type { Dispatch } from 'redux';
import type { AnyAction } from 'starfx';
import { useDispatch, useSelector } from 'starfx/react';

import { transactionsWithAccounts } from '~/src/store/selectors/transactions';
import { transactionRemove } from '~/src/store/thunks/transactions.ts';
import { toHumanCurrency } from '~/src/store/utils/dineroUtils.ts';

import { TabView } from '~/src/components/TabView.tsx';
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader
} from '~/src/components/Table.tsx';

import { Button } from '~/src/elements/Button.tsx';

const TransactionsFlow = () => {
  const [activeTab, setActiveTab] = useState(0);
  const transactions = useSelector(transactionsWithAccounts);

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
          <TransactionTable transactions={transactions} />
        </React.Fragment>,
        <TransactionTable
          transactions={transactions.filter(
            (transaction) => transaction.type === 'income'
          )}
        />,
        <TransactionTable
          transactions={transactions.filter(
            (transaction) => transaction.type === 'expense'
          )}
        />,
        <TransactionTable
          transactions={transactions.filter(
            (transaction) => transaction.type === 'transfer'
          )}
        />
      ]}
    />
  );
};

export default TransactionsFlow;

const TransactionTable = ({
  transactions
}: {
  transactions: TransactionWithAccount[];
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <Table aria-label="All Accounts" selectionMode="none">
      <TableHeader>
        <Column isRowHeader>raccount</Column>
        {[
          'description',
          'category',
          'type',
          'start',
          'rtype',
          'cycle',
          'value',
          'Daily Rate',
          'Actions'
        ].map((h) => (
          <Column key={h}>{h}</Column>
        ))}
      </TableHeader>
      <TableBody renderEmptyState={() => 'No transactions.'}>
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            navigate={navigate}
            dispatch={dispatch}
          />
        ))}
      </TableBody>
    </Table>
  );
};

const TransactionRow = ({
  transaction,
  navigate,
  dispatch
}: {
  transaction: TransactionWithAccount;
  navigate: NavigateFunction;
  dispatch: Dispatch<AnyAction>;
}) => (
  <Row>
    <Cell>{transaction.raccount}</Cell>
    <Cell>{transaction.description}</Cell>
    <Cell>{transaction.category}</Cell>
    <Cell>{transaction.type}</Cell>
    <Cell>{transaction.start}</Cell>
    <Cell>{transaction.rtype}</Cell>
    <Cell>{transaction.cycle}</Cell>
    <Cell>{toHumanCurrency(transaction.value)}</Cell>
    <Cell>{toHumanCurrency(transaction.dailyRate)}</Cell>

    <Cell>
      <Group aria-label="Actions" className="space-x-1">
        {' '}
        <Button
          aria-label="Modify"
          onPress={() =>
            navigate('/transactions/set', {
              state: {
                navigateTo: '/planning',
                transaction: {
                  id: transaction.id,
                  raccount: transaction.raccountMeta.id,
                  description: transaction.description,
                  category: transaction.category,
                  type: transaction.type,
                  start: transaction.start.toString(),
                  ending: transaction.ending?.toString() ?? 'never',
                  rtype: transaction.rtype,
                  beginAfterOccurrences: transaction.beginAfterOccurrences ?? 0,
                  cycle: transaction.cycle,
                  value: parseFloat(toDecimal(transaction.value)),
                  valueType: transaction.valueType ?? 'static'
                }
              }
            })
          }
          // isDisabled={transaction.fromAccount}
        >
          <Pencil className="max-h-3" />
        </Button>
        <Button
          aria-label="Delete"
          onPress={() => dispatch(transactionRemove({ id: transaction.id }))}
          // isDisabled={transaction.fromAccount}
        >
          <Trash2 className="max-h-3" />
        </Button>
      </Group>
    </Cell>
  </Row>
);
