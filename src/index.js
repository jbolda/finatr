import * as React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Store, create } from 'microstates';
import AppModel, { State } from './state';

import { Header } from './elements/Header';
import { Footer } from './elements/Footer';

import Homepage from './pages/homepage';
import Examples from './pages/examples';
const Financial = React.lazy(() => import('./pages/flow'));
const Accounts = React.lazy(() => import('./pages/accounts'));
const Planning = React.lazy(() => import('./pages/planning'));
const FinancialIndependence = React.lazy(
  () => import('./pages/financialindependence')
);
const Importing = React.lazy(() => import('./pages/importing'));
const Taxes = React.lazy(() => import('./pages/taxes'));

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
                <Route index element={<Homepage />} />
                <Route path="examples" element={<Examples />} />
                <Route
                  path="flow"
                  element={
                    <React.Suspense fallback={<>...</>}>
                      <Financial />
                    </React.Suspense>
                  }
                />
                <Route
                  path="accounts"
                  element={
                    <React.Suspense fallback={<>...</>}>
                      <Accounts />
                    </React.Suspense>
                  }
                />
                <Route
                  path="planning"
                  element={
                    <React.Suspense fallback={<>...</>}>
                      <Planning />
                    </React.Suspense>
                  }
                />
                <Route
                  path="financialindependence"
                  element={
                    <React.Suspense fallback={<>...</>}>
                      <FinancialIndependence />
                    </React.Suspense>
                  }
                />
                <Route
                  path="import"
                  element={
                    <React.Suspense fallback={<>...</>}>
                      <Importing />
                    </React.Suspense>
                  }
                />
                <Route
                  path="taxes"
                  element={
                    <React.Suspense fallback={<>...</>}>
                      <Taxes />
                    </React.Suspense>
                  }
                />

                <Route path="*" element={<NoMatch />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </State.Provider>
    );
  }
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

/*
Sticky footer relies on flex where the default is 0 1 auto
for flex-grow, flex-shrink and flex-basis, respectively.
We set flex-grow=1 for the center div at a minHeight flexbox
98vh (account for browser margins) which sticks the footer
to the bottom of the page.
*/

ReactDOM.render(<App />, document.getElementById('app'));
