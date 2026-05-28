// Loro protocol helpers (encode/decode)
import {
  encode as protoEncode,
  tryDecode as protoTryDecode,
  MessageType,
  CrdtType
} from 'loro-protocol';
import {
  take,
  ensure,
  resource,
  type Operation,
  type StoreUpdater,
  type SliceFromSchema,
  select,
  sleep,
  spawn,
  each,
  put,
  createSignal,
  StoreContext
} from 'starfx';

// RootDoc context is defined separately so other modules can import it without
// pulling in updater logic.
import { RootDoc } from '~/store/schema/context.ts';
import { metaSchema as schema, type MetaSchemaSlices } from '~/store/schema/index.ts';

type MetaState = SliceFromSchema<MetaSchemaSlices>;

import { thunks } from './foundation.ts';

export const receiveSyncMessage = thunks.create<string>(
  'sync:receive',
  function* (ctx, next) {
    const message = ctx.payload as string;
    console.log('[receiveSyncMessage] invoked with message ->', message);
    const cur = yield* select(schema.sync.select);
    const updater = schema.sync.set({ ...cur, lastMessage: message });
    yield* schema.update(updater as unknown as StoreUpdater<MetaState>);
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
  // send a Loro-encoded binary frame (Uint8Array or ArrayBuffer)
  send: (msg: Uint8Array | ArrayBuffer) => Operation<void>;
  // close the underlying socket (test and control hook)
  close?: () => Operation<void>;
};

// Helper: assert that we only send binary frames via the websocket. Management
// messages (e.g., /broadcast) should be sent via the management HTTP API.
function assertBinaryFrame(msg: unknown): msg is Uint8Array | ArrayBuffer {
  return msg instanceof Uint8Array || msg instanceof ArrayBuffer;
}

function useWebsocket(): Operation<WebsocketProvided> {
  return resource(function* (provide) {
    const outbound = createSignal<string | Uint8Array>();
    let socket: any = null;

    // Build a provided resource object early so other thunks can obtain
    // the `send`/`close` operations even before the socket opens.
    const provided: WebsocketProvided = {
      send: function* (msg: Uint8Array | ArrayBuffer) {
        // Enforce binary Loro frames only. If callers need to perform management
        // broadcasts they should call the management HTTP API instead of
        // sending text frames over the sync socket.
        if (!assertBinaryFrame(msg)) {
          console.error(
            '[wsResource] send expects Uint8Array/ArrayBuffer; rejecting non-binary payload'
          );
          return;
        }
        // Normalize ArrayBuffer -> Uint8Array for consistent handling
        const data = msg instanceof ArrayBuffer ? new Uint8Array(msg) : msg;
        outbound.send(data);
      },
      close: function* () {
        if (socket) socket.close();
      }
    };

    yield* spawn(function* () {
      const inbound = createSignal<string | Uint8Array, void>();
      const ROOM_ID = 'plan'; // default room id used for Loro join/doc updates
      let joined = false;
      const pendingUpdates: Uint8Array[] = [];
      while (true) {
        const cur = yield* select(schema.sync.select);
        const updater = schema.sync.set({ ...cur, connected: false });
        yield* schema.update(updater as unknown as StoreUpdater<MetaState>);

        const sync = yield* select(schema.sync.select);
        const persist = yield* select(schema.persist.select);
        // normalize the configured service; trim whitespace so that blank
        // values don't slip through the falsiness check and result in a
        // relative `/ws` connection to the dev server.
        let endpoint = (sync.service || persist.syncService || '')
          .toString()
          .trim();

        // ignore empty or self-origin endpoints; the latter occurs when
        // `endpoint` is blank and `toWebSocketUrl` produces a relative URL
        // which the browser resolves against the app host. connecting to the
        // development server itself is pointless and just floods the console
        // with connection failures during startup.
        const appOrigin =
          typeof window !== 'undefined'
            ? `${window.location.protocol}//${window.location.host}`
            : '';
        console.log(
          '[wsResource] computed endpoint=',
          endpoint,
          'appOrigin=',
          appOrigin
        );
        if (!endpoint || endpoint === appOrigin) {
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
            try {
              // Handle both text and binary in browsers (Blob / ArrayBuffer / string)
              if (typeof ev.data === 'string') {
                inbound.send(ev.data);
              } else if (ev.data instanceof ArrayBuffer) {
                inbound.send(new Uint8Array(ev.data));
              } else if (ev.data instanceof Blob) {
                // read blob asynchronously and send once available
                ev.data
                  .arrayBuffer()
                  .then((buf) => inbound.send(new Uint8Array(buf)));
              } else if (ev.data instanceof Uint8Array) {
                inbound.send(ev.data);
              } else {
                // fallback: stringify unknown payloads
                const s =
                  typeof ev.data === 'string'
                    ? ev.data
                    : JSON.stringify(ev.data);
                inbound.send(s);
              }
            } catch (e) {
              console.error('[wsResource] message listener error', e);
            }
          });
          socket.addEventListener('error', (error: Error) => {
            console.error(error);
          });

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
              const nextEndpoint = (_syncNow.service || _persistNow.syncService || '')
                .toString()
                .trim();
              if (nextEndpoint && nextEndpoint !== endpoint) {
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
              if (
                socket &&
                socket.readyState === (globalThis as any).WebSocket.OPEN
              ) {
                const logMsg =
                  message instanceof Uint8Array
                    ? `Uint8Array(${message.length})`
                    : message;
                console.log(
                  '[wsResource] outboundHandler sending message ->',
                  logMsg
                );
                // browser WebSocket accepts ArrayBuffer/TypedArray or string
                socket.send(message as any);
              }
              yield* each.next();
            }
          });

          // Subscribe to the RootDoc local updates and forward raw Loro updates
          // to the sync server. This sends the Loro binary updates verbatim so the
          // server can relay/import them on peers.
          yield* spawn(function* storeWatcher() {
            try {
              const store = yield* StoreContext.expect();
              const scope = store.getScope();

              // wait until RootDoc is available in the scope
              while (!scope.get(RootDoc)) {
                yield* take('*');
              }

              const doc: any = scope.get(RootDoc);

              const recent = new Set<string>();
              const unsub = doc.subscribeLocalUpdates((update: Uint8Array) => {
                try {
                  const view = new Uint8Array(update);
                  const prefix = Array.from(view.slice(0, 8)).join(',');
                  const key = `${view.length}:${prefix}`;
                  if (recent.has(key)) {
                    console.log(
                      '[wsResource] skipping duplicate local update ->',
                      view.length
                    );
                    return;
                  }
                  recent.add(key);
                  // expire dedupe key after a short window
                  setTimeout(() => recent.delete(key), 2000);

                  console.log(
                    '[wsResource] doc.subscribeLocalUpdates -> bytes:',
                    view.length
                  );
                  // Build a Loro Protocol DocUpdate message and send encoded bytes
                  try {
                    const du = {
                      type: MessageType.DocUpdate,
                      crdt: CrdtType.Loro,
                      roomId: ROOM_ID,
                      updates: [view],
                      batchId: '0x0000000000000000'
                    } as any;
                    const enc = protoEncode(du as any);
                    if (!joined) {
                      pendingUpdates.push(enc);
                      console.log(
                        '[wsResource] queued DocUpdate (pending join) ->',
                        view.length
                      );
                    } else {
                      outbound.send(enc);
                      console.log(
                        '[wsResource] queued DocUpdate ->',
                        view.length
                      );
                    }
                  } catch (e) {
                    console.error('[wsResource] failed to encode DocUpdate', e);
                    // fallback: send raw bytes
                    if (!joined) {
                      pendingUpdates.push(view);
                      console.log(
                        '[wsResource] queued raw local update (pending join) ->',
                        view.length
                      );
                    } else {
                      outbound.send(view);
                      console.log(
                        '[wsResource] queued raw local update ->',
                        view.length
                      );
                    }
                  }
                } catch (e) {
                  console.error('[wsResource] failed to queue local update', e);
                }
              });

              // keep subscription alive until RootDoc changes
              while (true) {
                yield* take('*');
                const nowRoot = store.getScope().get(RootDoc);
                if (nowRoot !== doc) {
                  try {
                    unsub();
                  } catch (e) {
                    // ignore
                  }
                  break;
                }
              }
            } catch (err) {
              console.error('[wsResource] storeWatcher error', err);
            }
          });

          // react to messages until it is closed
          for (const message of yield* each(inbound)) {
            if (message === 'open') {
              console.log('[wsResource] socket opened, marking connected');
              // mark connected
              const cur = yield* select(schema.sync.select);
              const updater = schema.sync.set({ ...cur, connected: true });
              yield* schema.update(updater as unknown as StoreUpdater<MetaState>);

              // Send a Loro JoinRequest for the room so the server registers us as a peer
              try {
                const joinReq = {
                  type: MessageType.JoinRequest,
                  crdt: CrdtType.Loro,
                  roomId: ROOM_ID,
                  auth: new Uint8Array(),
                  version: new Uint8Array()
                } as any;
                const b = protoEncode(joinReq as any);
                console.log('[wsResource] sending JoinRequest ->', ROOM_ID);
                outbound.send(b);
                // Immediate fallback: ensure the join is sent even if the outbound
                // handler hasn't processed the signal yet (tests rely on quick handshake)
                try {
                  if (
                    socket &&
                    socket.readyState === (globalThis as any).WebSocket.OPEN
                  ) {
                    console.log(
                      '[wsResource] direct socket.send JoinRequest ->',
                      b?.length
                    );
                    socket.send(b as any);
                  }
                } catch (e) {
                  console.error(
                    '[wsResource] direct join socket.send failed',
                    e
                  );
                }
              } catch (e) {
                console.error('[wsResource] failed to send JoinRequest', e);
              }
            } else if (message instanceof Uint8Array) {
              // handle binary messages: try to parse Loro protocol frames
              try {
                const proto = protoTryDecode(message as Uint8Array);
                if (proto) {
                  switch (proto.type) {
                    case MessageType.JoinResponseOk:
                      console.log(
                        '[wsResource] received JoinResponseOk',
                        proto
                      );
                      try {
                        joined = true;
                        // flush any pending updates queued before join
                        while (pendingUpdates.length > 0) {
                          const p = pendingUpdates.shift()!;
                          try {
                            outbound.send(p);
                            if (
                              socket &&
                              socket.readyState ===
                                (globalThis as any).WebSocket.OPEN
                            ) {
                              // Attempt direct send as a fallback to ensure delivery
                              socket.send(p as any);
                            }
                            console.log(
                              '[wsResource] flushed pending update ->',
                              p?.length
                            );
                          } catch (e) {
                            console.error(
                              '[wsResource] failed flushing pending update send',
                              e
                            );
                          }
                        }
                      } catch (e) {
                        console.error(
                          '[wsResource] failed flushing pending updates',
                          e
                        );
                      }
                      break;
                    case MessageType.JoinError:
                      console.warn('[wsResource] received JoinError', proto);
                      break;
                    case MessageType.DocUpdate:
                      try {
                        const store = yield* StoreContext.expect();
                        const scope = store.getScope();
                        const doc: any = scope.get(RootDoc);
                        if (doc) {
                          for (const u of (proto as any).updates || []) {
                            try {
                              doc.import(u);
                            } catch (e) {
                              console.error(
                                '[wsResource] failed to import update',
                                e
                              );
                            }
                          }
                          doc.commit();
                        }
                      } catch (e) {
                        console.error(
                          '[wsResource] doc update handling error',
                          e
                        );
                      }
                      break;
                    default:
                      console.log(
                        '[wsResource] received protocol message',
                        proto.type
                      );
                      break;
                  }
                } else {
                  console.log('[wsResource] received binary non-proto message');
                }
              } catch (e) {
                console.error(
                  '[wsResource] failed to decode binary message',
                  e
                );
              }
            } else {
              // text message — forward into existing string-based handler
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
          const updater = schema.sync.set({ ...cur, connected: false });
          yield* schema.update(updater as unknown as StoreUpdater<MetaState>);
          yield* sleep(1000);
        }
      }
    });

    try {
      yield* provide(provided);
    } catch (err) {
      console.error('[wsResource] provide caught error', err);
    } finally {
      console.log('[wsResource] provide finally block reached');
      // socket.removeEventListener("message", messages.send);
      // socket.removeEventListener("close", messages.close);
    }
  });
}

// Register the managed resource on the thunks manager so it's supervised and started
export const WebsocketContext = thunks.manage('sync:websocket', useWebsocket());

export const sendSyncMessage = thunks.create<
  Uint8Array | ArrayBuffer | Uint8Array[]
>('sync:send', function* (ctx, next) {
  const ws = (yield* WebsocketContext.expect()) as WebsocketProvided;
  const payload = ctx.payload as unknown;
  // Support sending a single binary frame or an array of frames to be queued
  if (payload instanceof Uint8Array || payload instanceof ArrayBuffer) {
    yield* ws.send(payload as Uint8Array | ArrayBuffer);
  } else if (
    Array.isArray(payload) &&
    payload.every((p) => p instanceof Uint8Array)
  ) {
    for (const p of payload as Uint8Array[]) {
      yield* ws.send(p);
    }
  } else {
    console.error(
      '[sendSyncMessage] payload must be Uint8Array or ArrayBuffer'
    );
  }
  yield* next();
});
