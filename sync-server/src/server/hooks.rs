use std::{future::Future, pin::Pin, sync::Arc};

use loro_protocol::{CrdtType, Permission};
use tokio_tungstenite::tungstenite;

/// Snapshot payload returned by `on_load_document` with optional context.
pub struct LoadedDoc<DocCtx> {
    pub snapshot: Option<Vec<u8>>,
    pub ctx: Option<DocCtx>,
}

/// Arguments provided to `on_load_document`.
pub struct LoadDocArgs {
    pub workspace: String,
    pub room: String,
    pub crdt: CrdtType,
}

/// Arguments provided to `on_save_document`.
pub struct SaveDocArgs<DocCtx> {
    pub workspace: String,
    pub room: String,
    pub crdt: CrdtType,
    pub data: Vec<u8>,
    pub ctx: Option<DocCtx>,
}

type LoadFuture<DocCtx> =
    Pin<Box<dyn Future<Output = Result<LoadedDoc<DocCtx>, String>> + Send + 'static>>;
type SaveFuture = Pin<Box<dyn Future<Output = Result<(), String>> + Send + 'static>>;
pub(crate) type LoadFn<DocCtx> = Arc<dyn Fn(LoadDocArgs) -> LoadFuture<DocCtx> + Send + Sync>;
pub(crate) type SaveFn<DocCtx> = Arc<dyn Fn(SaveDocArgs<DocCtx>) -> SaveFuture + Send + Sync>;

/// Arguments provided to `authenticate`.
pub struct AuthArgs {
    pub room: String,
    pub crdt: CrdtType,
    pub auth: Vec<u8>,
    pub conn_id: u64,
}

type AuthFuture =
    Pin<Box<dyn Future<Output = Result<Option<Permission>, String>> + Send + 'static>>;
pub(crate) type AuthFn = Arc<dyn Fn(AuthArgs) -> AuthFuture + Send + Sync>;

/// Arguments provided to `handshake_auth`.
pub struct HandshakeAuthArgs<'a> {
    pub workspace: &'a str,
    pub token: Option<&'a str>,
    pub request: &'a tungstenite::handshake::server::Request,
    pub conn_id: u64,
}

pub(crate) type HandshakeAuthFn = dyn Fn(HandshakeAuthArgs) -> bool + Send + Sync;

/// Arguments provided to `on_close_connection`.
pub struct CloseConnectionArgs {
    pub workspace: String,
    pub conn_id: u64,
    pub rooms: Vec<(CrdtType, String)>,
}

type CloseConnectionFuture = Pin<Box<dyn Future<Output = Result<(), String>> + Send + 'static>>;
pub(crate) type CloseConnectionFn =
    Arc<dyn Fn(CloseConnectionArgs) -> CloseConnectionFuture + Send + Sync>;

#[derive(Clone)]
pub struct ServerConfig<DocCtx = ()> {
    pub on_load_document: Option<LoadFn<DocCtx>>,
    pub on_save_document: Option<SaveFn<DocCtx>>,
    pub save_interval_ms: Option<u64>,
    pub default_permission: Permission,
    pub authenticate: Option<AuthFn>,
    /// Optional handshake auth called during WS upgrade.
    pub handshake_auth: Option<Arc<HandshakeAuthFn>>,
    /// Optional hook invoked after a connection fully closes.
    pub on_close_connection: Option<CloseConnectionFn>,
}

impl<DocCtx> Default for ServerConfig<DocCtx> {
    fn default() -> Self {
        Self {
            on_load_document: None,
            on_save_document: None,
            save_interval_ms: None,
            default_permission: Permission::Write,
            authenticate: None,
            handshake_auth: None,
            on_close_connection: None,
        }
    }
}
