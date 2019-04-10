import React, { useState } from 'react';
import { map } from 'microstates';
import { State } from './state';
import TabView from './components/view/tabView';

const Taxes = props => {
  const [activeTab, tabClick] = useState(0);

  return (
    <State.Consumer>
      {model => (
        <section className="section">
          <h1 className="title">Taxes</h1>
          <h2 className="subtitle">and stuffs</h2>
          <TabView
            activeTab={activeTab}
            tabClick={tabClick}
            tabTitles={['Group', 'Table']}
            tabContents={[<Group model={model} />, <Table model={model} />]}
          />
        </section>
      )}
    </State.Consumer>
  );
};

export default Taxes;

const Group = ({ model }) =>
  model.taxStrategy.incomeGroup.length !== 0
    ? map(model.taxStrategy.incomeGroup, group => (
        <div key={group.name.state}>
          <div className="columns">
            <div className="column">
              <p className="title">{group.name.state}</p>
            </div>
          </div>
          <div className="columns is-multiline">
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
    <div className="column is-full">
      <div className="card">
        <div className="card-content">
          <div className="level">
            {quarterIncome.length !== 0 ? (
              map(quarterIncome.income, income => (
                <div
                  className="level-item has-text-centered"
                  key={income.id.state}
                >
                  <div>
                    <p className="heading">{income.date.state}</p>
                    <p>Gross: {income.gross.toFixed}</p>
                    <p>Federal: {income.federalTax.toFixed}</p>
                    <p>State: {income.stateTax.toFixed}</p>
                    <p>Social Security: {income.socialSecurity.toFixed}</p>
                    <p>HSA: {income.hsa.toFixed}</p>
                    <p>Pretax: {income.pretaxInvestments.toFixed}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No items to display.</p>
            )}
          </div>
        </div>
        <footer className="card-footer">
          <p className="card-footer-item">
            <button
              className="button is-white"
              onClick={() => toggle(!expanded)}
            >
              Group
            </button>
          </p>
        </footer>
      </div>
    </div>
  ) : (
    <div className="column is-one-quarter">
      <div className="card">
        <div className="card-content">
          <p className="title">{quarter}</p>
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
        </div>
        <footer className="card-footer">
          <p className="card-footer-item">
            <button
              className="button is-white"
              onClick={() => toggle(!expanded)}
            >
              Expand
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
};

const Table = ({ model }) => (
  <table className="table is-striped is-hoverable">
    <thead>
      <tr>
        <th>Group</th>
        <th>Gross</th>
        <th>Federal</th>
        <th>State</th>
        <th>Social Security</th>
        <th>HSA</th>
        <th>Pretax Investments</th>
      </tr>
    </thead>
    <tbody>
      {map(model.taxStrategy.incomeReceived, income => (
        <tr key={income.id.state}>
          <td>{income.group.state}</td>
          <td>{income.gross.toFixed}</td>
          <td>{income.federalTax.toFixed}</td>
          <td>{income.stateTax.toFixed}</td>
          <td>{income.socialSecurity.toFixed}</td>
          <td>{income.hsa.toFixed}</td>
          <td>{income.pretaxInvestments.toFixed}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
