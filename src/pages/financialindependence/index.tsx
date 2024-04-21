import { toDecimal } from 'dinero.js';
import React from 'react';
import { useSelector } from 'starfx/react';

import { financialStats } from '~/src/store/selectors/stats';

const inifinitySymbol = '∞';

const FinancialIndependence = () => {
  const stats = useSelector(financialStats);
  return (
    <React.Fragment>
      <h3 className="text-base font-semibold leading-6 text-gray-900">
        Daily Rates
      </h3>
      <dl className="bg-gray-50 mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <DetailItem title="Daily Income" stat={toDecimal(stats.dailyIncome)} />
        <DetailItem
          title="Daily Expenses"
          stat={toDecimal(stats.dailyExpense)}
        />
        <DetailItem
          title="Daily Investment"
          stat={toDecimal(stats.dailyInvest)}
        />
        <DetailItem
          title="Savings Rate"
          stat={stats.savingsRate.toPrecision(3)}
        />
        <DetailItem
          title="Investments"
          stat={toDecimal(stats.totalInvest)}
          subtitle={`+${toDecimal(stats.totalInvestInterest)}/yr`}
        />
        <DetailItem
          title="Positive Net Worth"
          stat={`${stats.percentToPositiveNetWorth.toFixed(2)}%`}
        />
      </dl>

      <h3 className="pt-8 text-base font-semibold leading-6 text-gray-900">
        Financial Independence and Retirement
      </h3>
      <dl className="bg-gray-50 mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <DetailItem
          title="Invest Vs Expense Multiple"
          subtitle={`+${stats.investToExpenseIncreasePerYear.toPrecision(
            3
          )} x/year`}
          stat={`${stats.investToExpenseMultiple.toPrecision(3)}x`}
        />
        <DetailItem
          title="First FI milestone ($100,000 Net Worth)"
          stat={`${stats.percentToFirstFI.toFixed(2)}%`}
        />
        <DetailItem
          title="FU Money (2x)"
          stat={`${
            stats.yearsToFUMoneyConsidering === 999.0
              ? inifinitySymbol
              : `${stats.yearsToFUMoneyConsidering.toFixed(2)}y`
          }`}
          subtitle={`${stats.percentToFUMoneyConsidering.toFixed(2)}%`}
        />
        <DetailItem
          title="FU Money (3x)"
          stat={`${
            stats.yearsToFUMoneyConfident === 999.0
              ? inifinitySymbol
              : `${stats.yearsToFUMoneyConfident.toFixed(2)}y`
          }`}
          subtitle={`${stats.percentToFUMoneyConfident.toFixed(2)}%`}
        />
        <DetailItem
          title="Half FI (12.5x)"
          stat={`${
            stats.yearsToHalfFI === 999.0
              ? inifinitySymbol
              : `${stats.yearsToHalfFI.toFixed(2)}y`
          }`}
          subtitle={`${stats.percentToHalfFI.toFixed(2)}%`}
        />
        <DetailItem
          title="Lean FI (17.5x)"
          stat={`${
            stats.yearsToLeanFI === 999.0
              ? inifinitySymbol
              : `${stats.yearsToLeanFI.toFixed(2)}y`
          }`}
          subtitle={`${stats.percentToLeanFI.toFixed(2)}%`}
        />
        <DetailItem
          title="Flex FI (20x)"
          stat={`${
            stats.yearsToFlexFI === 999.0
              ? inifinitySymbol
              : `${stats.yearsToFlexFI.toFixed(2)}y`
          }`}
          subtitle={`${stats.percentToFlexFI.toFixed(2)}%`}
        />
        <DetailItem
          title="FI (25x)"
          stat={`${
            stats.yearsToFINumber === 999.0
              ? inifinitySymbol
              : `${stats.yearsToFINumber.toFixed(2)}y`
          }`}
          subtitle={`${stats.percentToFINumber.toFixed(2)}%`}
        />
        <DetailItem
          title="Fat FI (30x)"
          stat={`${
            stats.yearsToFatFI === 999.0
              ? inifinitySymbol
              : `${stats.yearsToFatFI.toFixed(2)}y`
          }`}
          subtitle={`${stats.percentToFatFI.toFixed(2)}%`}
        />
      </dl>
    </React.Fragment>
  );
};

export default FinancialIndependence;

const DetailItem = ({
  title,
  stat,
  subtitle
}: {
  title: string;
  stat: string;
  subtitle?: string;
}) => (
  <dl className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8 rounded-lg shadow">
    <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
    {subtitle ? (
      <dd className="text-xs font-medium text-gray-700">{subtitle}</dd>
    ) : null}
    <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
      {stat}
    </dd>
  </dl>
);
