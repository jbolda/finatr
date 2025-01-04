import React from 'react';
import { useNavigate } from 'react-router-dom';

import Transactions from '~/src/components/transactions/index.tsx';

import { Button } from '~/src/elements/Button.tsx';

import Accounts from './accounts';
import IcicleChart from './icicleChart';

const Planning = (props) => {
  return (
    <>
      <h1 className="text-3xl font-semibold">Planning</h1>
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        <IcicleChart />
      </div>
      <Divider text="Transactions" navigateTo="/transactions/set" />
      <Transactions />
      <Divider text="Accounts" navigateTo="/accounts/set" />
      <Accounts />
    </>
  );
};

export default Planning;

const Divider = ({
  text,
  navigateTo
}: {
  text: string;
  navigateTo: string;
}) => {
  const navigate = useNavigate();
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-between">
        <span />
        <span className="px-3 bg-white text-lg font-medium text-gray-900">
          {text}
        </span>
        <Button onPress={() => navigate(navigateTo)}>
          Add {text.slice(0, text.length - 1)}
        </Button>
      </div>
    </div>
  );
};
