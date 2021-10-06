import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '~src/app.module.css';

import { Store, create } from 'microstates';
import AppModel, { State } from './state';

import { Header } from './elements/Header';
import { Footer } from './elements/Footer';

import Homepage from './pages/homepage';
import Examples from './pages/examples';
import Financial from './pages/flow';
import Accounts from './pages/accounts';
import Planning from './pages/planning';
import FinancialIndependence from './pages/financialindependence';
import Importing from './pages/importing';
import Taxes from './pages/taxes';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      model: Store(create(AppModel, AppModel), (nextState) =>
        this.setState({ model: nextState })
      )
    };
  }

  render() {
    return (
      <State.Provider value={this.state.model}>
        <BrowserRouter>
          <div className="flex flex-col h-screen">
            <Header />
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="examples" element={<Examples />} />
                <Route path="flow" element={<Financial />} />
                <Route path="accounts" element={<Accounts />} />
                <Route path="planning" element={<Planning />} />
                <Route
                  path="financialindependence"
                  element={<FinancialIndependence />}
                />
                <Route path="import" element={<Importing />} />
                <Route path="taxes" element={<Taxes />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
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

ReactDOM.render(<App />, document.getElementById('app'));
