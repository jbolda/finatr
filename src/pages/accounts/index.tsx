import { parseDate } from '@internationalized/date';
import React from 'react';
import { useDispatch, useSelector } from 'starfx/react';

import { loroSchema as schema } from '~/store/schema/index.ts';
import { accountsFromSerialized } from '~/store/selectors/accounts.ts';
import { updateAccountSnapshotDate } from '~/store/thunks/accounts.ts';

import { DatePicker } from '~/components/DatePicker.tsx';

import Accounts from '../../components/accounts/index.tsx';

// import BarChart from './barChart';

const AccountOverview = () => {
  const dispatch = useDispatch();
  // use raw string so react-aria can parse it however it needs
  const { snapshotDate } = useSelector(schema.accountMeta.select);
  const accounts = useSelector(accountsFromSerialized);

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <h1 className="col-span-2 text-3xl font-semibold">Accounts</h1>
        <DatePicker
          label="Date Of Account Balances"
          value={parseDate(snapshotDate)}
          onChange={(calendar) => dispatch(updateAccountSnapshotDate(calendar))}
        />
      </div>
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
