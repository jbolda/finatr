import React, { useState } from 'react';
import { map } from 'microstates';
import { State } from '~/src/state';

import { TabView } from '~/src/components/TabView';
import { FlexTable } from '~/src/components/FlexTable';
import { Button } from '~/src/elements/Button';

const Taxes = (props) => {
  const [activeTab, tabClick] = useState(0);

  return (
    <State.Consumer>
      {(model) => (
        <div className="bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
          <div className="relative max-w-lg mx-auto divide-y-2 divide-gray-200 lg:max-w-7xl">
            <div className="pb-6">
              <h1 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
                Taxes
              </h1>
              <p className="text-xl text-gray-500">
                This is still in an alpha state.
              </p>
              <p className="text-xl text-gray-500">
                We don't have forms to enter data yet.
              </p>
              <p className="text-xl text-gray-500">
                You can manually fill in data in your data file though.
              </p>
            </div>
            <TabView
              activeTab={activeTab}
              tabClick={tabClick}
              tabTitles={['Group', 'Table']}
              tabContents={[<Group model={model} />, <Table model={model} />]}
            />
          </div>
        </div>
      )}
    </State.Consumer>
  );
};

export default Taxes;

const Group = ({ model }) =>
  model.taxStrategy.incomeGroup.length !== 0
    ? map(model.taxStrategy.incomeGroup, (group) => (
        <div>
          <h2 className="py-1 text-md tracking-tight font-extrabold text-gray-900 sm:text-4xl">
            {group.name.state}
          </h2>
          <div>
            <Chunk quarter="quarter one" quarterIncome={group.qOne} />
            <Chunk quarter="quarter two" quarterIncome={group.qTwo} />
            <Chunk quarter="quarter three" quarterIncome={group.qThree} />
            <Chunk quarter="quarter four" quarterIncome={group.qFour} />
          </div>
        </div>
      ))
    : null;

const ListText = ({ children }) => (
  <p className="text-md text-gray-500">{children}</p>
);

const Chunk = ({ quarter, quarterIncome }) => {
  const [expanded, toggle] = useState(false);

  return expanded ? (
    <div>
      {quarterIncome.income.length !== 0 ? (
        <div>
          {map(quarterIncome.income, (income) => (
            <div className="my-3" key={income.id.state}>
              <h3 className="py-1 text-md tracking-tight font-extrabold text-gray-900 sm:text-4xl">
                {income.date.state}
              </h3>
              <ListText>Gross: {income.gross.toFixed}</ListText>
              <ListText>Federal: {income.federalTax.toFixed}</ListText>
              <ListText>State: {income.stateTax.toFixed}</ListText>
              <ListText>
                Social Security: {income.socialSecurity.toFixed}
              </ListText>
              <ListText>HSA: {income.hsa.toFixed}</ListText>
              <ListText>Pretax: {income.pretaxInvestments.toFixed}</ListText>
            </div>
          ))}
        </div>
      ) : (
        <ListText>No items to display.</ListText>
      )}
      <Button onClick={() => toggle(!expanded)}>Group</Button>
    </div>
  ) : (
    <div className="my-3">
      <h3 className="py-1 text-md tracking-tight font-extrabold text-gray-900 sm:text-4xl">
        {quarter}
      </h3>
      <ListText>
        Gross: {quarterIncome.total.gross.toFixed} |{' '}
        {quarterIncome.average.gross.toFixed} |{' '}
        {quarterIncome.projected.gross.toFixed}
      </ListText>
      <ListText>
        Federal: {quarterIncome.total.federalTax.toFixed} |{' '}
        {quarterIncome.average.federalTax.toFixed} |{' '}
        {quarterIncome.projected.federalTax.toFixed}
      </ListText>
      <ListText>
        State: {quarterIncome.total.stateTax.toFixed} |{' '}
        {quarterIncome.average.stateTax.toFixed} |{' '}
        {quarterIncome.projected.stateTax.toFixed}
      </ListText>
      <ListText>
        Social Security: {quarterIncome.total.socialSecurity.toFixed} |{' '}
        {quarterIncome.average.socialSecurity.toFixed} |{' '}
        {quarterIncome.projected.socialSecurity.toFixed}
      </ListText>
      <ListText>
        HSA: {quarterIncome.total.hsa.toFixed} |{' '}
        {quarterIncome.average.hsa.toFixed} |{' '}
        {quarterIncome.projected.hsa.toFixed}
      </ListText>
      <ListText>
        Pretax: {quarterIncome.total.pretaxInvestments.toFixed} |{' '}
        {quarterIncome.average.pretaxInvestments.toFixed} |{' '}
        {quarterIncome.projected.pretaxInvestments.toFixed}
      </ListText>
      <Button
        sx={{ variant: 'buttons.primary' }}
        onClick={() => toggle(!expanded)}
      >
        Expand
      </Button>
    </div>
  );
};

const Table = ({ model }) => (
  <FlexTable
    itemHeaders={[
      'Group',
      'Gross',
      'Federal',
      'State',
      'Social Security',
      'HSA',
      'Pretax Investments'
    ]}
    itemData={map(model.taxStrategy.incomeReceived, (g) =>
      map(g.income, (income) => ({
        key: `${g.group.state}::${income.date.state}`,
        data: [
          g.group.state,
          income.gross.toFixed,
          income.federalTax.toFixed,
          income.stateTax.toFixed,
          income.socialSecurity.toFixed,
          income.hsa.toFixed,
          income.pretaxInvestments.toFixed
        ]
      }))
    ).reduce((rootArray, childArray) => [...rootArray, ...childArray], [])}
  />
);
