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

const Group = ({ model }) => (
  <div className="columns">
    {map(model.taxStrategy.incomeReceived, income => (
      <div className="column is-one-quarter" key={income.id.state}>
        <div className="card">
          <div className="card-content">
            <p className="title">{income.group.state}</p>
            <p>Gross: {income.gross.toFixed}</p>
            <p>Federal: {income.federal.toFixed}</p>
            <p>State: {income.state.toFixed}</p>
            <p>Social Security: {income.socialSecurity.toFixed}</p>
            <p>HSA: {income.hsa.toFixed}</p>
            <p>Pretax: {income.pretaxInvestments.toFixed}</p>
          </div>
          <footer className="card-footer">
            <p className="card-footer-item">
              <span>Expand</span>
            </p>
          </footer>
        </div>
      </div>
    ))}
  </div>
);

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
