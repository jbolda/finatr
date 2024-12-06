import React from 'react';

import Accounts from '../planning/accounts.tsx';
import BarChart from './barChart';

const AccountOverview = () => {
  return (
    <React.Fragment>
      <h1 className="text-3xl font-semibold py-3">Accounts</h1>
      <Accounts />
      {/* <div className="my-2 py-1 overflow-hidden shadow rounded-lg divide-y divide-gray-200">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-2xl font-semibold">{account.account.name}</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <BarChart data={model.charts.state} account={account} />
        </div>
      </div> */}
    </React.Fragment>
  );
};

export default AccountOverview;
