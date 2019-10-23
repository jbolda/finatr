import React from 'react';
import { State } from '../../state';
import BarChart from './barChart';

const AccountInfo = props => (
  <State.Consumer>
    {model =>
      model.charts.state.AccountChart.map(account => (
        <section className="section" key={account.account.name}>
          <h1 className="title">{account.account.name}</h1>
          <BarChart data={model.charts.state} account={account} />
        </section>
      ))
    }
  </State.Consumer>
);

export default AccountInfo;
