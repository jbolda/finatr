import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '~/src/elements/Button.tsx';

import Transactions from '../planning/transactions.tsx';

const TransactionsOverview = (props) => {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto my-2 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold py-3">Transactions</h1>
      <Button onPress={() => navigate('/transactions/set')}>Add</Button>
      <Transactions />
    </div>
  );
};

export default TransactionsOverview;
