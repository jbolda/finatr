import React, { useState } from 'react';
import { useSelector } from 'starfx/react';

import {
  taxStrategy,
  taxStrategyAsList
} from '~/src/store/selectors/taxStrategy.ts';

import { FlexTable } from '~/src/components/FlexTable.tsx';
import { TabView } from '~/src/components/TabView.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  Column,
  Row,
  Cell
} from '~/src/components/Table.tsx';

import { Button } from '~/src/elements/Button';

const Taxes = (props) => {
  const [activeTab, tabClick] = useState(0);

  return (
    <>
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
        tabContents={[<Group />, <TaxTable />]}
      />
    </>
  );
};

export default Taxes;

const TaxTable = () => {
  const strategyList = useSelector(taxStrategyAsList);
  const columns = [
    'group',
    'quarter',
    'type',
    'gross',
    'federalTax',
    'stateTax',
    'socialSecurity',
    'hsa',
    'pretaxInvestments'
  ];
  return (
    <Table
      aria-label="Tax Strategy Table"
      selectionMode="none"
      className="w-max"
    >
      <TableHeader>
        {columns.map((column) => (
          <Column isRowHeader>{column}</Column>
        ))}
      </TableHeader>
      <TableBody renderEmptyState={() => 'No results found.'}>
        {strategyList.map((item) => (
          <Row key={`${item.group}-${item.quarter}-${item.type}`}>
            {columns.map((column) => (
              <Cell key={column}>
                {typeof item[column] === 'string'
                  ? item[column]
                  : item[column].toFixed(2)}
              </Cell>
            ))}
          </Row>
        ))}
      </TableBody>
    </Table>
  );
};

const Group = () => {
  const strategy = useSelector(taxStrategy);
  return strategy.length !== 0
    ? strategy.map((group) => (
        <div>
          <h2 className="py-1 text-md tracking-tight font-extrabold text-gray-900 sm:text-4xl">
            {group.name}
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
};

const ListText = ({ children }) => (
  <p className="text-md text-gray-500">{children}</p>
);

const Chunk = ({ quarter, quarterIncome }) => {
  const [expanded, toggle] = useState(false);

  return expanded ? (
    <div>
      {quarterIncome.income.length !== 0 ? (
        quarterIncome.income.map((income) => (
          <div>
            <div className="my-3" key={income.id}>
              <h3 className="py-1 text-md tracking-tight font-extrabold text-gray-900 sm:text-4xl">
                {income.date}
              </h3>
              <ListText>Gross: {income.gross.toFixed(2)}</ListText>
              <ListText>Federal: {income.federalTax.toFixed(2)}</ListText>
              <ListText>State: {income.stateTax.toFixed(2)}</ListText>
              <ListText>
                Social Security: {income.socialSecurity.toFixed(2)}
              </ListText>
              <ListText>HSA: {income.hsa.toFixed(2)}</ListText>
              <ListText>Pretax: {income.pretaxInvestments.toFixed(2)}</ListText>
            </div>
          </div>
        ))
      ) : (
        <ListText>No items to display.</ListText>
      )}
      <Button onPress={() => toggle(!expanded)}>Group</Button>
    </div>
  ) : (
    <div className="my-3">
      <h3 className="py-1 text-md tracking-tight font-extrabold text-gray-900 sm:text-4xl">
        {quarter}
      </h3>
      <ListText>
        Gross: {quarterIncome.total.gross.toFixed(2)} |{' '}
        {quarterIncome.average.gross.toFixed(2)} |{' '}
        {quarterIncome.projected.gross.toFixed(2)}
      </ListText>
      <ListText>
        Federal: {quarterIncome.total.federalTax.toFixed(2)} |{' '}
        {quarterIncome.average.federalTax.toFixed(2)} |{' '}
        {quarterIncome.projected.federalTax.toFixed(2)}
      </ListText>
      <ListText>
        State: {quarterIncome.total.stateTax.toFixed(2)} |{' '}
        {quarterIncome.average.stateTax.toFixed(2)} |{' '}
        {quarterIncome.projected.stateTax.toFixed(2)}
      </ListText>
      <ListText>
        Social Security: {quarterIncome.total.socialSecurity.toFixed(2)} |{' '}
        {quarterIncome.average.socialSecurity.toFixed(2)} |{' '}
        {quarterIncome.projected.socialSecurity.toFixed(2)}
      </ListText>
      <ListText>
        HSA: {quarterIncome.total.hsa.toFixed(2)} |{' '}
        {quarterIncome.average.hsa.toFixed(2)} |{' '}
        {quarterIncome.projected.hsa.toFixed(2)}
      </ListText>
      <ListText>
        Pretax: {quarterIncome.total.pretaxInvestments.toFixed(2)} |{' '}
        {quarterIncome.average.pretaxInvestments.toFixed(2)} |{' '}
        {quarterIncome.projected.pretaxInvestments.toFixed(2)}
      </ListText>
      <Button onPress={() => toggle(!expanded)}>Expand</Button>
    </div>
  );
};
