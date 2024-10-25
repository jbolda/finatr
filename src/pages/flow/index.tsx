import { parseDate } from '@internationalized/date';
import React from 'react';
import { useDispatch, useSelector } from 'starfx/react';

import { lineChartAccounts } from '~/src/store/selectors/accounts';
import { dateRangeWithStrings } from '~/src/store/selectors/chartRange.ts';
import { updateChartDateRange } from '~/src/store/thunks/chartRange.ts';

import { DatePicker } from '~/src/components/DatePicker.tsx';

import BarChart from './barChart.tsx';

const FinancialFlow = () => {
  const dispatch = useDispatch();
  const dateRange = useSelector(dateRangeWithStrings);
  const accountData = useSelector(lineChartAccounts);
  const vehicleFilter = 'operating';

  return (
    <div className="container mx-auto my-2 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold py-3">Cash Flow</h1>
      <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
        <div className="px-4 py-4 sm:px-6">
          <DatePicker
            label="Starting Date"
            value={parseDate(dateRange.startString)}
            onChange={(calendar) =>
              dispatch(updateChartDateRange(calendar.toString()))
            }
          />
          <DataFilterSelector vehicles={['operating', 'loan']} />
        </div>
        <div className="px-4 py-5 sm:p-6">
          <BarChart
            dateRange={dateRange}
            accountData={accountData}
            vehicleFilter={vehicleFilter}
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialFlow;

const DataFilterSelector = ({ vehicles }: { vehicles: string[] }) => {
  return (
    <fieldset>
      <legend className="block text-sm font-semibold leading-6 text-gray-900">
        Choose An Account Vehicle
      </legend>
      <div className="mt-6 flex items-center space-x-3">
        {vehicles.map((vehicle) => (
          <FilterItem key={vehicle} choice={vehicle} />
        ))}
      </div>
    </fieldset>
  );
};

const FilterItem = ({ choice }: { choice: string }) => {
  return (
    <label
      aria-label={choice}
      className="relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 text-pink-500 ring-current focus:outline-none"
    >
      <input
        type="radio"
        name="color-choice"
        value={choice}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className="h-8 w-8 rounded-full border border-black border-opacity-10 bg-current"
      ></span>
    </label>
  );
};
