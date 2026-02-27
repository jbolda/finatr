import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'starfx/react';

import App from './app.tsx';
import { setupStore } from './store/setup.ts';

const store = setupStore({
  logs: true,
  initialState: {}
});
async function init() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
}
init().catch((err) => console.error('root error', err));
