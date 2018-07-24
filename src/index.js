import React from 'react';
import { render } from 'react-dom';
import 'bulma/css/bulma.css';
import Financial from './financial';

const App = () => (
  <React.Fragment>
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
  </React.Fragment>
);

render(<App />, document.getElementById('root'));
