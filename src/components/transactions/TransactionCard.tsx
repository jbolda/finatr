import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import { Group } from 'react-aria-components';
import type { NavigateFunction } from 'react-router-dom';
import type { Dispatch } from 'redux';
import type { AnyAction } from 'starfx';
import { tv } from 'tailwind-variants';

import { type TransactionWithAccount } from '~/src/store/selectors/transactions';
import { transactionRemove } from '~/src/store/thunks/transactions.ts';
import { toHumanCurrency } from '~/src/store/utils/dineroUtils.ts';
import {
  nextOccurrence,
  toHumanReoccurrence
} from '~/src/store/utils/reoccurrence';

import { Button } from '~/src/elements/Button.tsx';

import { navigateToTransactionForm } from './utils';
import type { TransactionFilter } from './utils';

export const TransactionCards = ({
  navigate,
  dispatch,
  transactions,
  transactionFilter
}: {
  navigate: NavigateFunction;
  dispatch: Dispatch<AnyAction>;
  transactions: TransactionWithAccount[];
  transactionFilter: TransactionFilter;
}) => {
  const transactionsFiltered = transactions.filter(
    (transaction) =>
      transactionFilter === 'all' || transactionFilter.has(transaction.type)
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {transactionsFiltered.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          navigate={navigate}
          dispatch={dispatch}
        />
      ))}
    </div>
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
