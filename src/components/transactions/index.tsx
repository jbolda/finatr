import React, { useState } from 'react';
import { Header, type Selection } from 'react-aria-components';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { useDispatch } from 'starfx/react';

import type { TransactionWithAccount } from '~/src/store/selectors/transactions';

import {
  MenuTrigger,
  Menu,
  MenuItem,
  MenuSection
} from '~/src/components/Menu';
import { Separator } from '~/src/components/Separator';
import { Tag, TagGroup } from '~/src/components/TagGroup';

import { Button } from '~/src/elements/Button.tsx';

import { TransactionCards } from './TransactionCard';
import { TransactionTable } from './TransactionTable';
import { TransactionTimeline } from './TransactionTimeline';
import { TransactionFilter } from './utils';

const TransactionsFlow = ({
  transactions
}: {
  transactions: TransactionWithAccount[];
}) => {
  const navigate = useNavigate();
  const [transactionFilter, setTransactionFilter] =
    useState<TransactionFilter>('all');
  const [activeView, setActiveView] = useState<Selection>(new Set(['table']));

  return (
    <>
      <div className="flex py-2">
        <TagGroup
          selectionMode="multiple"
          defaultSelectedKeys={'all'}
          onSelectionChange={(keys) => setTransactionFilter(keys)}
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
                <MenuItem id="timeline">as Timeline</MenuItem>
              </MenuSection>
            </Menu>
          </MenuTrigger>
        </div>
      </div>
      <DisplayTransactions
        navigate={navigate}
        // @ts-expect-error just pulling it out of a Set
        activeView={[...activeView.entries()][0][0]}
        transactions={transactions}
        transactionFilter={transactionFilter}
      />
    </>
  );
};

export default TransactionsFlow;

const DisplayTransactions = ({
  navigate,
  activeView,
  transactions,
  transactionFilter
}: {
  navigate: NavigateFunction;
  activeView: 'all' | 'table' | 'cards' | 'timeline' | string | object;
  transactions: TransactionWithAccount[];
  transactionFilter: TransactionFilter;
}) => {
  const dispatch = useDispatch();

  switch (activeView) {
    case 'all':
    case 'table':
      return (
        <TransactionTable
          label="Transactions"
          transactions={transactions}
          transactionFilter={transactionFilter}
          navigate={navigate}
          dispatch={dispatch}
        />
      );
    case 'cards':
      return (
        <TransactionCards
          transactions={transactions}
          transactionFilter={transactionFilter}
          navigate={navigate}
          dispatch={dispatch}
        />
      );
    case 'timeline':
      return (
        <TransactionTimeline
          transactions={transactions}
          transactionFilter={transactionFilter}
          navigate={navigate}
          dispatch={dispatch}
        />
      );
  }
};
