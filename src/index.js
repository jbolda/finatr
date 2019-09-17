import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from '@reach/router';

import { Store, create } from 'microstates';
import AppModel, { State } from './state';

import { ThemeProvider, ColorMode } from 'theme-ui';
import theme from './theme.js';

import Header from './components/common/header';
import Footer from './components/common/footer';
import Homepage from './pages/homepage';
import StyleGuide from './pages/styleguide';
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
          <ColorMode />
          <Header />
          <Router>
            <Homepage path="/" />
            <StyleGuide path="style-guide" />
            <Examples path="examples" />
            <Financial path="flow" />
            <Accounts path="accounts" />
            <Importing path="import" />
            <Taxes path="taxes" />
          </Router>
          <Footer />
        </ThemeProvider>
      </State.Provider>
    );
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
