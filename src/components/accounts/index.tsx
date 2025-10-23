import React, { useState } from 'react';
import { Header } from 'react-aria-components';
import type { Selection } from 'react-aria-components';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'starfx/react';

import type { AccountWithDinero } from '~/src/store/selectors/accounts.ts';

import {
  MenuTrigger,
  Menu,
  MenuItem,
  MenuSection
} from '~/src/components/Menu';
import { Separator } from '~/src/components/Separator';
import { Tag, TagGroup } from '~/src/components/TagGroup';

import { Button } from '~/src/elements/Button.tsx';

import { AccountCard } from './AccountCard';
import { AccountTable } from './AccountTable';

const AccountFlow = ({ accounts }: { accounts: AccountWithDinero[] }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [accountFilter, setAccountFilter] = useState<Selection>('all');
  const [activeView, setActiveView] = useState<Selection>(new Set(['table']));
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
