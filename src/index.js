import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from '@reach/router';

import { Store, create } from 'microstates';
import AppModel, { State } from './state';

import { ThemeProvider } from 'theme-ui';
import theme from './theme.js';
import { Box, Flex } from 'theme-ui';

import Header from './components/common/header';
import Footer from './components/common/footer';
import Homepage from './pages/homepage';
import StyleGuide from './pages/styleguide';
import Examples from './pages/examples';
import Financial from './pages/flow';
import Accounts from './pages/accounts';
import FinancialIndependence from './pages/financialindependence';
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
          <Flex sx={{ flexDirection: 'column', minHeight: '100vh' }}>
            <Box p="0" m="0">
              <Header />
            </Box>
            <Box p="0" my="0" mx="2" sx={{ flex: '1 1 auto' }}>
              <Router>
                <Homepage path="/" />
                <StyleGuide path="style-guide" />
                <Examples path="examples" />
                <Financial path="flow" />
                <Accounts path="accounts" />
                <FinancialIndependence path="financialindependence" />
                <Importing path="import" />
                <Taxes path="taxes" />
              </Router>
            </Box>
            <Box p="0" m="0">
              <Footer />
            </Box>
          </Flex>
        </ThemeProvider>
      </State.Provider>
    );
  }
}

/*
Sticky footer relies on flex where the default is 0 1 auto
for flex-grow, flex-shrink and flex-basis, respectively.
We set flex-grow=1 for the center div at a minHeight flexbox
98vh (account for browser margins) which sticks the footer
to the bottom of the page.
*/

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
