import { parseDate } from '@internationalized/date';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'starfx/react';

import { schema } from '~/src/store/schema.ts';
import {
  ChartAccounts,
  lineChartAccounts
} from '~/src/store/selectors/accounts';
import { dateRangeWithStrings } from '~/src/store/selectors/chartRange.ts';
import { updateChartDateRange } from '~/src/store/thunks/chartRange.ts';

import { DatePicker } from '~/src/components/DatePicker.tsx';

import BarChart from './barChart.tsx';

const FinancialFlow = () => {
  const dispatch = useDispatch();
  const dateRange = useSelector(dateRangeWithStrings);
  const { snapshotDate } = useSelector(schema.accountMeta.select);
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const accountData = useSelector(lineChartAccounts);
  const [accountFilters, setAccountFilters] = useState<string[]>([]);
  const accounts =
    vehicleFilter === 'all'
      ? accountData.data
      : accountData.data.filter((d) => d.vehicle === vehicleFilter);

  return (
    <>
      <h1 className="text-3xl font-semibold">Cash Flow</h1>
      <div className="overflow-auto px-4 py-4 sm:px-6 flex items-center space-x-8">
        <DatePicker
          label="Starting Date"
          value={parseDate(dateRange.startString)}
          minValue={parseDate(format(snapshotDate, 'yyyy-MM-dd'))}
          onChange={(calendar) =>
            dispatch(updateChartDateRange({ calendar, snapshotDate }))
          }
        />
        <DataFilterSelector
          vehicleFilter={vehicleFilter}
          setVehicleFilter={setVehicleFilter}
          setAccountFilters={setAccountFilters}
          vehicles={[
            'all',
            'operating',
            'investment',
            'debt',
            'loan',
            'credit line'
          ]}
        />
      </div>
      <AccountListFilter
        accountFilters={accountFilters}
        setAccountFilters={setAccountFilters}
        accounts={accounts}
      />
      <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <BarChart
            dateRange={dateRange}
            accounts={accounts.filter(
              (account) => !accountFilters.includes(account.name)
            )}
            vehicleFilter={vehicleFilter}
          />
        </div>
      </div>
    </>
  );
};

export default FinancialFlow;

const DataFilterSelector = ({
  vehicles,
  vehicleFilter,
  setVehicleFilter,
  setAccountFilters
}: {
  vehicles: string[];
  vehicleFilter: string;
  setVehicleFilter: React.Dispatch<React.SetStateAction<string>>;
  setAccountFilters: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  return (
    <fieldset className="mt-6">
      <legend className="block text-sm font-semibold text-gray-900">
        Choose An Account Vehicle
      </legend>
      <div className="flex items-center space-x-3">
        {vehicles.map((vehicle) => (
          <div key={vehicle} className="flex items-center">
            <input
              id={vehicle}
              name="account-filter"
              type="radio"
              className="h-4 w-4 border-gray-300 text-cyan-700 focus:ring-cyan-600"
              value={vehicle}
              checked={vehicleFilter === vehicle}
              onChange={(event) => {
                setAccountFilters([]);
                setVehicleFilter(event.target.value);
              }}
            />
            <label
              htmlFor={vehicle}
              className="ml-3 block text-sm font-medium leading-6 text-gray-900"
            >
              {vehicle}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
};

const AccountListFilter = ({
  accounts,
  accountFilters,
  setAccountFilters
}: {
  accounts: ChartAccounts['data'];
  accountFilters: string[];
  setAccountFilters: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  return accounts.map((account) => (
    <span
      key={account.name}
      className={`mx-1 inline-flex items-center gap-x-1.5 rounded-full px-4 py-1 text-xs font-medium text-gray-600${accountFilters.includes(account.name) ? '' : ' bg-gray-100'}`}
      onClick={() =>
        setAccountFilters((state) =>
          state.includes(account.name)
            ? state.filter((a) => a !== account.name)
            : state.concat(account.name)
        )
      }
    >
      <svg
        className="h-1.5 w-1.5 fill-gray-400"
        viewBox="0 0 6 6"
        aria-hidden="true"
      >
        <circle cx="3" cy="3" r="3" />
      </svg>
      {account.name}
    </span>
  ));
};
