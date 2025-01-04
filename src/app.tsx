import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { type SupabaseClient } from '@supabase/supabase-js';
import React, { useCallback, useContext, useMemo } from 'react';
import { RouterProvider } from 'react-aria-components';
import { Routes as RoutesList, Route, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'starfx/react';
import { tv } from 'tailwind-variants';

import { Footer } from './components/Footer.tsx';
import Sidebar, { SidebarContext } from './components/Sidebar.tsx';
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

function FeatureFlag({
  flag,
  children
}: {
  flag: boolean;
  children: React.ReactNode;
}) {
  if (flag) return children;
  return <NoMatch />;
}

function AppWrapper({ children }: { children: React.ReactNode }) {
  const [sidebar, setSidebarState] = React.useState<'wide' | 'collapsed'>(
    'wide'
  );
  const navigate = useNavigate();

  const setSidebar = useCallback((args: any) => setSidebarState(args), []);

  const sidebarContextValue = useMemo(
    () => ({
      sidebar,
      setSidebar
    }),
    [sidebar, setSidebar]
  );

  return (
    <RouterProvider navigate={navigate}>
      <SidebarContext.Provider value={sidebarContextValue}>
        {children}
      </SidebarContext.Provider>
    </RouterProvider>
  );
}

const sidebarMain = tv({
  base: 'grow py-10',
  variants: {
    sidebar: { wide: 'lg:pl-56', collapsed: 'lg:pl-16' }
  }
});

function App({
  supabase
}: {
  supabase: SupabaseClient<any, 'public', any> | null;
}) {
  return (
    <AppWrapper>
      <Sidebar />
      <Main supabase={supabase} />
    </AppWrapper>
  );
}

function Main({
  supabase
}: {
  supabase: SupabaseClient<any, 'public', any> | null;
}) {
  const { sidebar } = useContext(SidebarContext);
  return (
    <div className="flex flex-col min-h-screen">
      <main className={sidebarMain({ sidebar })}>
        <div className="px-4 sm:px-6 lg:px-8">
          <Routes supabase={supabase} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Routes({
  supabase
}: {
  supabase: SupabaseClient<any, 'public', any> | null;
}) {
  const auth = useSelector(schema.auth.select);
  const settings = useSelector(schema.settings.select);

  return (
    <RoutesList>
      <Route index element={<Homepage />} />
      <Route path="examples" element={<Examples />} />
      <Route
        path="auth"
        element={
          supabase && !auth.user ? (
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
          ) : (
            <div>Logged in!</div>
          )
        }
      />
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
    </RoutesList>
  );
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

export default App;
