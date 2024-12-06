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
import { tv } from 'tailwind-variants';

import {
  transactionsWithAccounts,
  TransactionWithAccount
} from '~/src/store/selectors/transactions';
import { transactionRemove } from '~/src/store/thunks/transactions.ts';
import { toHumanCurrency } from '~/src/store/utils/dineroUtils.ts';
import {
  nextOccurrence,
  toHumanReoccurrence
} from '~/src/store/utils/reoccurrence';

import {
  MenuTrigger,
  Menu,
  MenuItem,
  MenuSection
} from '~/src/components/Menu';
import { Separator } from '~/src/components/Separator';
import {
  Cell,
  Column,
  Row,
  singleSort,
  Table,
  TableBody,
  TableHeader
} from '~/src/components/Table.tsx';
import { Tag, TagGroup } from '~/src/components/TagGroup';

import { Button } from '~/src/elements/Button.tsx';

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

const TransactionsFlow = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [transactionFilter, setTransactionFilter] = useState<Selection>('all');
  const [activeView, setActiveView] = useState<Selection>(new Set(['table']));
  const transactions = useSelector(transactionsWithAccounts);
  const viewingTransactions = transactions.filter(
    (transaction) =>
      transactionFilter === 'all' || transactionFilter.has(transaction.type)
  );

  return (
    <>
      <div className="flex py-2">
        <TagGroup
          selectionMode="multiple"
          defaultSelectedKeys={'all'}
          onSelectionChange={setTransactionFilter}
        >
          <Tag id="income" className="py-2 px-4">
            Income
          </Tag>
          <Tag id="expense" className="py-2 px-4">
            Expenses
          </Tag>
          <Tag id="transfer" className="py-2 px-4">
            Transfers
          </Tag>
        </TagGroup>
        <div className="grow flex justify-end">
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
        </div>
      </div>
      {activeView !== 'all' && activeView.has('cards') ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {viewingTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              navigate={navigate}
              dispatch={dispatch}
            />
          ))}
        </div>
      ) : (
        <TransactionTable
          label="Transactions"
          transactions={viewingTransactions}
          navigate={navigate}
          dispatch={dispatch}
        />
      )}
    </>
  );
};

const transactionTagCategory = tv({
  base: 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
  variants: {
    type: {
      income: 'bg-green-50 text-green-700 ring-green-600',
      transfer: 'bg-purple-50 text-purple-700 ring-purple-600',
      expense: 'bg-red-50 text-red-700 ring-red-600'
    }
  }
});

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
  return (
    <div>
      <div className="lg:col-start-3 lg:row-end-1">
        <h2 className="sr-only">Transaction</h2>
        <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex flex-wrap">
            <div className="flex-auto pl-6 pt-3">
              <dt className="text-sm/6 font-semibold text-gray-900">
                {transaction.raccount}
              </dt>
              <dd className="mt-1 text-base font-semibold text-gray-900">
                {transaction.description}
              </dd>
            </div>
            <div className="flex-none self-end justify-items-end px-6 pt-4">
              <div className="text-sm/6 font-medium text-gray-500">
                {transaction.type}
              </div>
              <div
                className={transactionTagCategory({ type: transaction.type })}
              >
                {transaction.category}
              </div>
            </div>
            <dl className="my-2 flex flex-wrap px-6">
              <dt className="sr-only">Frequency Of Transaction</dt>
              <dd className="flex-none w-full">
                {toHumanReoccurrence(transaction)}
              </dd>
              <dd className="text-sm/6 font-medium text-gray-500">
                {nextOccurrence(transaction)}
              </dd>
            </dl>

            <div className="my-2 flex w-full flex-none justify-between px-6">
              <dl className="flex flex-wrap items-baseline justify-between">
                <dt className="sr-only">Amount With Daily Rate</dt>
                <dd className="text-sm/6 font-medium text-gray-500">
                  {toHumanCurrency(transaction.dailyRate)} per day
                </dd>
                <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
                  {toHumanCurrency(transaction.value)}
                </dd>
              </dl>
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
                >
                  <Pencil className="max-h-3" />
                </Button>
                <Button
                  aria-label="Delete"
                  className="px-0.5"
                  onPress={() =>
                    dispatch(transactionRemove({ id: transaction.id }))
                  }
                >
                  <Trash2 className="max-h-3" />
                </Button>
              </Group>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TransactionTable = ({
  label,
  transactions,
  navigate,
  dispatch
}: {
  label: string;
  transactions: TransactionWithAccount[];
  navigate: NavigateFunction;
  dispatch: Dispatch<AnyAction>;
}) => {
  const [sortable, setSetSortable] = useState<{
    column: Key;
    direction: 'ascending' | 'descending';
  }>({ column: 'type', direction: 'descending' });

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
        >
          <Pencil className="max-h-3" />
        </Button>
        <Button
          aria-label="Delete"
          className="px-0.5"
          onPress={() => dispatch(transactionRemove({ id: transaction.id }))}
        >
          <Trash2 className="max-h-3" />
        </Button>
      </Group>
    </Cell>
  </Row>
);
