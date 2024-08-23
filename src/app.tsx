import React from 'react';
import { RouterProvider } from 'react-aria-components';
import { Routes, Route, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'starfx/react';

import { Footer } from './components/Footer.tsx';
import { Header } from './components/Header.tsx';
import Examples from './pages/examples';
import Homepage from './pages/homepage';
import TransactionsOverview from './pages/transactions/index.tsx';
import { schema } from './store/schema.ts';

const Settings = React.lazy(() => import('./pages/settings'));
const Financial = React.lazy(() => import('./pages/flow'));
const Accounts = React.lazy(() => import('./pages/accounts'));
const AccountsContainer = React.lazy(
  () => import('./pages/accounts/container.tsx')
);
const AccountInput = React.lazy(() => import('./forms/accountInput.js'));
const TransactionsContainer = React.lazy(
  () => import('./pages/transactions/container.tsx')
);
const TransactionInput = React.lazy(
  () => import('./forms/transactionInput.js')
);
const Planning = React.lazy(() => import('./pages/planning'));
const FinancialIndependence = React.lazy(
  () => import('./pages/financialindependence')
);
const Importing = React.lazy(() => import('./pages/importing'));
const Taxes = React.lazy(() => import('./pages/taxes'));

const FeatureFlag = ({ flag, children }) => {
  if (flag) return children;
  return <NoMatch />;
};

const App = (props) => {
  const settings = useSelector(schema.settings.select);
  let navigate = useNavigate();

  return (
    <RouterProvider navigate={navigate}>
      <div className="min-h-full">
        <div className="flex flex-col h-screen">
          <Header settings={settings} />

          <main className="flex-grow -mt-32">
            <div className="mx-auto container pb-12">
              <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
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
                      <FeatureFlag flag={settings.flow}>
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
                        <AccountsContainer />
                      </React.Suspense>
                    }
                  >
                    <Route
                      index
                      element={
                        <React.Suspense fallback={<>...</>}>
                          <Accounts />
                        </React.Suspense>
                      }
                    />
                    <Route
                      path="set"
                      element={
                        <React.Suspense fallback={<>...</>}>
                          <AccountInput />
                        </React.Suspense>
                      }
                    />
                  </Route>
                  <Route
                    path="transactions"
                    element={
                      <React.Suspense fallback={<>...</>}>
                        <TransactionsContainer />
                      </React.Suspense>
                    }
                  >
                    <Route
                      index
                      element={
                        <React.Suspense fallback={<>...</>}>
                          <TransactionsOverview />
                        </React.Suspense>
                      }
                    />
                    <Route
                      path="set"
                      element={
                        <React.Suspense fallback={<>...</>}>
                          <TransactionInput />
                        </React.Suspense>
                      }
                    />
                  </Route>
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
            </div>
          </main>

          <Footer settings={settings} />
        </div>
      </div>
    </RouterProvider>
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

export default App;
