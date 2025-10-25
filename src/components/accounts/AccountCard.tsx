import { Pencil, Search, Trash2 } from 'lucide-react';
import React from 'react';
import { Group } from 'react-aria-components';
import { NavigateFunction } from 'react-router-dom';
import type { Dispatch } from 'redux';
import type { AnyAction } from 'starfx';
import { tv } from 'tailwind-variants';

import { type Account } from '~/store/schema.ts';
import { accountRemove } from '~/store/thunks/accounts.ts';
import { toHumanCurrency, toHumanInterest } from '~/store/utils/dineroUtils.ts';

import { Button } from '~/elements/Button.tsx';

import { navigateToAccountForm } from './utils';

const accountVehicleTag = tv({
  base: `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset`,
  variants: {
    vehicle: {
      operating: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      investment: 'bg-green-50 text-green-700 ring-green-600/20',
      debt: 'bg-amber-50 text-amber-700 ring-amber-600/20',
      loan: 'bg-amber-50 text-amber-700 ring-amber-600/20',
      'credit line': 'bg-amber-50 text-amber-700 ring-amber-600/20'
    }
  }
});

export const AccountCard = ({
  account,
  navigate,
  dispatch
}: {
  account: Account;
  navigate: NavigateFunction;
  dispatch: Dispatch<AnyAction>;
}) => {
  return (
    <div>
      <div className="lg:col-start-3 lg:row-end-1">
        <h2 className="sr-only">Account</h2>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex flex-wrap">
            <dl className="flex-auto pl-6 pt-3">
              <dt className="sr-only">Account Name</dt>
              <dd className="text-sm/6 font-semibold text-gray-900">
                {account.name}
              </dd>
            </dl>
            <dl className="flex-none self-end px-6 pt-4">
              <dt className="sr-only">Vehicle</dt>
              <dd className={accountVehicleTag({ vehicle: account.vehicle })}>
                {account.vehicle}
              </dd>
            </dl>

            <div className="my-2 flex w-full flex-none justify-between px-6">
              <dl className="flex flex-wrap items-baseline justify-between">
                <dt className="w-full flex-none text-sm/6 font-medium text-gray-500">
                  Balance at {toHumanInterest(account.interest)}%
                </dt>
                <dd className="text-3xl/10 font-medium tracking-tight text-gray-900">
                  {toHumanCurrency(account.starting)}
                </dd>
              </dl>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
