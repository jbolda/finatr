import React from 'react';
import { useDispatch, useSelector } from 'starfx/react';

import { dateRangeWithStrings } from '~/src/store/selectors/chartData.ts';
import { updateChartDateRange } from '~/src/store/thunks/chartData.ts';

import { Input } from '~/src/elements/Input';

import BarChart from './barChart.js';

const FinancialFlow = () => {
  const dispatch = useDispatch();
  const dateRange = useSelector(dateRangeWithStrings);
  return (
    <div className="container mx-auto my-2 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold py-3">Cash Flow</h1>
      <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <BarChart dateRange={dateRange} />
        </div>
        <div className="px-4 py-4 sm:px-6">
          <Input
            name="begin-graph"
            type="date"
            pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
            value={dateRange.startString}
            onChange={(event) =>
              dispatch(updateChartDateRange(event.target.value))
            }
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialFlow;
