import React, { useState } from 'react';
import { Header } from 'react-aria-components';
import type { Selection } from 'react-aria-components';
import type { NavigateFunction } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'starfx/react';

import type { TransactionWithAccount } from '~/store/selectors/transactions';

import {
  MenuTrigger,
  Menu,
  MenuItem,
  MenuSection
} from '~/components/Menu.tsx';
import { Separator } from '~/components/Separator.tsx';
import { Tag, TagGroup } from '~/components/TagGroup.tsx';

import { Button } from '~/elements/Button.tsx';

import { TransactionCards } from './TransactionCard';
import { TransactionTable } from './TransactionTable';
import { TransactionTimeline } from './TransactionTimeline';
import type { TransactionFilter } from './utils';

type DisplayTransactionsProps = {
  navigate: NavigateFunction;
  activeView: 'all' | 'table' | 'cards' | 'timeline' | string | object;
  transactions: TransactionWithAccount[];
  transactionFilter: TransactionFilter;
};

const DisplayTransactions: React.FC<DisplayTransactionsProps> = ({
  navigate,
  activeView,
  transactions,
  transactionFilter
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
          transactionFilter={transactionFilter}
          navigate={navigate}
          dispatch={dispatch}
        />
      );
    default:
      return null;
  }
};

const TransactionsFlow = ({
  transactions
}: {
  transactions: TransactionWithAccount[];
}) => {
  const navigate = useNavigate();
  const [transactionFilter, setTransactionFilter] =
    useState<TransactionFilter>('all');
  const [activeView, setActiveView] = useState<Selection>(new Set(['table']));

  const selectedKey = [...activeView][0] as string | undefined;
  const selectedView = (selectedKey ?? 'table') as
    | 'all'
    | 'table'
    | 'cards'
    | 'timeline'
    | string
    | object;

  const displayProps: DisplayTransactionsProps = {
    navigate,
    activeView: selectedView,
    transactions,
    transactionFilter
  };

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
      <DisplayTransactions {...displayProps} />
    </>
  );
};

export default TransactionsFlow;
