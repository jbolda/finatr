import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider, PersistGate } from 'starfx/react';

import App from './app.tsx';
import { setupStore } from './store/setup.ts';
import * as thunkExports from './store/thunks/index.ts';

const store = setupStore({
  logs: true,
  initialState: {}
});

// Expose store and thunks for integration tests.
if (typeof window !== 'undefined') {
  (window as any).__STORE__ = store;
  (window as any).__THUNKS__ = thunkExports;
}

async function init() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={<div>Loading…</div>}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </React.StrictMode>
  );
}
init().catch((err) => console.error('root error', err));
