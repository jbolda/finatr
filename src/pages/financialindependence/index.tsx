import React from 'react';
import { useSelector } from 'starfx/react';

import { financialStats } from '~/src/store/selectors/stats';

const FinancialIndependence = () => {
  const stats = useSelector(financialStats);
  return (
    <React.Fragment>
      <h3 className="text-base font-semibold leading-6 text-gray-900">
        Daily Rates
      </h3>
      <dl className="bg-gray-50 mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {detailItem('Daily Income', `${stats.dailyIncome.toFixed(2)}`)}
        {detailItem('Daily Expenses', `${stats.dailyExpense.toFixed(2)}`)}
        {detailItem('Savings Rate', `${stats.savingsRate.toFixed(2)}`)}
        {detailItem(
          'Expense Multiple',
          `${stats.expenseMultiple.toFixed(2)}x`,
          `+${stats.expenseMultipleIncreasePerYear.toFixed(2)} x/year`
        )}
        {detailItem(
          'Positive Net Worth',
          `${stats.percentToPositiveNetWorth.toFixed(2)}%`
        )}
      </dl>

      <h3 className="pt-8 text-base font-semibold leading-6 text-gray-900">
        Financial Independence and Retirement
      </h3>
      <dl className="bg-gray-50 mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {detailItem(
          'FI (25x)',
          `${
            stats.yearsToFINumber.toFixed(2) === '999.00'
              ? null
              : `${stats.yearsToFINumber.toFixed(2)}y`
          }`,
          `${stats.percentToFINumber.toFixed(2)}%`
        )}
        {detailItem(
          'FU Money (2x)',
          `${
            stats.yearsToFUMoneyConsidering.toFixed(2) === '999.00'
              ? null
              : `${stats.yearsToFUMoneyConsidering.toFixed(2)}y`
          }`,
          `${stats.percentToFUMoneyConsidering.toFixed(2)}%`
        )}
        {detailItem(
          'FU Money (3x)',
          `${
            stats.yearsToFUMoneyConfident.toFixed(2) === '999.00'
              ? null
              : `${stats.yearsToFUMoneyConfident.toFixed(2)}y`
          }`,
          `${stats.percentToFUMoneyConfident.toFixed(2)}%`
        )}
        {detailItem(
          'First FI milestone ($100,000 Net Worth)',
          `${stats.percentToFirstFI.toFixed(2)}%`
        )}
        {detailItem(
          'Half FI (12.5x)',
          `${
            stats.yearsToHalfFI.toFixed(2) === '999.00'
              ? null
              : `${stats.yearsToHalfFI.toFixed(2)}y`
          }`,
          `${stats.percentToHalfFI.toFixed(2)}%`
        )}
        {detailItem(
          'Lean FI (17.5x)',
          `${
            stats.yearsToLeanFI.toFixed(2) === '999.00'
              ? null
              : `${stats.yearsToLeanFI.toFixed(2)}y`
          }`,
          `${stats.percentToLeanFI.toFixed(2)}%`
        )}
        {detailItem(
          'Flex FI (20x)',
          `${
            stats.yearsToFlexFI.toFixed(2) === '999.00'
              ? null
              : `${stats.yearsToFlexFI.toFixed(2)}y`
          }`,
          `${stats.percentToFlexFI.toFixed(2)}%`
        )}
        {detailItem(
          'Fat FI (30x)',
          `${
            stats.yearsToFatFI.toFixed(2) === '999.00'
              ? null
              : `${stats.yearsToFatFI.toFixed(2)}y`
          }`,
          `${stats.percentToFatFI.toFixed(2)}%`
        )}
      </dl>
    </React.Fragment>
  );
};

export default FinancialIndependence;

const detailItem = (title: string, stat: string, subtitle?: string) => (
  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8 rounded-lg shadow">
    <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
    {subtitle ? (
      <dd className="text-xs font-medium text-gray-700">{subtitle}</dd>
    ) : null}
    <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
      {stat}
    </dd>
  </div>
);
