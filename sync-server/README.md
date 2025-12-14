# sync-server

Lightweight WebSocket server used for development, e2e testing, and local hosting. It implements the Loro protocol wire messages (via the `loro-protocol` crate) and provides a tiny management HTTP API for inspection and broadcasting.

## Features

- WebSocket endpoint: accepts upgrades at `/ws` or `/ws/{workspace}`. When a workspace id is present in the URL the server derives the workspace identifier from the first path segment after `/ws/`.
- Management HTTP endpoints (served on the same port as the WebSocket server):
  - GET `/` => health (JSON: {"status":"ok"})
  - GET `/inspect` => returns workspace peers and last snapshot (base64) for each room
  - POST `/broadcast` => accepts `{ "msg": string }` JSON and broadcasts a text message to all peers
- Implements Loro protocol `ProtocolMessage` frames (JoinRequest, DocUpdate, fragments, etc.). The server maintains per-room in-memory docs and broadcasts updates to subscribers. Optional persistence is supported via `on_load_document` / `on_save_document` hooks.

## Development

Quick start (development):

1. Pick a port and run the server from the workspace root:

```bash
cargo run --manifest-path sync-server/Cargo.toml --bin sync-server
```

2. Environment variables you can use in development:

- `SYNC_DB` — path to the SQLite database used for snapshot persistence. Defaults to `loro.db` in the current directory when not set.
- `SYNC_MANAGEMENT_PORT` — compatibility variable used by some tests; when set the management server may be started on a specific port. The `sync-server` wrapper serves management endpoints on the same port as the WebSocket server by default.

Tests are run from the crate directory and will spawn an in-process server using the test helpers in `src/lib.rs`:

```bash
cd sync-server
cargo test
```

The test helpers (`spawn_server`, `spawn_server_with_config`) start the WebSocket + management server on the same port (no separate management port required). Tests rely on `reqwest` for management API calls during testing.

## HTTP API reference (management & compatibility)

This section documents the tiny HTTP API and WebSocket upgrade behaviour so other implementations (or clients) can interoperate with the same API.

HTTP (management) API — served on the same host:port as the WebSocket server

- GET `/` — Description: Basic health check. Response: 200 OK, body: JSON `{ "status": "ok" }`.
- GET `/inspect` — Description: Returns the current server inspection data. Useful for management UIs and tests. Response: 200 OK, body: JSON object mapping workspace ids to an object with keys `rooms`. `rooms` maps room id to a base64-encoded snapshot string. Example:
  `json
{
	"": { "rooms": { "test-room": "<base64 snapshot>" } }
}
`
- POST `/broadcast` — Description: Broadcast a text message to all connected peers across all workspaces. Request body: JSON `{ "msg": "some text" }`. Response: 200 OK, body: JSON `{ "status": "ok" }`.

### Examples

Fetch the server health:

```bash
curl http://127.0.0.1:9000/
```

Get current inspection info:

```bash
curl http://127.0.0.1:9000/inspect
```

Broadcast a text message to all connected peers:

```bash
curl -X POST http://127.0.0.1:9000/broadcast -H 'Content-Type: application/json' -d '{"msg":"hello mgmt broadcast"}'
```

WebSocket behaviour (Loro protocol)

- Upgrade path(s): Clients should perform a WebSocket upgrade to `ws://{host}:{port}/ws` or `ws://{host}:{port}/ws/{workspace}`.
- The server expects standard WebSocket upgrade headers and processes frames using `loro-protocol`.

## Persistence hooks (server implementers)

- The server exposes two hook types in its Rust API (`ServerConfig`):
  - `on_load_document(workspace: String, room: String, crdt: CrdtType) -> Future<Option<Vec<u8>>>` — invoked when a room is first created to optionally load a persisted snapshot.
  - `on_save_document(workspace: String, room: String, crdt: CrdtType, data: Vec<u8>) -> Future<Result<(), String>>` — invoked when the server persists a snapshot for a room.

These hooks are optional and are useful to integrate persistence with a backing DB (like the SQLite helper included here).

## Implementation notes

- The current `sync-server` implementation uses a small, local LWS wrapper (`src/lws_wrapper.rs`) and a manual WebSocket handshake to avoid complexity combining HTTP and WebSocket upgrade helpers. Management endpoints are implemented directly in this crate — no separate shared server implementation or wrapper library is required.
- The management endpoints and WebSocket server run on the same port by default, enabling test code to call management APIs against the test server directly.
