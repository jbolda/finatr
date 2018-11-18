import React from 'react';
import ReactDOM from 'react-dom';

import State from '@microstates/react';
import AppModel from './state';

import 'bulma/css/bulma.css';
import Financial from './financial';

const App = () => (
  <State type={AppModel}>
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
