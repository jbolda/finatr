import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Link } from '@reach/router';

import { Store, create } from 'microstates';
import AppModel, { State } from './state';

import { ThemeProvider } from 'theme-ui';
import { Flex, Box, Text } from 'rebass';
import theme from '@rebass/preset';

import Homepage from './pages/homepage';
import Examples from './pages/examples';
import Financial from './pages/flow';
import Accounts from './pages/accounts';
import Importing from './pages/importing';
import Taxes from './pages/taxes';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.toggleHamburgerMenu = this.toggleHamburgerMenu.bind(this);
    this.state = {
      hamburgerActive: false,
      model: Store(create(AppModel, AppModel), nextState =>
        this.setState({ model: nextState })
      )
    };
  }

  toggleHamburgerMenu() {
    this.setState(prevState => {
      return { hamburgerActive: !prevState.hamburgerActive };
    });
  }

  render() {
    return (
      <State.Provider value={this.state.model}>
        <nav
          className="navbar is-fixed-top is-primary"
          role="navigation"
          aria-label="main navigation"
        >
          <div className="navbar-brand">
            <Link to="/" className="navbar-item">
              finatr
            </Link>
            {/* eslint-disable-next-line */}
            <a
              role="button"
              className={
                this.state.hamburgerActive
                  ? 'navbar-burger is-active'
                  : 'navbar-burger'
              }
              aria-label="menu"
              aria-expanded={this.state.hamburgerActive ? 'true' : 'false'}
              onClick={this.toggleHamburgerMenu}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </a>
          </div>
          <div
            className={
              this.state.hamburgerActive
                ? 'navbar-menu is-active'
                : 'navbar-menu'
            }
          >
            <div className="navbar-end">
              <Link to="/" className="navbar-item">
                Home
              </Link>
              <Link to="examples" className="navbar-item">
                Examples
              </Link>
              <Link to="flow" className="navbar-item">
                Cash Flow
              </Link>
              <Link to="accounts" className="navbar-item">
                Accounts
              </Link>
              <Link to="import" className="navbar-item">
                Import
              </Link>
              <Link to="taxes" className="navbar-item">
                Taxes
              </Link>
            </div>
          </div>
        </nav>
        <Router>
          <Homepage path="/" />
          <Examples path="examples" />
          <Financial path="flow" />
          <Accounts path="accounts" />
          <Importing path="import" />
          <Taxes path="taxes" />
        </Router>
      </State.Provider>
    );
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
