import React from 'react';

import Transactions from '~/src/components/transactions/index.tsx';

const TransactionsOverview = (props) => {
  return (
    <>
      <h1 className="text-3xl font-semibold">Transactions</h1>
      <Transactions />
    </>
  );
};

export default TransactionsOverview;
