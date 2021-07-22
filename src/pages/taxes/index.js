import React, { useState } from 'react';
import { map } from 'microstates';
import { State } from '~src/state';

import { TabView } from '~src/components/TabView';
import { FlexTable } from '~src/components/FlexTable';
import { Button } from '~src/elements/Button';

const Taxes = (props) => {
  const [activeTab, tabClick] = useState(0);

  return (
    <State.Consumer>
      {(model) => (
        <React.Fragment>
          <div>
            <h1>Taxes</h1>
            <p>This is still in an alpha state.</p>
            <p>We don't have forms to enter data yet.</p>
            <p>You can manually fill in data in your data file though.</p>
          </div>
          <TabView
            activeTab={activeTab}
            tabClick={tabClick}
            tabTitles={['Group', 'Table']}
            tabContents={[<Group model={model} />, <Table model={model} />]}
          />
        </React.Fragment>
      )}
    </State.Consumer>
  );
};

export default Taxes;

const Group = ({ model }) =>
  model.taxStrategy.incomeGroup.length !== 0
    ? map(model.taxStrategy.incomeGroup, (group) => (
        <div>
          <h2>{group.name.state}</h2>
          <div>
            <Chunk quarter="quarter one" quarterIncome={group.qOne} />
            <Chunk quarter="quarter two" quarterIncome={group.qTwo} />
            <Chunk quarter="quarter three" quarterIncome={group.qThree} />
            <Chunk quarter="quarter four" quarterIncome={group.qFour} />
          </div>
        </div>
      ))
    : null;

const Chunk = ({ quarter, quarterIncome }) => {
  const [expanded, toggle] = useState(false);

  return expanded ? (
    <div>
      {quarterIncome.income.length !== 0 ? (
        <div>
          {map(quarterIncome.income, (income) => (
            <div key={income.id.state}>
              <h2>{income.date.state}</h2>
              <p>Gross: {income.gross.toFixed}</p>
              <p>Federal: {income.federalTax.toFixed}</p>
              <p>State: {income.stateTax.toFixed}</p>
              <p>Social Security: {income.socialSecurity.toFixed}</p>
              <p>HSA: {income.hsa.toFixed}</p>
              <p>Pretax: {income.pretaxInvestments.toFixed}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No items to display.</p>
      )}
      <Button
        sx={{ variant: 'buttons.primary' }}
        onClick={() => toggle(!expanded)}
      >
        Group
      </Button>
    </div>
  ) : (
    <div>
      <h2>{quarter}</h2>
      <p>
        Gross: {quarterIncome.total.gross.toFixed} |{' '}
        {quarterIncome.average.gross.toFixed} |{' '}
        {quarterIncome.projected.gross.toFixed}
      </p>
      <p>
        Federal: {quarterIncome.total.federalTax.toFixed} |{' '}
        {quarterIncome.average.federalTax.toFixed} |{' '}
        {quarterIncome.projected.federalTax.toFixed}
      </p>
      <p>
        State: {quarterIncome.total.stateTax.toFixed} |{' '}
        {quarterIncome.average.stateTax.toFixed} |{' '}
        {quarterIncome.projected.stateTax.toFixed}
      </p>
      <p>
        Social Security: {quarterIncome.total.socialSecurity.toFixed} |{' '}
        {quarterIncome.average.socialSecurity.toFixed} |{' '}
        {quarterIncome.projected.socialSecurity.toFixed}
      </p>
      <p>
        HSA: {quarterIncome.total.hsa.toFixed} |{' '}
        {quarterIncome.average.hsa.toFixed} |{' '}
        {quarterIncome.projected.hsa.toFixed}
      </p>
      <p>
        Pretax: {quarterIncome.total.pretaxInvestments.toFixed} |{' '}
        {quarterIncome.average.pretaxInvestments.toFixed} |{' '}
        {quarterIncome.projected.pretaxInvestments.toFixed}
      </p>
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
