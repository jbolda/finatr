import { useSyncExternalStore } from 'react';

export function useFxSelector(selector) {
  // The current state of the store
  const getSnapshot = () => selector(window.store.getState());

  // Subscribe to the store updates
  const subscribe = (callback) => window.store.subscribe(callback);

  // Use the React hook to sync with the store
  const state = useSyncExternalStore(subscribe, getSnapshot);

  return state;
}
