// Lightweight LWS wrapper that provides Loro protocol WebSocket handling
// and management endpoints (inspect / broadcast). Implemented directly in
// this crate — no shared library required.
//! Minimal wrapper server for Loro protocol WebSocket handling
//!
//! This module provides a wrapper around the Loro protocol WebSocket handling; it's
//! a small server implementation that accepts connections, applies updates to
//! per-room Loro docs, and exposes a ServerHandle to be used by management
//! endpoints for broadcasting and inspection.

use crate::protocol;
use crate::protocol::{try_decode, Permission, ProtocolMessage, UpdateStatusCode};
use base64::Engine;
use futures_util::SinkExt;
use loro::LoroDoc;
use serde_json::json;
// tokio::net::TcpStream is not required directly in this module
use tokio::sync::mpsc;
use tokio_tungstenite::accept_hdr_async;
use tokio_tungstenite::tungstenite;
use tokio_tungstenite::tungstenite::Message;
use tracing::{error, warn};

use tokio::sync::mpsc::UnboundedSender;
use tokio::sync::Mutex as TokioMutex;

use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
// Use fully qualified names for collections to avoid unused import warnings
use std::sync::atomic::{AtomicU64, Ordering};

// Minimal local helper types to keep the wrapper self-contained while
// leveraging the upstream `ServerConfig` type. These are intentionally
// small and may be expanded later to match upstream behavior.

pub type Sender = UnboundedSender<Message>;

// Hook type aliases for load/save and peer connect/disconnect callbacks used by the server.
pub type OnLoadFn = std::sync::Arc<
    dyn Fn(
            String,
            String,
            crate::protocol::CrdtType,
        ) -> Pin<Box<dyn Future<Output = Result<Option<Vec<u8>>, String>> + Send>>
        + Send
        + Sync,
>;
pub type OnSaveFn = std::sync::Arc<
    dyn Fn(
            String,
            String,
            crate::protocol::CrdtType,
            Vec<u8>,
        ) -> Pin<Box<dyn Future<Output = Result<(), String>> + Send>>
        + Send
        + Sync,
>;
pub type OnPeerFn = std::sync::Arc<dyn Fn(u64) + Send + Sync>;

#[derive(Clone)]
pub struct ServerConfig {
    pub on_load_document: Option<OnLoadFn>,
    pub on_save_document: Option<OnSaveFn>,
    pub save_interval_ms: Option<u64>,
    pub on_peer_connect: Option<OnPeerFn>,
    pub on_peer_disconnect: Option<OnPeerFn>,
    pub default_permission: Option<crate::protocol::Permission>,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            on_load_document: None,
            on_save_document: None,
            save_interval_ms: None,
            on_peer_connect: None,
            on_peer_disconnect: None,
            default_permission: None,
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RoomKey {
    pub crdt: crate::protocol::CrdtType,
    pub room: String,
}

impl std::hash::Hash for RoomKey {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        std::mem::discriminant(&self.crdt).hash(state);
        self.room.hash(state);
    }
}

pub const MAX_FRAGMENTS: u64 = 1024;
pub const MAX_BATCH_BYTES: u64 = 10_000_000;

static NEXT_ID: AtomicU64 = AtomicU64::new(1);

fn next_batch_id() -> crate::protocol::BatchId {
    let id = NEXT_ID.fetch_add(1, Ordering::Relaxed);
    let bytes = id.to_be_bytes();
    crate::protocol::BatchId(bytes)
}

pub struct RoomDocState {
    pub doc: Box<dyn RoomDoc + Send + Sync>,
}

pub trait RoomDoc {
    fn apply_updates(&mut self, _updates: &Vec<Vec<u8>>) -> Result<(), String> {
        Ok(())
    }
    fn should_persist(&self) -> bool {
        false
    }
    fn export_snapshot(&self) -> Option<Vec<u8>> {
        None
    }
    fn import(&mut self, _b: &[u8]) -> Result<(), String> {
        Ok(())
    }
}

pub struct LoroRoomDoc {
    pub doc: loro::LoroDoc,
}
impl RoomDoc for LoroRoomDoc {
    fn apply_updates(&mut self, _updates: &Vec<Vec<u8>>) -> Result<(), String> {
        for u in _updates.iter() {
            let _ = self.doc.import(u.as_slice());
        }
        self.doc.commit();
        Ok(())
    }
    fn should_persist(&self) -> bool {
        true
    }
    fn export_snapshot(&self) -> Option<Vec<u8>> {
        use loro::ExportMode;
        match self.doc.export(ExportMode::all_updates()) {
            Ok(v) => Some(v),
            Err(_) => None,
        }
    }
}

pub struct FragmentBatch {
    pub from_conn: u64,
    pub expected_count: u32,
    pub parts: Vec<Option<Vec<u8>>>,
    pub received: u32,
    pub total_size_bytes: usize,
}

pub struct Hub {
    pub subs: std::collections::HashMap<RoomKey, Vec<(u64, Sender)>>,
    // Track raw connections (conn_id -> Sender) so management endpoints can
    // report active peers and broadcast text messages to any connected socket
    // regardless of whether the connection performed a Loro JoinRequest.
    pub connections: std::collections::HashMap<u64, Sender>,
    pub fragments: std::collections::HashMap<(RoomKey, crate::protocol::BatchId), FragmentBatch>,
    pub docs: std::collections::HashMap<RoomKey, RoomDocState>,
    pub config: ServerConfig,
}

impl Hub {
    pub fn new(cfg: ServerConfig) -> Self {
        Self {
            subs: std::collections::HashMap::new(),
            connections: std::collections::HashMap::new(),
            fragments: std::collections::HashMap::new(),
            docs: std::collections::HashMap::new(),
            config: cfg,
        }
    }
    pub fn add_connection(&mut self, id: u64, tx: Sender) {
        self.connections.insert(id, tx);
    }
    pub fn remove_connection(&mut self, id: &u64) {
        self.connections.remove(id);
        // Also remove from subs if present; this mirrors the previous cleanup
        // logic where disconnecting a socket removes it from subscription lists.
        let keys: Vec<RoomKey> = self.subs.keys().cloned().collect();
        for rk in keys.iter() {
            if let Some(list) = self.subs.get_mut(rk) {
                list.retain(|(cid, _)| cid != id);
                if list.is_empty() {
                    self.subs.remove(rk);
                }
            }
        }
    }
    pub fn start_fragment_batch(
        &mut self,
        room: RoomKey,
        conn: u64,
        batch_id: crate::protocol::BatchId,
        count: u64,
        total: u64,
    ) {
        let expected = match usize::try_from(count) {
            Ok(n) => n,
            Err(_) => return,
        };
        let fb = FragmentBatch {
            from_conn: conn,
            expected_count: count as u32,
            parts: vec![None; expected],
            received: 0,
            total_size_bytes: match usize::try_from(total) {
                Ok(n) => n,
                Err(_) => 0,
            },
        };
        self.fragments.insert((room, batch_id), fb);
    }

    pub fn add_fragment_and_maybe_finish(
        &mut self,
        _room: &RoomKey,
        batch_id: crate::protocol::BatchId,
        index: u64,
        fragment: Vec<u8>,
    ) -> Option<Vec<u8>> {
        if let Some(entry) = self.fragments.get_mut(&(_room.clone(), batch_id)) {
            let idx = match usize::try_from(index) {
                Ok(i) => i,
                Err(_) => return None,
            };
            if idx >= entry.parts.len() {
                return None;
            }
            if entry.parts[idx].is_none() {
                entry.parts[idx] = Some(fragment);
                entry.received += 1;
            }
            if entry.received >= entry.expected_count {
                // reassemble
                let mut out = Vec::with_capacity(entry.total_size_bytes);
                for p in entry.parts.iter_mut() {
                    if let Some(chunk) = p.take() {
                        out.extend_from_slice(&chunk);
                    }
                }
                self.fragments.remove(&(_room.clone(), batch_id));
                return Some(out);
            }
        }
        None
    }
}

pub struct HubRegistry {
    map: std::sync::Mutex<std::collections::HashMap<String, Arc<TokioMutex<Hub>>>>,
    pub config: ServerConfig,
}
impl HubRegistry {
    pub fn new(cfg: ServerConfig) -> Self {
        Self {
            map: std::sync::Mutex::new(std::collections::HashMap::new()),
            config: cfg,
        }
    }
    pub async fn get_or_create(&self, workspace: &str) -> Arc<TokioMutex<Hub>> {
        let mut lock = self.map.lock().unwrap();
        if let Some(h) = lock.get(workspace) {
            return h.clone();
        }
        let hub = Arc::new(TokioMutex::new(Hub::new(self.config.clone())));
        lock.insert(workspace.to_string(), hub.clone());
        hub
    }
}

#[derive(Clone)]
pub struct ServerHandle {
    registry: Option<Arc<HubRegistry>>,
    _inner: Arc<TokioMutex<()>>,
}
impl ServerHandle {
    pub fn new(reg: Option<Arc<HubRegistry>>) -> Self {
        Self {
            registry: reg,
            _inner: Arc::new(TokioMutex::new(())),
        }
    }
    /// Returns a JSON structure mapping `workspace` => `{ rooms: { <roomId>: <base64 snapshot> } }`.
    ///
    /// The structure is intentionally small and intended for manual inspection during tests and development.
    pub async fn inspect(&self) -> serde_json::Value {
        use serde_json::Value;
        let mut out = serde_json::Map::new();
        if let Some(reg) = &self.registry {
            // clone entries to avoid holding map lock across .await
            let pairs: Vec<(String, Arc<TokioMutex<Hub>>)> = {
                let map_lock = reg.map.lock().unwrap();
                map_lock
                    .iter()
                    .map(|(k, v)| (k.clone(), v.clone()))
                    .collect()
            };
            // also produce a top-level peers array representing all connected ids
            let mut root_peers: Vec<serde_json::Value> = Vec::new();
            for (ws, hub) in pairs.iter() {
                let mut obj = serde_json::Map::new();
                let hub_guard = hub.lock().await;
                let mut rooms_map = serde_json::Map::new();
                for (rk, state) in hub_guard.docs.iter() {
                    if let Some(snap) = state.doc.export_snapshot() {
                        let b64 = base64::engine::general_purpose::STANDARD.encode(&snap);
                        rooms_map.insert(rk.room.clone(), Value::String(b64));
                    }
                }
                if !rooms_map.is_empty() {
                    obj.insert("rooms".to_string(), Value::Object(rooms_map));
                }
                // include peers (active connection ids) so external tests and tooling
                // can observe connected sockets. This list contains *raw* connections
                // and may include peers that haven't sent a Loro JoinRequest yet.
                let mut peers_arr: Vec<Value> = Vec::new();
                for id in hub_guard.connections.keys() {
                    peers_arr.push(Value::Number(serde_json::Number::from(*id)));
                }
                if !peers_arr.is_empty() {
                    obj.insert("peers".to_string(), Value::Array(peers_arr));
                }
                // Populate top-level peers
                for id in hub_guard.connections.keys() {
                    root_peers.push(Value::Number(serde_json::Number::from(*id)));
                }
                out.insert(ws.clone(), Value::Object(obj));
            }
            if !root_peers.is_empty() {
                out.insert("peers".to_string(), Value::Array(root_peers));
            }
        }
        Value::Object(out)
    }
    /// Broadcast a text message to all connected peers on all workspaces.
    ///
    /// This is a management-level helper intended for testing and small-scale admin usage.
    pub async fn broadcast_text(&self, msg: &str) {
        if self.registry.is_none() {
            return;
        }
        let reg = self.registry.as_ref().unwrap();
        let map = reg.map.lock().unwrap();
        for (_ws, hub_arc) in map.iter() {
            let hub = hub_arc.clone();
            let m = msg.to_string();
            tokio::spawn(async move {
                let g = hub.lock().await;
                // Broadcast to any connected socket (raw TCP websocket connection)
                // so that non-Loro raw clients and administrative tooling receive the
                // message as well as Loro-protocol peers.
                for (_id, tx) in g.connections.iter() {
                    let _ = tx.send(Message::Text(m.clone().into()));
                }
            });
        }
    }
    pub async fn register_workspace(&self, _workspace: String, _hub: Arc<TokioMutex<Hub>>) {
        // no-op: the hub registry already knows about workspaces
    }
}

// use futures::future;
// use std::future::Future as StdFuture;
use std::task::{Context, Poll};
use tokio::io::{AsyncRead, AsyncWrite};

/// Serve a bound `TcpListener` with the provided `ServerConfig` and return a `ServerHandle` for management.
pub async fn serve_with_http(
    bind: &str,
    port: u16,
    config: ServerConfig,
) -> Result<ServerHandle, Box<dyn std::error::Error + Send + Sync>> {
    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    use tokio::net::TcpListener;

    let registry = Arc::new(HubRegistry::new(config.clone()));
    let server_handle = ServerHandle::new(Some(registry.clone()));

    let addr = format!("{}:{}", bind, port);
    let listener = TcpListener::bind(&addr).await?;

    let reg_clone = registry.clone();
    let sh_clone = server_handle.clone();

    tokio::spawn(async move {
        loop {
            let (mut stream, _peer) = match listener.accept().await {
                Ok(s) => s,
                Err(e) => {
                    error!(%e, "accept failed");
                    continue;
                }
            };

            let registry = reg_clone.clone();
            let server_handle = sh_clone.clone();

            tokio::spawn(async move {
                // Read until end of headers (\r\n\r\n) to decide routing. We keep the
                // pre-read bytes so we can hand them back to the tungstenite helper
                // if this is a WebSocket upgrade. This avoids reimplementing the
                // handshake while still allowing simple management endpoints.
                let mut buf: Vec<u8> = Vec::new();
                let mut tmp = [0u8; 1024];
                loop {
                    match stream.read(&mut tmp).await {
                        Ok(0) => return, // connection closed
                        Ok(n) => {
                            buf.extend_from_slice(&tmp[..n]);
                            if buf.windows(4).any(|w| w == b"\r\n\r\n") {
                                break;
                            }
                            if buf.len() > 64 * 1024 {
                                let _ = stream
                                    .write_all(
                                        b"HTTP/1.1 431 Request Header Fields Too Large\r\n\r\n",
                                    )
                                    .await;
                                return;
                            }
                        }
                        Err(_) => return,
                    }
                }

                // Split headers and any already-read body bytes
                let hdr_end = buf.windows(4).position(|w| w == b"\r\n\r\n").unwrap() + 4;
                let headers = &buf[..hdr_end];
                let mut body_bytes = buf[hdr_end..].to_vec();

                let headers_str = match std::str::from_utf8(headers) {
                    Ok(s) => s,
                    Err(_) => {
                        let _ = stream.write_all(b"HTTP/1.1 400 Bad Request\r\n\r\n").await;
                        return;
                    }
                };

                let mut lines = headers_str.split("\r\n");
                let request_line = match lines.next() {
                    Some(l) if !l.is_empty() => l,
                    _ => {
                        let _ = stream.write_all(b"HTTP/1.1 400 Bad Request\r\n\r\n").await;
                        return;
                    }
                };
                let mut parts = request_line.split_whitespace();
                let method = parts.next().unwrap_or("");
                let path = parts.next().unwrap_or("");

                // parse headers into map
                let mut hdr_map: std::collections::HashMap<String, String> =
                    std::collections::HashMap::new();
                for line in lines {
                    if line.is_empty() {
                        break;
                    }
                    if let Some(idx) = line.find(':') {
                        let name = line[..idx].trim().to_ascii_lowercase();
                        let val = line[idx + 1..].trim().to_string();
                        hdr_map.insert(name, val);
                    }
                }

                // Helper to write a simple HTTP response
                async fn write_response(
                    stream: &mut tokio::net::TcpStream,
                    status: &str,
                    headers: &[(&str, &str)],
                    body: &[u8],
                ) {
                    let mut resp = Vec::new();
                    resp.extend_from_slice(format!("HTTP/1.1 {}\r\n", status).as_bytes());
                    for (k, v) in headers.iter() {
                        resp.extend_from_slice(format!("{}: {}\r\n", k, v).as_bytes());
                    }
                    resp.extend_from_slice(
                        format!("Content-Length: {}\r\n\r\n", body.len()).as_bytes(),
                    );
                    resp.extend_from_slice(body);
                    let _ = stream.write_all(&resp).await;
                }

                // Management endpoints
                if method.eq_ignore_ascii_case("GET") && path == "/" {
                    let body = serde_json::to_vec(&json!({"status":"ok"})).unwrap();
                    write_response(
                        &mut stream,
                        "200 OK",
                        &[("Content-Type", "application/json")],
                        &body,
                    )
                    .await;
                    return;
                }
                if method.eq_ignore_ascii_case("GET") && path == "/inspect" {
                    let info = server_handle.inspect().await;
                    let body = serde_json::to_vec(&info).unwrap_or_else(|_| b"{}".to_vec());
                    write_response(
                        &mut stream,
                        "200 OK",
                        &[("Content-Type", "application/json")],
                        &body,
                    )
                    .await;
                    return;
                }
                if method.eq_ignore_ascii_case("POST") && path == "/broadcast" {
                    // read content-length
                    let content_len = hdr_map
                        .get("content-length")
                        .and_then(|s| s.parse::<usize>().ok())
                        .unwrap_or(0);
                    while body_bytes.len() < content_len {
                        let mut tmp = vec![0u8; 1024];
                        match stream.read(&mut tmp).await {
                            Ok(0) => break,
                            Ok(n) => body_bytes.extend_from_slice(&tmp[..n]),
                            Err(_) => break,
                        }
                    }
                    if let Ok(val) = serde_json::from_slice::<serde_json::Value>(&body_bytes) {
                        if let Some(msg) = val.get("msg").and_then(|m| m.as_str()) {
                            server_handle.broadcast_text(msg).await;
                        }
                    }
                    let body = serde_json::to_vec(&json!({"status":"ok"})).unwrap();
                    write_response(
                        &mut stream,
                        "200 OK",
                        &[("Content-Type", "application/json")],
                        &body,
                    )
                    .await;
                    return;
                }

                // WebSocket upgrade path: /ws or /ws/{workspace}
                if method.eq_ignore_ascii_case("GET") && (path == "/ws" || path.starts_with("/ws/"))
                {
                    // derive workspace id from path if present: /ws/{workspace}
                    let mut workspace_id = String::new();
                    if let Some(rest) = path.strip_prefix("/ws/") {
                        if !rest.is_empty() {
                            workspace_id = rest.split('/').next().unwrap_or("").to_string();
                        }
                    }

                    // require websocket upgrade headers
                    let upgrade = hdr_map.get("upgrade").map(|s| s.to_ascii_lowercase());
                    let connection = hdr_map.get("connection").map(|s| s.to_ascii_lowercase());
                    if upgrade.as_deref() == Some("websocket")
                        && connection
                            .as_deref()
                            .map(|s| s.contains("upgrade"))
                            .unwrap_or(false)
                    {
                        // Wrap the stream with a small prebuffer that will replay the
                        // already-read bytes (headers + any body bytes) so accept_hdr_async
                        // sees the full original request.
                        use std::io::Cursor;

                        struct PreBufferedStream<S> {
                            inner: S,
                            buf: Cursor<Vec<u8>>,
                        }

                        impl<S> PreBufferedStream<S> {
                            fn new(inner: S, pre: Vec<u8>) -> Self {
                                Self {
                                    inner,
                                    buf: Cursor::new(pre),
                                }
                            }
                        }

                        impl<S: AsyncRead + Unpin> AsyncRead for PreBufferedStream<S> {
                            fn poll_read(
                                mut self: Pin<&mut Self>,
                                cx: &mut Context<'_>,
                                buf_out: &mut tokio::io::ReadBuf<'_>,
                            ) -> Poll<Result<(), std::io::Error>> {
                                // If we have prebuffered bytes, drain them first
                                let pos = self.buf.position() as usize;
                                let inner_ref = self.buf.get_ref();
                                if pos < inner_ref.len() {
                                    let rem = &inner_ref[pos..];
                                    let to_copy = std::cmp::min(rem.len(), buf_out.remaining());
                                    buf_out.put_slice(&rem[..to_copy]);
                                    self.buf.set_position((pos + to_copy) as u64);
                                    return Poll::Ready(Ok(()));
                                }
                                Pin::new(&mut self.inner).poll_read(cx, buf_out)
                            }
                        }

                        impl<S: AsyncWrite + Unpin> AsyncWrite for PreBufferedStream<S> {
                            fn poll_write(
                                mut self: Pin<&mut Self>,
                                cx: &mut Context<'_>,
                                buf: &[u8],
                            ) -> Poll<Result<usize, std::io::Error>> {
                                Pin::new(&mut self.inner).poll_write(cx, buf)
                            }
                            fn poll_flush(
                                mut self: Pin<&mut Self>,
                                cx: &mut Context<'_>,
                            ) -> Poll<Result<(), std::io::Error>> {
                                Pin::new(&mut self.inner).poll_flush(cx)
                            }
                            fn poll_shutdown(
                                mut self: Pin<&mut Self>,
                                cx: &mut Context<'_>,
                            ) -> Poll<Result<(), std::io::Error>> {
                                Pin::new(&mut self.inner).poll_shutdown(cx)
                            }
                        }

                        // Build a prebuffered stream containing the bytes we've already read
                        let pre = buf.clone();
                        let prebuf_stream = PreBufferedStream::new(stream, pre);

                        // Let tungstenite perform the handshake and return a WebSocketStream.
                        match accept_hdr_async(
                            prebuf_stream,
                            move |req: &tungstenite::handshake::server::Request,
                                  resp: tungstenite::handshake::server::Response| {
                                let _ = req; // keep types explicit
                                Ok(resp)
                            },
                        )
                        .await
                        {
                            Ok(ws) => {
                                if let Err(e) =
                                    process_ws(ws, workspace_id, registry, server_handle).await
                                {
                                    warn!(%e, "ws processing failed");
                                }
                                return;
                            }
                            Err(e) => {
                                warn!(%e, "websocket accept failed");
                                // Treat as bad request
                                // We don't have the original stream variable here because it
                                // has been moved into the accept call, so we just end.
                                return;
                            }
                        }
                    } else {
                        let _ = stream.write_all(b"HTTP/1.1 400 Bad Request\r\n\r\n").await;
                        return;
                    }
                }

                // Not found
                let _ = stream.write_all(b"HTTP/1.1 404 Not Found\r\n\r\n").await;
            });
        }
    });

    Ok(server_handle)
}

async fn process_ws<S>(
    ws: tokio_tungstenite::WebSocketStream<S>,
    workspace_id: String,
    registry: Arc<HubRegistry>,
    handle: ServerHandle,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>>
where
    S: AsyncRead + AsyncWrite + Unpin + Send + 'static,
{
    use futures_util::StreamExt as _;
    let workspace = if workspace_id.is_empty() {
        workspace_id.clone()
    } else {
        workspace_id.clone()
    };

    let hub = registry.get_or_create(&workspace).await;
    handle
        .register_workspace(workspace.clone(), hub.clone())
        .await;

    let (tx, mut rx) = mpsc::unbounded_channel::<Message>();
    let (mut sink, mut stream_in) = ws.split();
    let sink_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if sink.send(msg).await.is_err() {
                break;
            }
        }
    });

    let conn_id = NEXT_ID.fetch_add(1, Ordering::Relaxed);
    {
        let mut g = hub.lock().await;
        g.add_connection(conn_id, tx.clone());
    }
    if let Some(on_connect) = &registry.config.on_peer_connect {
        (on_connect)(conn_id);
    }

    while let Some(msg) = stream_in.next().await {
        let msg = msg?;
        match msg {
            Message::Text(t) => {
                if t == "ping" {
                    let _ = tx.send(Message::Text("pong".into()));
                }
            }
            Message::Binary(data) => {
                let inbound_bytes = data.clone();
                if let Some(proto) = try_decode(inbound_bytes.as_ref()) {
                    match proto {
                        ProtocolMessage::DocUpdateFragmentHeader {
                            crdt,
                            room_id,
                            batch_id,
                            fragment_count,
                            total_size_bytes,
                        } => {
                            let room = RoomKey {
                                crdt,
                                room: room_id.clone(),
                            };
                            if fragment_count == 0
                                || fragment_count > MAX_FRAGMENTS
                                || total_size_bytes > MAX_BATCH_BYTES
                            {
                                let ack = ProtocolMessage::Ack {
                                    crdt,
                                    room_id: room.room.clone(),
                                    ref_id: batch_id,
                                    status: UpdateStatusCode::PayloadTooLarge,
                                };
                                if let Ok(b) = protocol::encode(&ack) {
                                    let _ = tx.send(Message::Binary(b.into()));
                                }
                                continue;
                            }
                            {
                                let mut h = hub.lock().await;
                                h.start_fragment_batch(
                                    room.clone(),
                                    conn_id,
                                    batch_id,
                                    fragment_count,
                                    total_size_bytes,
                                );
                                if let Some(list) = h.subs.get(&room) {
                                    for (id, tx2) in list.iter() {
                                        if *id == conn_id {
                                            continue;
                                        }
                                        let _ = tx2.send(Message::Binary(inbound_bytes.clone()));
                                    }
                                }
                            }
                        }
                        ProtocolMessage::DocUpdateFragment { .. } => {
                            // Reuse upstream logic for fragment handling from the previous implementation
                            // For brevity we rely on the existing functions in this module
                            let (crdt, room_id, batch_id, index, fragment) = match proto {
                                ProtocolMessage::DocUpdateFragment {
                                    crdt,
                                    room_id,
                                    batch_id,
                                    index,
                                    fragment,
                                } => (crdt, room_id, batch_id, index, fragment),
                                _ => unreachable!(),
                            };
                            let room = RoomKey {
                                crdt,
                                room: room_id.clone(),
                            };
                            {
                                let h = hub.lock().await;
                                let joined = h
                                    .subs
                                    .get(&room)
                                    .map(|list| list.iter().any(|(id, _)| *id == conn_id))
                                    .unwrap_or(false);
                                if !joined {
                                    let ack = ProtocolMessage::Ack {
                                        crdt,
                                        room_id: room.room.clone(),
                                        ref_id: batch_id,
                                        status: UpdateStatusCode::PermissionDenied,
                                    };
                                    if let Ok(b) = protocol::encode(&ack) {
                                        let _ = tx.send(Message::Binary(b.into()));
                                    }
                                    continue;
                                }
                            }
                            let (maybe_reassembled, subs_clone, on_save_clone) = {
                                let mut h = hub.lock().await;
                                let key = (room.clone(), batch_id);
                                if !h.fragments.contains_key(&key) {
                                    let ack = ProtocolMessage::Ack {
                                        crdt,
                                        room_id: room.room.clone(),
                                        ref_id: batch_id,
                                        status: UpdateStatusCode::InvalidUpdate,
                                    };
                                    if let Ok(bytes) = protocol::encode(&ack) {
                                        let _ = tx.send(Message::Binary(bytes.into()));
                                    }
                                    (None, None, None)
                                } else {
                                    if let Some(existing) = h.fragments.get(&key) {
                                        if existing.from_conn != conn_id {
                                            let ack = ProtocolMessage::Ack {
                                                crdt,
                                                room_id: room.room.clone(),
                                                ref_id: batch_id,
                                                status: UpdateStatusCode::InvalidUpdate,
                                            };
                                            if let Ok(bytes) = protocol::encode(&ack) {
                                                let _ = tx.send(Message::Binary(bytes.into()));
                                            }
                                            (None, None, None)
                                        } else {
                                            let opt = h.add_fragment_and_maybe_finish(
                                                &room,
                                                batch_id,
                                                index,
                                                fragment.clone(),
                                            );
                                            let subs = h.subs.get(&room).cloned();
                                            let on_save = h.config.on_save_document.clone();
                                            (opt, subs, on_save)
                                        }
                                    } else {
                                        (None, None, None)
                                    }
                                }
                            };
                            if let Some(list) = subs_clone.as_ref() {
                                for (id, tx2) in list.iter() {
                                    if *id == conn_id {
                                        continue;
                                    }
                                    let _ = tx2.send(Message::Binary(inbound_bytes.clone()));
                                }
                            }
                            if let Some(buf) = maybe_reassembled {
                                if let Ok(updates) = parse_docupdate_payload(&buf) {
                                    let snapshot_opt: Option<Vec<u8>> = {
                                        let mut h = hub.lock().await;
                                        if !h.docs.contains_key(&room) {
                                            h.docs.insert(
                                                room.clone(),
                                                RoomDocState {
                                                    doc: Box::new(LoroRoomDoc {
                                                        doc: LoroDoc::new(),
                                                    }),
                                                },
                                            );
                                        }
                                        if let Some(room_state) = h.docs.get_mut(&room) {
                                            let _ = room_state.doc.apply_updates(&updates);
                                            if room_state.doc.should_persist() {
                                                room_state.doc.export_snapshot()
                                            } else {
                                                None
                                            }
                                        } else {
                                            None
                                        }
                                    };
                                    if let Some(list) = subs_clone {
                                        let du = ProtocolMessage::DocUpdate {
                                            crdt,
                                            room_id: room_id.clone(),
                                            updates: updates.clone(),
                                            batch_id: next_batch_id(),
                                        };
                                        if let Ok(b) = protocol::encode(&du) {
                                            for (id, tx2) in list.iter() {
                                                if *id == conn_id {
                                                    continue;
                                                }
                                                let _ = tx2.send(Message::Binary(b.clone().into()));
                                            }
                                        }
                                    }
                                    if let (Some(on_save), Some(snap)) =
                                        (on_save_clone, snapshot_opt)
                                    {
                                        let saved_cb = on_save.clone();
                                        let w = workspace.clone();
                                        let r = room_id.clone();
                                        let cr = crdt;
                                        tokio::spawn(async move {
                                            let _ = (saved_cb)(w, r, cr, snap).await;
                                        });
                                    }
                                }
                            }
                        }
                        ProtocolMessage::JoinRequest { crdt, room_id, .. } => {
                            let rk = RoomKey {
                                crdt,
                                room: room_id.clone(),
                            };
                            {
                                let mut g = hub.lock().await;
                                if !g.docs.contains_key(&rk) {
                                    let doc = LoroDoc::new();
                                    if let Some(on_load) = &g.config.on_load_document {
                                        let fut =
                                            (on_load)(workspace.clone(), room_id.clone(), crdt);
                                        match fut.await {
                                            Ok(Some(snap)) => {
                                                let _ = doc.import(snap.as_slice());
                                            }
                                            Ok(None) => {}
                                            Err(e) => {
                                                warn!(%e, "on_load failed");
                                            }
                                        }
                                    }
                                    g.docs.insert(
                                        rk.clone(),
                                        RoomDocState {
                                            doc: Box::new(LoroRoomDoc { doc }),
                                        },
                                    );
                                }
                                let list = g.subs.entry(rk.clone()).or_insert_with(Vec::new);
                                list.push((conn_id, tx.clone()));
                            }
                            let ok = ProtocolMessage::JoinResponseOk {
                                crdt,
                                room_id: room_id.clone(),
                                permission: Permission::Write,
                                version: Vec::new(),
                                extra: Some(Vec::new()),
                            };
                            if let Ok(b) = protocol::encode(&ok) {
                                let _ = tx.send(Message::Binary(b.into()));
                            }
                            {
                                let g = hub.lock().await;
                                if let Some(room_state) = g.docs.get(&rk) {
                                    if let Some(snap) = room_state.doc.export_snapshot() {
                                        let du = ProtocolMessage::DocUpdate {
                                            crdt,
                                            room_id: room_id.clone(),
                                            updates: vec![snap],
                                            batch_id: next_batch_id(),
                                        };
                                        if let Ok(b) = protocol::encode(&du) {
                                            let _ = tx.send(Message::Binary(b.into()));
                                        }
                                    }
                                }
                            }
                        }
                        ProtocolMessage::DocUpdate {
                            crdt,
                            room_id,
                            updates,
                            ..
                        } => {
                            let rk = RoomKey {
                                crdt,
                                room: room_id.clone(),
                            };
                            {
                                let mut g = hub.lock().await;
                                let joined = g
                                    .subs
                                    .get(&rk)
                                    .map(|list| list.iter().any(|(id, _)| *id == conn_id))
                                    .unwrap_or(false);
                                if !joined {
                                    let ack = ProtocolMessage::Ack {
                                        crdt,
                                        room_id: room_id.clone(),
                                        ref_id: protocol::BatchId([0; 8]),
                                        status: UpdateStatusCode::PermissionDenied,
                                    };
                                    if let Ok(b) = protocol::encode(&ack) {
                                        let _ = tx.send(Message::Binary(b.into()));
                                    }
                                    continue;
                                }
                                if !g.docs.contains_key(&rk) {
                                    g.docs.insert(
                                        rk.clone(),
                                        RoomDocState {
                                            doc: Box::new(LoroRoomDoc {
                                                doc: LoroDoc::new(),
                                            }),
                                        },
                                    );
                                }
                                let subs_clone: Option<Vec<(u64, Sender)>> =
                                    g.subs.get(&rk).cloned();
                                let on_save_clone: Option<OnSaveFn> =
                                    g.config.on_save_document.clone();
                                let snapshot_opt: Option<Vec<u8>>;
                                if let Some(room_state) = g.docs.get_mut(&rk) {
                                    let _ = room_state.doc.apply_updates(&updates);
                                    snapshot_opt = if room_state.doc.should_persist() {
                                        room_state.doc.export_snapshot()
                                    } else {
                                        None
                                    };
                                } else {
                                    snapshot_opt = None;
                                }
                                drop(g);
                                if let Some(list) = subs_clone {
                                    for (id, tx2) in list.iter() {
                                        if *id == conn_id {
                                            continue;
                                        }
                                        let _ =
                                            tx2.send(Message::Binary(inbound_bytes.clone().into()));
                                    }
                                }
                                if let (Some(on_save), Some(snap)) = (on_save_clone, snapshot_opt) {
                                    let saved_cb = on_save.clone();
                                    let w = workspace.clone();
                                    let r = room_id.clone();
                                    let cr = crdt;
                                    tokio::spawn(async move {
                                        let _ = (saved_cb)(w, r, cr, snap).await;
                                    });
                                }
                            }
                        }
                        _ => {}
                    }
                }
            }
            Message::Close(frame) => {
                let _ = tx.send(Message::Close(frame.clone()));
                break;
            }
            Message::Ping(p) => {
                let _ = tx.send(Message::Pong(p.clone()));
                let _ = tx.send(Message::Text("pong".into()));
            }
            _ => {}
        }
    }

    {
        let mut g = hub.lock().await;
        g.remove_connection(&conn_id);
    }
    if let Some(on_disconnect) = &registry.config.on_peer_disconnect {
        (on_disconnect)(conn_id);
    }
    drop(tx);
    let _ = sink_task.await;
    Ok(())
}

pub fn parse_docupdate_payload(buf: &[u8]) -> Result<Vec<Vec<u8>>, String> {
    use protocol::bytes::BytesReader;
    let mut r = BytesReader::new(buf);
    let n = usize::try_from(r.read_uleb128().map_err(|e| e.to_string())?)
        .map_err(|_| "length too large".to_string())?;
    let mut out: Vec<Vec<u8>> = Vec::with_capacity(n);
    for _ in 0..n {
        let b = r.read_var_bytes().map_err(|e| e.to_string())?.to_vec();
        out.push(b);
    }
    if r.remaining() != 0 {
        return Err("trailing bytes".into());
    }
    Ok(out)
}
