/* 
To start this, you need to have the packages
*/
import { connectViaExtension, extractState } from 'remotedev';

import { AppState } from '../schema';

type Options = {
  action?: any;
  enabled?: boolean;
  name?: string;
};

let devToolsInstance: any;
export function setupDevTool<T extends object>(fxstore: T, options?: Options) {
  const { enabled, name = '' } = options || {};

  // Initialize the DevTools instance and connect to the Redux DevTools extension
  devToolsInstance = connectViaExtension({
    name: name || 'starfx',
    hostname: 'localhost',
    port: 9555,
    realtime: true,
    enabled: true,
    // //  import.meta.env.VITE_WITHDEVTOOLS,
    autoReconnect: true,
  });

  // Initialize the DevTools instance with the initial state
  devToolsInstance.init(window.fx.getState());

  // Return the DevTools instance for later use
  return devToolsInstance;
}

export function subscribeToActions(fxstore: AppState, options?: Options) {
  if (!devToolsInstance) {
    console.error('DevTools not initialized');
    // Not initialized
    return;
  }
  const unSubscribe = () => {
    try {
      // options?.action &&
      devToolsInstance.send(options.action, window.fx.getState());
    } catch (e) {
      console.error('Failed to send action', e);
    }
  };
  // Return the unsubscribe function for later use
  return unSubscribe();
}