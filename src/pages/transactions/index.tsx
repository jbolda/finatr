import React from 'react';
import { useSelector } from 'starfx/react';

import { transactionsWithAccounts } from '~/store/selectors/transactions.ts';

import Transactions from '~/components/transactions/index.tsx';

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
