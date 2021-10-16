import React from 'react';
import { State } from '~src/state';
import BarChart from './barChart';

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
          </div>
        )}
      </State.Consumer>
    );
  }
}

export default FinancialFlow;
