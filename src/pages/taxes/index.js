import React, { useState } from 'react';
import { map } from 'microstates';
import { State } from '../../state';
import { Flex, Box, Heading, Text, Button } from 'theme-ui';
import TabView from '../../components/view/tabView';
import FlexTable from '../../components/bootstrap/FlexTable';

const Taxes = props => {
  const [activeTab, tabClick] = useState(0);

  return (
    <State.Consumer>
      {model => (
        <React.Fragment>
          <Flex>
            <Box>
              <Heading variant="subtle">Taxes</Heading>
              <Text>This is still in an alpha state.</Text>
              <Text>We don't have forms to enter data yet.</Text>
              <Text>
                You can manually fill in data in your data file though.
              </Text>
            </Box>
          </Flex>
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
    ? map(model.taxStrategy.incomeGroup, group => (
        <Flex key={group.name.state}>
          <Box width={1}>
            <Heading>{group.name.state}</Heading>
            <Flex flexWrap="wrap">
              <Chunk quarter="quarter one" quarterIncome={group.qOne} />
              <Chunk quarter="quarter two" quarterIncome={group.qTwo} />
              <Chunk quarter="quarter three" quarterIncome={group.qThree} />
              <Chunk quarter="quarter four" quarterIncome={group.qFour} />
            </Flex>
          </Box>
        </Flex>
      ))
    : null;

const Chunk = ({ quarter, quarterIncome }) => {
  const [expanded, toggle] = useState(false);

  return expanded ? (
    <Box width={1}>
      {quarterIncome.income.length !== 0 ? (
        <Flex flexWrap="wrap">
          {map(quarterIncome.income, income => (
            <Box width={[1 / 2, 1 / 3, 1 / 5]} key={income.id.state}>
              <Heading>{income.date.state}</Heading>
              <Text>Gross: {income.gross.toFixed}</Text>
              <Text>Federal: {income.federalTax.toFixed}</Text>
              <Text>State: {income.stateTax.toFixed}</Text>
              <Text>Social Security: {income.socialSecurity.toFixed}</Text>
              <Text>HSA: {income.hsa.toFixed}</Text>
              <Text>Pretax: {income.pretaxInvestments.toFixed}</Text>
            </Box>
          ))}
        </Flex>
      ) : (
        <Text>No items to display.</Text>
      )}
      <Button
        sx={{ variant: 'buttons.primary' }}
        onClick={() => toggle(!expanded)}
      >
        Group
      </Button>
    </Box>
  ) : (
    <Box width={1 / 4}>
      <Heading>{quarter}</Heading>
      <Text>
        Gross: {quarterIncome.total.gross.toFixed} |{' '}
        {quarterIncome.average.gross.toFixed} |{' '}
        {quarterIncome.projected.gross.toFixed}
      </Text>
      <Text>
        Federal: {quarterIncome.total.federalTax.toFixed} |{' '}
        {quarterIncome.average.federalTax.toFixed} |{' '}
        {quarterIncome.projected.federalTax.toFixed}
      </Text>
      <Text>
        State: {quarterIncome.total.stateTax.toFixed} |{' '}
        {quarterIncome.average.stateTax.toFixed} |{' '}
        {quarterIncome.projected.stateTax.toFixed}
      </Text>
      <Text>
        Social Security: {quarterIncome.total.socialSecurity.toFixed} |{' '}
        {quarterIncome.average.socialSecurity.toFixed} |{' '}
        {quarterIncome.projected.socialSecurity.toFixed}
      </Text>
      <Text>
        HSA: {quarterIncome.total.hsa.toFixed} |{' '}
        {quarterIncome.average.hsa.toFixed} |{' '}
        {quarterIncome.projected.hsa.toFixed}
      </Text>
      <Text>
        Pretax: {quarterIncome.total.pretaxInvestments.toFixed} |{' '}
        {quarterIncome.average.pretaxInvestments.toFixed} |{' '}
        {quarterIncome.projected.pretaxInvestments.toFixed}
      </Text>
      <Button
        sx={{ variant: 'buttons.primary' }}
        onClick={() => toggle(!expanded)}
      >
        Expand
      </Button>
    </Box>
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
    itemData={map(model.taxStrategy.incomeReceived, g =>
      map(g.income, income => ({
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
