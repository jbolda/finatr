import {
  take,
  ensure,
  resource,
  type Operation,
  select,
  sleep,
  spawn,
  each,
  put,
  createSignal,
  waitFor
} from 'starfx';

import { schema } from '~/store/schema/index.ts';

import { thunks } from './foundation.ts';

export const receiveSyncMessage = thunks.create<string>(
  'sync.receive',
  function* (ctx, next) {
    const message = ctx.payload as string;
    console.log('[receiveSyncMessage] invoked with message ->', message);
    const cur = yield* select(schema.sync.select);
    yield* schema.update(schema.sync.set({ ...cur, lastMessage: message }));
    const nxt = yield* select(schema.sync.select);
    console.log('[receiveSyncMessage] updated lastMessage ->', nxt.lastMessage);
    yield* next();
  }
);

/*
 WebSocket managed resource

 This resource watches the app's configured `sync.service` (or the
 persisted `persist.syncService` as a fallback) and ensures a single
 WebSocket connection is open to `/<sync.service>/ws`.

 The managed resource exposes a `send` operation so other thunks can
 send JSON messages to the server. It updates `schema.sync.connected`
 and `schema.sync.lastMessage` to reflect connection state and the
 latest received message.
*/

// Convert an http(s) endpoint into a ws(s) endpoint and append /ws path
function toWebSocketUrl(endpoint: string) {
  try {
    const url = new URL(endpoint);
    if (url.protocol === 'https:') {
      url.protocol = 'wss:';
    } else if (url.protocol === 'http:') {
      url.protocol = 'ws:';
    }
    // Ensure path ends with /ws
    const path = (url.pathname || '').replace(/\/$/, '');
    url.pathname = `${path}/ws`;
    return url.toString();
  } catch (err) {
    // If it's not a valid URL, just try to append /ws
    return `${endpoint.replace(/\/$/, '')}/ws`;
  }
}

type WebsocketProvided = {
  // send a JSON message
  send: (msg: unknown) => Operation<void>;
  // close the underlying socket (test and control hook)
  close?: () => Operation<void>;
};

function useWebsocket() {
  return resource(function* (provide) {
    const outbound = createSignal<string>();
    let socket: any = null;

    // Build a provided resource object early so other thunks can obtain
    // the `send`/`close` operations even before the socket opens.
    const provided: WebsocketProvided = {
      send: function* (msg: unknown) {
        const data = typeof msg === 'string' ? msg : JSON.stringify(msg);
        outbound.send(data);
      },
      close: function* () {
        if (socket) socket.close();
      }
    };

    yield* spawn(function* () {
      const inbound = createSignal<string, void>();
      while (true) {
        yield* schema.update(
          schema.sync.update({ key: 'connected', value: false })
        );

        const sync = yield* select(schema.sync.select);
        const persist = yield* select(schema.persist.select);
        const endpoint = sync.service || persist.syncService;

        if (!endpoint) {
          // nothing configured — wait for persist/service changes
          // TODO take on sync url change, use createThunk key to narrow
          yield* take('*');
          continue;
        }

        const wsUrl = toWebSocketUrl(endpoint);

        try {
          console.log('[wsResource] entering resource try for wsUrl=', wsUrl);

          // debugging disabled in test-run environment
          socket = new WebSocket(wsUrl);
          socket.addEventListener('open', () => {
            console.log('[wsResource] socket open event url=', wsUrl);
            inbound.send('open');
          });
          socket.addEventListener('close', () => {
            console.log('[wsResource] socket close event');
            inbound.close();
          });
          socket.addEventListener('message', (ev: MessageEvent) => {
            console.log('[wsResource] message event:', ev.data);
            const s =
              typeof ev.data === 'string' ? ev.data : JSON.stringify(ev.data);
            inbound.send(s);
          });
          socket.addEventListener('error', () => {});

          console.log(
            '[wsResource] setup socket, readyState=',
            socket?.readyState,
            'url=',
            wsUrl
          );
          console.log(
            '[wsResource] setup socket, readyState=',
            socket?.readyState,
            'url=',
            wsUrl
          );

          // ensure we cleanup socket and close the channel when this connection (or resource) is torn down
          yield* ensure(() => {
            if (
              socket &&
              socket.readyState === (globalThis as any).WebSocket.OPEN
            )
              socket.close();
          });

          // listen for if the user changes the sync endpoint, kill the signal
          // which will kill the socket and drop into a reconnect loop
          yield* spawn(function* endpointWatcher() {
            while (
              socket &&
              socket.readyState !== (globalThis as any).WebSocket.CLOSED
            ) {
              // react to actions and check whether the configured endpoint changed
              yield* take('*');
              const _syncNow = yield* select(schema.sync.select);
              const _persistNow = yield* select(schema.persist.select);
              const nextEndpoint = _syncNow.service || _persistNow.syncService;
              if (nextEndpoint !== endpoint) {
                console.log(
                  '[wsResource] endpoint changed; reconnecting',
                  'old=',
                  endpoint,
                  'new=',
                  nextEndpoint
                );
                inbound.close();
                break;
              }
            }
          });

          // handle outbound messages
          yield* spawn(function* outboundHandler() {
            for (const message of yield* each(outbound)) {
              // wait until socket is open and ready to send
              yield* waitFor(() => {
                return (
                  socket &&
                  socket.readyState === (globalThis as any).WebSocket.OPEN
                );
              });
              console.log(
                '[wsResource] outboundHandler sending message ->',
                message
              );
              socket.send(message);
              yield* each.next();
            }
          });

          // react to messages until it is closed
          for (const message of yield* each(inbound)) {
            if (message === 'open') {
              console.log('[wsResource] socket opened, marking connected');
              // mark connected
              yield* schema.update(
                schema.sync.update({ key: 'connected', value: true })
              );
            } else {
              console.log(
                '[wsResource] consumer got message via each ->',
                message
              );
              yield* put(receiveSyncMessage(message as string));
            }
            yield* each.next();
          }
        } catch (err) {
          console.log('[wsResource] resource error', err);
          // connection attempt failed, mark disconnected and retry with backoff
          const cur = yield* select(schema.sync.select);
          yield* schema.update(schema.sync.set({ ...cur, connected: false }));
          yield* sleep(1000);
        }
      }
    });

    try {
      yield* provide(provided);
    } finally {
      console.log('[wsResource] provide finally block reached');
      socket.close(1000, 'released');
      // socket.removeEventListener("message", messages.send);
      // socket.removeEventListener("close", messages.close);
    }
  });
}

// Register the managed resource on the thunks manager so it's supervised and started
export const WebsocketContext = thunks.manage('sync.websocket', useWebsocket());

export const sendSyncMessage = thunks.create<unknown>(
  'sync.send',
  function* (ctx, next) {
    const ws = (yield* WebsocketContext.expect()) as WebsocketProvided;
    yield* ws.send(ctx.payload);
    yield* next();
  }
);

export default WebsocketContext;
