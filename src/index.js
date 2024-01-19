import React from 'react';
import ReactDOM from 'react-dom/client';
import { parallel } from 'starfx';
import { configureStore, take } from 'starfx/store';
import { Provider } from 'starfx/react';
import { schema } from './store';
import App from './app.js';

init();

function init() {
  const store = configureStore({
    initialState: schema.initialState,
    middleware: [
      function* logger(ctx, next) {
        yield* next();
        console.log('store updater', ctx);
      }
    ]
  });
  // makes `fx` available in devtools
  window.fx = store;

  store.run(function* () {
    const group = yield* parallel([
      function* logger() {
        while (true) {
          const action = yield* take('*');
          console.log('action', action);
        }
      },
      api.bootup
    ]);
    yield* group;
  });

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
}
