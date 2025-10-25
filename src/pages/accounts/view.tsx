import React from 'react';
import { useParams } from 'react-router-dom';
import { TypedUseSelectorHook, useSelector as useSel } from 'starfx/react';

import { AppState, schema } from '~/store/schema.ts';
import { transactionsByAccountId } from '~/store/selectors/transactions.ts';
import { toHumanCurrency } from '~/store/utils/dineroUtils.ts';

import Transactions from '~/components/transactions/index.tsx';

const useSelector: TypedUseSelectorHook<AppState> = useSel;

const AccountView = () => {
  const { id } = useParams();

  const account = id
    ? useSelector((s) => schema.accounts.selectById(s, { id }))
    : undefined;
  const transactions = id
    ? useSelector((s) => transactionsByAccountId(s, id))
    : undefined;
  if (!account || !transactions) {
    return <div>Account not found</div>;
  }

  return (
    <>
      <h1 className="text-3xl font-semibold">Account {account.name}</h1>
      <p>Balance: {toHumanCurrency(account.starting)}</p>
      <h2 className="text-xl pt-8">Related Transactions</h2>
      <Transactions transactions={transactions} />
    </>
  );
};

export default AccountView;
