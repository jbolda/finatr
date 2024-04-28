import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'starfx/react';

import App from './app.tsx';
import { schema } from './store/schema.ts';
import { setupStore } from './store/setup.ts';

const store = setupStore({
  logs: true
});
async function init() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider schema={schema} store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
}
init().catch((err) => console.error('root error', err));
