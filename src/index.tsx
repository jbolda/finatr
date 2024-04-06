import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'starfx/react';
import { schema } from './store/schema.ts';
import { setupStore } from './store/setup.ts';
import App from './app.tsx';

const store = setupStore({
  logs: true
});
async function init() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider schema={schema} store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
}
init().catch((err) => console.error('ouch', err));
