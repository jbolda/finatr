import React from 'react';
import { State } from '~src/state';
import BarChart from './barChart';

import Transactions from './transactions';
import Accounts from './accounts';

import { Input } from '~src/elements/Input';

class FinancialFlow extends React.Component {
  render() {
    return (
      <State.Consumer>
        {(model) => (
          <div className="container mx-auto my-2 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold py-3">Cash Flow</h1>
            <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <BarChart data={model.charts.state} />
              </div>
              <div className="px-4 py-4 sm:px-6">
                <Input
                  name="begin-graph"
                  type="date"
                  pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                  value={model.charts.graphDates.start}
                  onChange={(event) =>
                    model.updateStartDateReCalc(event.target.value)
                  }
                />
              </div>
            </div>
            <Divider text="Transactions" />
            <Transactions />
            <Divider text="Accounts" />
            <Accounts />
          </div>
        )}
      </State.Consumer>
    );
  }
}

export default FinancialFlow;

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
