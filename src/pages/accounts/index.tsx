import { parseDate } from '@internationalized/date';
import { format, parseISO } from 'date-fns';
import React from 'react';
import { useDispatch, useSelector } from 'starfx/react';

import { schema } from '~/src/store/schema.ts';
import { updateAccountSnapshotDate } from '~/src/store/thunks/accounts.ts';

import { DatePicker } from '~/src/components/DatePicker.tsx';

import Accounts from '../../components/accounts/index.tsx';
import BarChart from './barChart';

const AccountOverview = () => {
  const dispatch = useDispatch();
  const { snapshotDate } = useSelector(schema.accountMeta.select);
  const accounts = useSelector(schema.accounts.selectTableAsList);

  return (
    <>
      <h1 className="text-3xl font-semibold">Accounts</h1>
      <DatePicker
        label="Starting Date"
        value={parseDate(format(snapshotDate, 'yyyy-MM-dd'))}
        onChange={(calendar) =>
          dispatch(updateAccountSnapshotDate(calendar.toString()))
        }
      />
      <Accounts accounts={accounts} />
      {/* <div className="my-2 py-1 overflow-hidden shadow rounded-lg divide-y divide-gray-200">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-2xl font-semibold">{account.account.name}</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <BarChart data={model.charts.state} account={account} />
        </div>
      </div> */}
    </>
  );
};

export default AccountOverview;
