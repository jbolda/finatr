import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'starfx/react';
import { setupStore } from './store/setup.js';
import App from './app.js';

init();

function init() {
  const store = setupStore({
    logs: true
  });
  window.store = store;

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
}
