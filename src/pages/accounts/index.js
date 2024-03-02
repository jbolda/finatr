import React from 'react';
import BarChart from './barChart';

const AccountInfo = (props) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold py-3">Cash Flow By Account</h1>
      {model.charts.state.AccountChart.map((account) => (
        <div className="bg-white my-2 py-1 overflow-hidden shadow rounded-lg divide-y divide-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-2xl font-semibold">{account.account.name}</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <BarChart data={model.charts.state} account={account} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccountInfo;
