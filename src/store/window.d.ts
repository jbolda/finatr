import { FxStore, RootReducer } from './state/rootStore';

declare global {
  interface Window {
    store: FxStore<RootReducer>;

   //..
  }
}
