import { Pencil, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { type ColumnProps, Group, Key } from 'react-aria-components';
import { NavigateFunction } from 'react-router-dom';
import type { Dispatch } from 'redux';
import type { AnyAction } from 'starfx';
import { useSelector } from 'starfx/react';

import {
  transactionsWithAccounts,
  TransactionWithAccount
} from '~/src/store/selectors/transactions';
import { transactionRemove } from '~/src/store/thunks/transactions.ts';
import { toHumanCurrency } from '~/src/store/utils/dineroUtils.ts';

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

import { navigateToTransactionForm, TransactionFilter } from './utils';

export const TransactionTable = ({
  label,
  transactionFilter,
  navigate,
  dispatch
}: {
  label: string;
  transactionFilter: TransactionFilter;
  navigate: NavigateFunction;
  dispatch: Dispatch<AnyAction>;
}) => {
  const allTransactions = useSelector(transactionsWithAccounts);
  const transactions = allTransactions.filter(
    (transaction) =>
      transactionFilter === 'all' || transactionFilter.has(transaction.type)
  );

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
