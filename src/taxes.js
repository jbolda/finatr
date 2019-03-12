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
              <tr key={income.id.state}>
                <td>{income.group.state}</td>
                <td>{income.gross.toFixed}</td>
                <td>{income.federal.toFixed}</td>
                <td>{income.state.toFixed}</td>
                <td>{income.socialSecurity.toFixed}</td>
                <td>{income.hsa.toFixed}</td>
                <td>{income.pretaxInvestments.toFixed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    )}
  </State.Consumer>
);

export default Taxes;
