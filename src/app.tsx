import { create, Store } from 'microstates';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Provider, useSelector } from 'starfx/react';

import { Footer } from './elements/Footer';
import { Header } from './elements/Header';
import Examples from './pages/examples';
import Homepage from './pages/homepage';
import AppModel, { State } from './state';
import { useFxSelector } from './store/hook';
import { AppState } from './store/schema';
import { schema } from './store/schema.ts';

const Settings = React.lazy(() => import('./pages/settings'));
const Financial = React.lazy(() => import('./pages/flow'));
const Accounts = React.lazy(() => import('./pages/accounts'));
const Planning = React.lazy(() => import('./pages/planning'));
const FinancialIndependence = React.lazy(
  () => import('./pages/financialindependence')
);
const Importing = React.lazy(() => import('./pages/importing'));
const Taxes = React.lazy(() => import('./pages/taxes'));

export function useObservable(observable) {
  const [val, setVal] = useState({});

  useEffect(() => {
    Store(observable, (nextState) => setVal({ model: nextState }));
  }, [observable]);

  return val;
}

class Legacy extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      model: Store(create(AppModel, AppModel), (nextState) =>
        this.setState({ model: nextState })
      )
    } 
  }
  state: {
    model: Store;
  };

  render() {
    return <App model={this.state.model} />;
  }
}

const FeatureFlag = ({ flag, children }) => {
  if (flag) return children;
  return <NoMatch />;
};

const App = (props) => {
  const settings = useFxSelector((state:AppState) => state.settings);
  return (
    <State.Provider value={props.model}>
      <BrowserRouter>
        <div className="flex flex-col h-screen">
          <Header settings={settings} />
          <div className="flex-grow">
            <Routes>
              <Route index element={<Homepage />} />
              <Route path="examples" element={<Examples />} />
              <Route
                path="settings"
                element={
                  <React.Suspense fallback={<>...</>}>
                    <Settings />
                  </React.Suspense>
                }
              />
              <Route
                path="flow"
                element={
                  <FeatureFlag flag={settings.cashFlow}>
                    <React.Suspense fallback={<>...</>}>
                      <Financial />
                    </React.Suspense>
                  </FeatureFlag>
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
          <Footer settings={settings} />
        </div>
      </BrowserRouter>
    </State.Provider>
  );
};

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

export default Legacy;
