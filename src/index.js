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
    this.state = {
      model: Store(create(AppModel, AppModel), nextState =>
        this.setState({ model: nextState })
      )
    };
  }

  render() {
    return (
      <State.Provider value={this.state.model}>
        <ThemeProvider theme={theme}>
          <Flex px={2} color="white" bg="black" alignItems="center">
            <Text p={2} fontWeight="bold">
              {' '}
              <Link to="/">finatr</Link>
            </Text>
            <Box mx="auto" />
            <Text p={2}>
              <Link to="/">Home</Link>
            </Text>
            <Text p={2}>
              <Link to="examples">Examples</Link>
            </Text>
            <Text p={2}>
              <Link to="flow">Cash Flow</Link>
            </Text>
            <Text p={2}>
              <Link to="accounts">Accounts</Link>
            </Text>
            <Text p={2}>
              <Link to="import">Import</Link>
            </Text>
            <Text p={2}>
              <Link to="taxes">Taxes</Link>
            </Text>
          </Flex>

          <Router>
            <Homepage path="/" />
            <Examples path="examples" />
            <Financial path="flow" />
            <Accounts path="accounts" />
            <Importing path="import" />
            <Taxes path="taxes" />
          </Router>
        </ThemeProvider>
      </State.Provider>
    );
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
