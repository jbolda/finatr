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

import { AmountVehicle, schema, type Account } from '~/src/store/schema.ts';
import { accountRemove } from '~/src/store/thunks/accounts.ts';
import {
  floatFromDinero,
  floatFromScaled,
  toHumanCurrency,
  toHumanInterest
} from '~/src/store/utils/dineroUtils.ts';

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
} from '~/src/components/Table';
import { Tag, TagGroup } from '~/src/components/TagGroup';

import { Button } from '~/src/elements/Button.tsx';

const navigateToAccountForm = (account: Account) => {
  return {
    state: {
      account: {
        id: account.id,
        name: account.name,
        starting: floatFromDinero(account.starting),
        interest: floatFromScaled(account.interest),
        vehicle: account.vehicle
      }
    }
  };
};

const determineVehicleColor = (vehicle: AmountVehicle) => {
  switch (vehicle) {
    case 'operating':
      return 'blue';
    case 'investment':
      return 'green';
    default:
      return 'amber';
  }
};

const AccountFlow = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [accountFilter, setAccountFilter] = useState<Selection>('all');
  const [activeView, setActiveView] = useState<Selection>(new Set(['table']));
  const accounts = useSelector(schema.accounts.selectTableAsList);
  const viewingAccounts = accounts.filter(
    (account) => accountFilter === 'all' || accountFilter.has(account.vehicle)
  );

  return (
    <>
      <div className="flex py-2">
        <TagGroup
          selectionMode="multiple"
          defaultSelectedKeys={'all'}
          onSelectionChange={setAccountFilter}
        >
          <Tag id="operating" className="py-2 px-4">
            Operating
          </Tag>
          <Tag id="investment" className="py-2 px-4">
            Investment
          </Tag>
          <Tag id="debt" className="py-2 px-4">
            Debt
          </Tag>
          <Tag id="loan" className="py-2 px-4">
            Loan
          </Tag>
          <Tag id="credit line" className="py-2 px-4">
            Credit Line
          </Tag>
        </TagGroup>
        <div className="grow flex justify-end">
          <MenuTrigger>
            <Button aria-label="Menu">...</Button>
            <Menu>
              <MenuSection>
                <Header>Actions</Header>
                <MenuItem onAction={() => navigate('/accounts/set')}>
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
          {viewingAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              navigate={navigate}
              dispatch={dispatch}
            />
          ))}
        </div>
      ) : (
        <AccountTable
          label="Accounts"
          accounts={viewingAccounts}
          navigate={navigate}
          dispatch={dispatch}
        />
      )}
    </>
  );
};

export default AccountFlow;

const AccountCard = ({
  account,
  navigate,
  dispatch
}: {
  account: Account;
  navigate: NavigateFunction;
  dispatch: Dispatch<AnyAction>;
}) => {
  const vehicleColor = determineVehicleColor(account.vehicle);
  return (
    <div>
      <div className="lg:col-start-3 lg:row-end-1">
        <h2 className="sr-only">Account</h2>
        <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex flex-wrap">
            <dl className="flex-auto pl-6 pt-3">
              <dt className="sr-only">Account Name</dt>
              <dd className="text-sm/6 font-semibold text-gray-900">
                {account.name}
              </dd>
            </dl>
            <dl className="flex-none self-end px-6 pt-4">
              <dt className="sr-only">Vehicle</dt>
              <dd
                className={`inline-flex items-center rounded-md bg-${vehicleColor}-50 px-2 py-1 text-xs font-medium text-${vehicleColor}-700 ring-1 ring-inset ring-${vehicleColor}-600/20`}
              >
                {account.vehicle}
              </dd>
            </dl>

            <div className="my-2 flex w-full flex-none justify-between px-6">
              <dl className="flex flex-wrap items-baseline justify-between">
                <dt className="w-full flex-none text-sm/6 font-medium text-gray-500">
                  Balance
                </dt>
                <dd className="text-3xl/10 font-medium tracking-tight text-gray-900">
                  {toHumanCurrency(account.starting)}
                </dd>
                <dd className="text-sm font-medium">
                  {toHumanInterest(account.interest)}%
                </dd>
              </dl>
              <Group aria-label="Actions" className="space-x-1">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountTable = ({
  label,
  accounts,
  navigate,
  dispatch
}: {
  label: string;
  accounts: Account[];
  navigate: NavigateFunction;
  dispatch: Dispatch<AnyAction>;
}) => {
  const [sortable, setSetSortable] = useState<{
    column: Key;
    direction: 'ascending' | 'descending';
  }>({ column: 'Vehicle', direction: 'descending' });

  return (
    <Table
      aria-label={label}
      selectionMode="none"
      onSortChange={(item) => setSetSortable(item)}
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
  account: Account;
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
