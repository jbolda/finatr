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
            <Header>Actions</Header>
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

const TransactionCard = ({
  transaction,
  navigate,
  dispatch
}: {
  transaction: TransactionWithAccount;
  navigate: NavigateFunction;
  dispatch: Dispatch<AnyAction>;
}) => {
  console.log(transaction);
  return (
    <div>
      <div className="lg:col-start-3 lg:row-end-1">
        <h2 className="sr-only">Transaction</h2>
        <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
          <dl className="flex flex-wrap">
            <div className="flex-auto pl-6 pt-3">
              <dt className="text-sm/6 font-semibold text-gray-900">
                {transaction.raccount}
              </dt>
              <dd className="mt-1 text-base font-semibold text-gray-900">
                {transaction.description}
              </dd>
            </div>
            <div className="flex-none self-end px-6 pt-4">
              <dt className="sr-only">Category</dt>
              <dd className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                {transaction.category}
              </dd>
            </div>
            <div className="my-2 flex w-full flex-none gap-x-4 px-6">
              <dt className="flex-none">
                <span className="sr-only">Unknown</span>
                {transaction.rtype}
              </dt>
              <dd className="text-sm/6 text-gray-500">
                <time dateTime="2023-01-31">{transaction.start}</time>
              </dd>
            </div>

            <div className="my-2 flex w-full flex-none gap-x-4 px-6">
              <dl className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-4 py-1 sm:px-2 xl:px-4">
                <dt className="text-sm/6 font-medium text-gray-500">
                  {transaction.type}
                </dt>
                <dd className="text-xs font-medium">
                  {toHumanCurrency(transaction.dailyRate)} per day
                </dd>
                <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
                  {toHumanCurrency(transaction.value)}
                </dd>
              </dl>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

const navigateToTransactionForm = (transaction: TransactionWithAccount) => {
  return {
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
  };
};

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
    return (
      <div className="grid gap-4 grid-cols-3">
        <h3 className="text-base font-semibold text-gray-900">Transactions</h3>
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.description}
            transaction={transaction}
            navigate={navigate}
            dispatch={dispatch}
          />
        ))}
      </div>
    );

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
            navigate(
              '/transactions/set',
              navigateToTransactionForm(transaction)
            )
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
