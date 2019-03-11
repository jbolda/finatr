import React from 'react';
import { map } from 'microstates';
import { State } from './state';

const Taxes = props => (
  <State.Consumer>
    {model => (
      <section className="section">
        <h1 className="title">Taxes</h1>
        <h2 className="subtitle">and stuffs</h2>
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
              <tr key={income.id}>
                <td>{income.group}</td>
                <td>{income.gross.toFixed(2)}</td>
                <td>{income.federal.toFixed(2)}</td>
                <td>{income.state.toFixed(2)}</td>
                <td>{income.socialSecurity.toFixed(2)}</td>
                <td>{income.hsa.toFixed(2)}</td>
                <td>{income.pretaxInvestments.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    )}
  </State.Consumer>
);

export default Taxes;
