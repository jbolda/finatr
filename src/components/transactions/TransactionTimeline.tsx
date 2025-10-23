import format from 'date-fns/format';
import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import { Group } from 'react-aria-components';
import type { NavigateFunction } from 'react-router-dom';
import type { Dispatch } from 'redux';
import type { AnyAction } from 'starfx';
import { useSelector } from 'starfx/react';
import { tv } from 'tailwind-variants';

import { transactionsInTimeline } from '~/src/store/selectors/transactions';
import { transactionRemove } from '~/src/store/thunks';
import { toHumanCurrency } from '~/src/store/utils/dineroUtils';

import { Button } from '~/src/elements/Button';

import { navigateToTransactionForm } from './utils';
import type { TransactionFilter } from './utils';

export const TransactionTimeline = ({
  navigate,
  dispatch,
  transactionFilter
}: {
  navigate: NavigateFunction;
  dispatch: Dispatch<AnyAction>;
  transactionFilter: TransactionFilter;
}) => {
  const transactionsTimeline = useSelector(transactionsInTimeline);

  return (
    <div className="flow-root">
      <ul role="list" className="space-y-6">
        {transactionsTimeline
          .filter((d) => d.transactions.length > 0)
          .map((d, eventIdx) => (
            <li key={eventIdx} className="relative flex gap-x-4">
              {eventIdx === transactionsTimeline.length - 1 ? (
                <div className="h-6 absolute left-0 top-0 flex w-6 justify-center">
                  <div className="w-px bg-gray-200" />
                </div>
              ) : (
                <div className="-bottom-6 absolute left-0 top-0 flex w-6 justify-center">
                  <div className="w-px bg-gray-200" />
                </div>
              )}
              <>
                <div className="relative flex size-6 flex-none items-center justify-center bg-white">
                  <div className="size-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                </div>
                <div className="flex-auto py-0.5 text-xs/5 text-gray-500">
                  <span className="font-medium text-gray-900">
                    {d.date.toLocaleDateString()}
                  </span>{' '}
                  {format(d.date, 'EEEE')}
                  {d.transactions
                    .filter(
                      (transaction) =>
                        transactionFilter === 'all' ||
                        transactionFilter.has(transaction.type)
                    )
                    .map((t) => (
                      <p
                        key={t.id}
                        className="flex gap-3 max-w-md text-gray-500 py-1 sm:py-0"
                      >
                        <span className="flex-auto gap-3">
                          <span className="text-black">{t.raccount}</span>
                          <span>
                            <span className="flex-none text-gray-800">
                              {t.category ? ` ${t.category}` : ''}
                            </span>
                            {t.description ? ` ${t.description}` : ''}
                          </span>
                        </span>
                        <span className="justify-end flex flex-wrap gap-x-3">
                          <span
                            className={transactionTypeColor({ type: t.type })}
                          >
                            {transactionTypeToSymbol(t.type)}
                            {toHumanCurrency(t.value)}
                          </span>
                          <Group
                            aria-label="Actions"
                            className="flex-none space-x-1"
                          >
                            <Button
                              aria-label="Modify"
                              className="py-0.5 px-0.5"
                              onPress={() =>
                                navigate(
                                  '/transactions/set',
                                  navigateToTransactionForm(t)
                                )
                              }
                            >
                              <Pencil className="max-h-3" />
                            </Button>
                            <Button
                              aria-label="Delete"
                              className="py-0.5 px-0.5"
                              onPress={() =>
                                dispatch(transactionRemove({ id: t.id }))
                              }
                            >
                              <Trash2 className="max-h-3" />
                            </Button>
                          </Group>
                        </span>
                      </p>
                    ))}
                </div>
              </>
            </li>
          ))}
      </ul>
    </div>
  );
};

const transactionTypeColor = tv({
  base: '',
  variants: {
    type: {
      income: 'text-green-700',
      transfer: 'text-purple-700',
      expense: 'text-red-700'
    }
  }
});

const transactionTypeToSymbol = (type: string) => {
  switch (type) {
    case 'income':
      return '+';
    case 'expense':
      return '-';
    case 'transfer':
      return '⇄';
    default:
      return '';
  }
};
