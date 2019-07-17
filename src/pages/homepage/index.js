import React from 'react';
import { Link } from '@reach/router';
import { State } from '../../state';

const Homepage = () => (
  <State.Consumer>
    {model => (
      <React.Fragment>
        <section className="hero is-large is-primary is-bold">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">finatr</h1>
              <h2 className="subtitle">
                helping you analyze your future cash flows
              </h2>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="columns is-centered">
            <div className="column is-one-quarter">
              <aside class="menu">
                <p class="menu-label">Pages</p>
                <ul class="menu-list">
                  <li>
                    <Link to="flow">Cash Flow</Link>
                  </li>
                  <li>
                    <Link to="accounts">Accounts (Cash Flow Breakdown)</Link>
                  </li>
                  <li>
                    <Link to="import">Import (Bring Data In, Take It Out)</Link>
                  </li>
                  <li>
                    <Link to="taxes">Taxes (in alpha)</Link>
                  </li>
                </ul>
              </aside>
            </div>
            <div className="column is-half">
              <p className="title">About</p>
              <div className="content">
                Most apps track your historical information and help you set up
                a budget. Argueably, budgets don't work for everyone. Even if
                you maintain a budget, it is still of great value to look to the
                future. The first version focuses on the near future checking
                that the inflows and outflows in your accounts are satisfactory.
                Essentially, will my accounts stay above zero with the planned
                expenditures. Tied into that, we need to understand a deal with
                variable debt payments (see credit cards) as future flows are
                more involved then a simple monthly payment you might see with a
                mortgage or a student loan payment. The next step from this is
                returning information regarding these flows such as a daily
                income and daily expenses. This type of information can be built
                upon going forward to forecast considerations like FI(RE).
              </div>
            </div>
          </div>
        </section>
      </React.Fragment>
    )}
  </State.Consumer>
);

export default Homepage;
