import format from 'date-fns/format';
import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import { Group } from 'react-aria-components';
import { NavigateFunction } from 'react-router-dom';
import type { Dispatch } from 'redux';
import type { AnyAction } from 'starfx';
import { useSelector } from 'starfx/react';
import { tv } from 'tailwind-variants';

import { transactionsInTimeline } from '~/src/store/selectors/transactions';
import { transactionRemove } from '~/src/store/thunks';
import { toHumanCurrency } from '~/src/store/utils/dineroUtils';

import { Button } from '~/src/elements/Button';

import { navigateToTransactionForm, TransactionFilter } from './utils';

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
                      <p className="flex gap-3 max-w-md text-gray-700">
                        <span className="text-black flex-none">
                          {t.raccount}
                        </span>
                        <span className="flex-none text-gray-800">
                          {t.category}
                        </span>
                        <span className="flex-auto">
                          {t.description ? `${t.description}` : ''}
                        </span>
                        <span
                          className={transactionTypeColor({ type: t.type })}
                        >
                          {transactionTypeToSymbol(t.type)}
                          {toHumanCurrency(t.value)}
                        </span>
                        <Group aria-label="Actions" className="space-x-1">
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
  base: 'flex-none',
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
