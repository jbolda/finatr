import { createClient } from '@supabase/supabase-js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'starfx/react';

import App from './app.tsx';
import { schema } from './store/schema.ts';
import { setupStore } from './store/setup.ts';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase =
  !supabaseUrl || !supabaseKey ? null : createClient(supabaseUrl, supabaseKey);
const store = setupStore({
  logs: true,
  initialState: {},
  supabase
});
async function init() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider schema={schema} store={store}>
        <BrowserRouter>
          <App supabase={supabase} />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
}
init().catch((err) => console.error('root error', err));
