import { type Action } from 'redux';
import { take, ensure, resource, type FxStore, type Operation } from 'starfx';

interface ReduxDevtoolsExtensionConnectResponse {
  init: <S>(
    state: S,
    liftedData?: ReturnType<FxStore<any>['getState']>
  ) => void;
  send: <A extends Action<string>>(
    action: A,
    state: ReturnType<FxStore<any>['getState']>
  ) => void;
}
interface DevToolsEffectionized {
  send: (action: Action) => Operation<void>;
}

interface ReduxDevtoolsExtension {
  send: (args: any) => void;
  connect: (args: any) => ReduxDevtoolsExtensionConnectResponse;
  disconnect: () => void;
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevtoolsExtension;
  }
}

type Options = {
  name?: string;
  enabled?: boolean;
  store: FxStore<any>;
};

export function connectReduxDevToolsExtension(options: Options) {
  return function* setup() {
    const extension = window.__REDUX_DEVTOOLS_EXTENSION__;
    if (options.enabled !== false && extension) {
      const { name, store } = options;
      const dt = yield* setupDevTools({ name, store, extension });
      while (true) {
        const action = yield* take('*');
        yield* dt.send(action);
      }
    }
  };
}

type SetupOptions = {
  name?: string;
  store: FxStore<any>;
  extension: ReduxDevtoolsExtension;
};

function setupDevTools(
  options: SetupOptions
): Operation<DevToolsEffectionized> {
  return resource(function* (provide) {
    // https://github.com/reduxjs/redux-devtools/blob/main/extension/src/pageScript/index.ts
    const { name = 'starfx', store, extension } = options;

    const opts = {
      name,
      hostname: 'localhost',
      port: 9555,
      autoReconnect: true,
      disconnectOnUnload: true
    };
    yield* ensure(() => {
      extension.disconnect();
    });
    const devToolsInstance = extension.connect(opts);

    // Initialize the DevTools instance with the initial state
    devToolsInstance.init(store.getState());

    // Return the DevTools instance for later use
    yield* provide({
      send: function* (action: Action): Operation<void> {
        devToolsInstance.send(action, store.getState());
      }
    });
  });
}
