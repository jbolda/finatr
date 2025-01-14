import React from 'react';
import { useSelector } from 'starfx/react';

import { transactionsWithAccounts } from '~/src/store/selectors/transactions';

import Transactions from '~/src/components/transactions/index.tsx';

const TransactionsOverview = () => {
  const transactions = useSelector(transactionsWithAccounts);
  return (
    <>
      <h1 className="text-3xl font-semibold">Transactions</h1>
      <Transactions transactions={transactions} />
    </>
  );
};

export default TransactionsOverview;
