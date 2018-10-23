import React from 'react';
import ReactDOM from 'react-dom';

import State from '@microstates/react';
import AppModel from './stateManager.js';
import { past, future } from './resolveFinancials';

import 'bulma/css/bulma.css';
import Financial from './financial';

const App = () => (
  <State
    type={AppModel}
    value={{
      transactions: [],
      accounts: [
        {
          name: 'account',
          starting: 0,
          interest: 0,
          vehicle: 'operating'
        }
      ],
      charts: {
        GraphRange: { start: past(), end: future(365) },
        BarChartIncome: [],
        BarChartExpense: []
      },
      forms: {
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

const root = ReactDOM.unstable_createRoot(document.getElementById('root'));
root.render(<App />);
