import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'starfx/react';
import { schema } from './store/schema.ts';
import { setupStore } from './store/setup.ts';
import  Settings  from './pages/settings';
import App from './app.tsx';

const fxStore = setupStore({
  logs: true
});
async function init() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider schema={schema} store={fxStore}>    
        <Settings />  
        <App/>
      </Provider>
    </React.StrictMode>
  );
}
init().catch((err) => {
  console.error(err);
});