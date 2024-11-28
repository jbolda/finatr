import { toDecimal } from 'dinero.js';
import { Pencil, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import {
  type ColumnProps,
  Group,
  Header,
  Key,
  type Selection
} from 'react-aria-components';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import type { Dispatch } from 'redux';
import type { AnyAction } from 'starfx';
import { useDispatch, useSelector } from 'starfx/react';

import {
  transactionsWithAccounts,
  TransactionWithAccount
} from '~/src/store/selectors/transactions';
import { transactionRemove } from '~/src/store/thunks/transactions.ts';
import { toHumanCurrency } from '~/src/store/utils/dineroUtils.ts';

import {
  MenuTrigger,
  Menu,
  MenuItem,
  MenuSection
} from '~/src/components/Menu';
import { Separator } from '~/src/components/Separator';
import { TabView } from '~/src/components/TabView.tsx';
import {
  Cell,
  Column,
  Row,
  singleSort,
  Table,
  TableBody,
  TableHeader
} from '~/src/components/Table.tsx';

import { Button } from '~/src/elements/Button.tsx';

const TransactionsFlow = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<Selection>(new Set(['table']));
  const transactions = useSelector(transactionsWithAccounts);

  return (
    <>
      <MenuTrigger>
        <Button aria-label="Menu">...</Button>
        <Menu>
          <MenuSection>
            <MenuItem onAction={() => navigate('/transactions/set')}>
              Add...
            </MenuItem>
          </MenuSection>
          <Separator />
          <MenuSection
            selectionMode="single"
            selectedKeys={activeView}
            onSelectionChange={setActiveView}
          >
            <Header>View</Header>
            <MenuItem id="table">as Table</MenuItem>
            <MenuItem id="cards">as Cards</MenuItem>
          </MenuSection>
        </Menu>
      </MenuTrigger>
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
            <TransactionTable
              label="All Transactions"
              transactions={transactions}
              view={activeView}
            />
          </React.Fragment>,
          <TransactionTable
            label="Income"
            transactions={transactions.filter(
              (transaction) => transaction.type === 'income'
            )}
            view={activeView}
          />,
          <TransactionTable
            label="Expense"
            transactions={transactions.filter(
              (transaction) => transaction.type === 'expense'
            )}
            view={activeView}
          />,
          <TransactionTable
            label="Transfer"
            transactions={transactions.filter(
              (transaction) => transaction.type === 'transfer'
            )}
            view={activeView}
          />
        ]}
      />
    </>
  );
};

export default TransactionsFlow;

const TransactionTable = ({
  label,
  transactions,
  view
}: {
  label: string;
  transactions: TransactionWithAccount[];
  view: Selection;
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sortable, setSetSortable] = useState<{
    column: string;
    direction: 'ascending' | 'descending';
  }>({ column: 'type', direction: 'descending' });

  if (view !== 'all' && view.has('cards'))
    return <pre>{JSON.stringify(transactions, null, 2)}</pre>;
  console.log(view);
  return (
    <Table
      aria-label={label}
      selectionMode="none"
      onSortChange={(item) => setSetSortable(item)}
      sortDescriptor={sortable}
    >
      <TableHeader>
        <Column id="raccount" defaultWidth="4fr" isRowHeader allowsSorting>
          Account
        </Column>
        {(
          [
            ['Description', '4fr'],
            ['Category', '2fr'],
            ['Type', '3fr'],
            ['Frequency', '4fr'],
            ['Value', '2fr'],
            ['Daily Rate', '1fr'],
            ['Actions', '2fr']
          ] as [string, ColumnProps['defaultWidth']][]
        ).map((h) => (
          <Column key={h[0]} id={h[0]} defaultWidth={h[1]} allowsSorting>
            {h[0]}
          </Column>
        ))}
      </TableHeader>
      <TableBody renderEmptyState={() => 'No transactions.'}>
        {transactions.sort(singleSort(sortable)).map((transaction) => (
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
    <Cell>
      {transaction.type}
      {transaction.transferIn
        ? `${transaction.type === 'expense' ? ' paid' : ''} to ${transaction.transferIn}`
        : ``}
    </Cell>
    <Cell>
      {transaction.rtype} {transaction.cycle} at {transaction.start}
    </Cell>
    <Cell>{toHumanCurrency(transaction.value)}</Cell>
    <Cell>{toHumanCurrency(transaction.dailyRate)}</Cell>

    <Cell>
      <Group aria-label="Actions" className="space-x-1">
        <Button
          aria-label="Modify"
          className="px-0.5"
          onPress={() =>
            navigate('/transactions/set', {
              state: {
                navigateTo: '/planning',
                transaction: {
                  id: transaction.id,
                  raccount: transaction.raccountMeta.id,
                  transferIn: transaction.transferInMeta?.id,
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
          className="px-0.5"
          onPress={() => dispatch(transactionRemove({ id: transaction.id }))}
          // isDisabled={transaction.fromAccount}
        >
          <Trash2 className="max-h-3" />
        </Button>
      </Group>
    </Cell>
  </Row>
);
