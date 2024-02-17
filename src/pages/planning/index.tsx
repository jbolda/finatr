import React from 'react';
import { State } from '~/src/state';
import { schema } from '../../store/schema';
import { useSelector } from 'starfx/react';

import IcicleChart from './icicleChart';
import Transactions from './transactions';
import Accounts from './accounts';

const Planning = (props) => {
  const accounts = useSelector(schema.accounts.selectTableAsList);
  return (
    <State.Consumer>
      {(model) => (
        <div className="container mx-auto my-2 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold py-3">Cash Flow</h1>
          <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
            <IcicleChart data={model.state.transactionsComputed} />
          </div>
          <Divider text="Transactions" />
          <Transactions />
          <Divider text="Accounts" />
          <Accounts accounts={accounts} />
        </div>
      )}
    </State.Consumer>
  );
};

export default Planning;

const Divider = ({ text }) => {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-3 bg-gray-50 text-lg font-medium text-gray-900">
          {text}
        </span>
      </div>
    </div>
  );
};
