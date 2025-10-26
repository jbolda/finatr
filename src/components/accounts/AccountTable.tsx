import { Pencil, Search, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Group } from 'react-aria-components';
import type { ColumnProps } from 'react-aria-components';
import type { NavigateFunction } from 'react-router-dom';
import type { Dispatch } from 'redux';
import type { AnyAction } from 'starfx';

import { type AccountWithDinero } from '~/store/selectors/accounts.ts';
import { accountRemove } from '~/store/thunks/accounts.ts';
import { toHumanCurrency, toHumanInterest } from '~/store/utils/dineroUtils.ts';

import {
  Cell,
  Column,
  Row,
  singleSort,
  Table,
  TableBody,
  TableHeader
} from '~/components/Table.tsx';

import { Button } from '~/elements/Button.tsx';

import { navigateToAccountForm } from './utils';

export const AccountTable = ({
  label,
  accounts,
  navigate,
  dispatch
}: {
  label: string;
  accounts: AccountWithDinero[];
  navigate: NavigateFunction;
  dispatch: Dispatch<AnyAction>;
}) => {
  const [sortable, setSetSortable] = useState<{
    column: string;
    direction: 'ascending' | 'descending';
  }>({ column: 'Vehicle', direction: 'descending' });

  return (
    <Table
      aria-label={label}
      selectionMode="none"
      onSortChange={(item) =>
        setSetSortable({
          column: String(item.column),
          direction: item.direction
        })
      }
      sortDescriptor={sortable}
    >
      <TableHeader>
        <Column id="name" defaultWidth="3fr" isRowHeader allowsSorting>
          Name
        </Column>
        {(
          [
            ['Starting', '2fr'],
            ['Interest', '1fr'],
            ['Vehicle', '2fr'],
            ['Actions', '2fr']
          ] as [string, ColumnProps['defaultWidth']][]
        ).map((h) => (
          <Column key={h[0]} id={h[0]} defaultWidth={h[1]} allowsSorting>
            {h[0]}
          </Column>
        ))}
      </TableHeader>
      <TableBody renderEmptyState={() => 'No accounts.'}>
        {accounts.sort(singleSort(sortable)).map((account) => (
          <AccountRow
            key={account.id}
            account={account}
            navigate={navigate}
            dispatch={dispatch}
          />
        ))}
      </TableBody>
    </Table>
  );
};

const AccountRow = ({
  account,
  navigate,
  dispatch
}: {
  account: AccountWithDinero;
  navigate: NavigateFunction;
  dispatch: Dispatch<AnyAction>;
}) => (
  <Row>
    <Cell>{account.name}</Cell>
    <Cell>{toHumanCurrency(account.starting)}</Cell>
    <Cell>{toHumanInterest({ ...account.interest, trailingSymbol: '%' })}</Cell>
    <Cell>{account.vehicle}</Cell>
    <Cell>
      <Group aria-label="Actions" className="space-x-1">
        <Button
          aria-label="View"
          onPress={() => navigate(`/accounts/view/${account.id}`)}
          className="px-0.5"
        >
          <Search className="max-h-3" />
        </Button>
        <Button
          aria-label="Modify"
          onPress={() =>
            navigate('/accounts/set', navigateToAccountForm(account))
          }
          className="px-0.5"
        >
          <Pencil className="max-h-3" />
        </Button>
        <Button
          aria-label="Delete"
          onPress={() => dispatch(accountRemove({ id: account.id }))}
          className="px-0.5"
        >
          <Trash2 className="max-h-3" />
        </Button>
      </Group>
    </Cell>
  </Row>
);
