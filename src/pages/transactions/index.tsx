import React from 'react';

import Transactions from '../../components/transactions/index.tsx';

const TransactionsOverview = (props) => {
  return (
    <div className="container mx-auto my-2 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold py-3">Transactions</h1>
      <Transactions />
    </div>
  );
};

export default TransactionsOverview;
