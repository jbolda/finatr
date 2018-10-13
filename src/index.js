import React from 'react';
import { render } from 'react-dom';

import State from '@microstates/react';
import AppModel from './stateManager.js';

import 'bulma/css/bulma.css';
import Financial from './financial';

const App = () => (
  <State
    type={AppModel}
    value={{
      transactionForm: {
        id: ``,
        raccount: `the account`,
        description: `description`,
        category: `test default`,
        type: `income`,
        start: `2018-03-22`,
        rtype: `day`,
        cycle: 3,
        value: 150
      },
      accountForm: {
        name: 'the account',
        starting: 1000,
        interest: 0.0,
        vehicle: 'operating'
      },
      accountTransactionForm: {
        id: ``,
        debtAccount: `the account`,
        raccount: `the account`,
        start: `2018-03-22`,
        rtype: `day`,
        cycle: 3,
        generatedOccurences: 0,
        value: 150
      }
    }}
  >
    <nav
      className="navbar is-fixed-top is-primary"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="navbar-brand">
        <a className="navbar-item" href="/">
          Reaccount
        </a>
      </div>
    </nav>
    <section className="section">
      <Financial />
    </section>
  </State>
);

render(<App />, document.getElementById('root'));
