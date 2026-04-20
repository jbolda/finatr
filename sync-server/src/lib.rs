//! Lightweight WebSocket server used for development and testing.
//!
//! This crate implements a local fork of the Loro websocket server for
//! programmatic spawning and a management HTTP API intended for local dev
//! and integration testing. It exposes a few helpers used by tests and
//! the example CLI JavaScript binaries:
//!
//! - `start_server(bind, port)` — starts the WebSocket + management server on the given host and port.
//! - `spawn_server(bind, port)` — spawns a server in-process and returns shared `ServerState` and a join handle; used by tests.
//!
//! Environment variables referenced by the helper implementations:
//! - `SYNC_DB` — path to the SQLite DB for persistent snapshots (defaults to `loro.db`).
//!
use std::path::PathBuf;
use std::sync::Arc;

pub use loro_protocol as protocol;
pub mod server;
use crate::server::{
    serve_with_http, LoadDocArgs, LoadedDoc, SaveDocArgs, ServerConfig as LwsServerConfig,
};
use protocol::CrdtType;
use tokio::sync::Mutex;

pub struct ServerState {
    pub snapshot: Option<Vec<u8>>,
}

impl Default for ServerState {
    fn default() -> Self {
        Self { snapshot: None }
    }
}

use std::future::Future;
use std::pin::Pin;

type LocalLoadFuture =
    Pin<Box<dyn Future<Output = Result<LoadedDoc<()>, String>> + Send + 'static>>;
type LocalSaveFuture = Pin<Box<dyn Future<Output = Result<(), String>> + Send + 'static>>;

/// Start the WebSocket Loro server and management endpoints.
///
/// - `bind` accepts an IP or hostname string (e.g. 127.0.0.1)
/// - `port` specifies a TCP port to listen on.
///
/// The function reads `SYNC_DB` for a relative/absolute sqlite path to persist snapshots
/// (default `loro.db` when not set) and wires up `on_load_document` / `on_save_document`
/// hooks so the snapshot persistence works in tests and local runs.
pub async fn start_server(bind: &str, port: u16) {
    let state = Arc::new(Mutex::new(ServerState::default()));

    let db_path = PathBuf::from(std::env::var("SYNC_DB").unwrap_or("loro.db".to_string()));
    if let Err(e) = init_db(&db_path).await {
        tracing::warn!(%e, "init_db failed");
    }

    let db_for_load = db_path.clone();
    let db_for_save = db_path.clone();
    let state_for_load = state.clone();
    let state_for_save = state.clone();

    let on_load = std::sync::Arc::new(
        move |args: LoadDocArgs| {
            let p = db_for_load.clone();
            let state = state_for_load.clone();
            let fut: LocalLoadFuture = Box::pin(async move {
                match load_snapshot(&p, &args.workspace, &args.room, args.crdt).await {
                    Ok(Some(snap)) => {
                        let mut st = state.lock().await;
                        st.snapshot = Some(snap.clone());
                        Ok(LoadedDoc { snapshot: Some(snap), ctx: None })
                    }
                    Ok(None) => Ok(LoadedDoc { snapshot: None, ctx: None }),
                    Err(e) => Err(e),
                }
            });
            fut
        },
    );

    let on_save = std::sync::Arc::new(
        move |args: SaveDocArgs<()>| {
            let p = db_for_save.clone();
            let state = state_for_save.clone();
            let fut: LocalSaveFuture = Box::pin(async move {
                let res = save_snapshot(&p, &args.workspace, &args.room, args.crdt, &args.data).await;
                let mut st = state.lock().await;
                st.snapshot = Some(args.data.clone());
                res
            });
            fut
        },
    );

    let cfg = LwsServerConfig {
        on_load_document: Some(on_load),
        on_save_document: Some(on_save),
        save_interval_ms: Some(1_000),
        ..LwsServerConfig::default()
    };

    // `cfg` already contains on_load/on_save set above when built. Pass it through directly.
    let _ = serve_with_http(bind, port, cfg)
        .await
        .expect("failed to start loro websocket+http server");
    tracing::info!("Started LWS server and management on {}:{}", bind, port);
    // Block the current task so the CLI process doesn't exit immediately.
    // The spawn_server helper returns a pending join handle for tests; for the
    // CLI we block the main thread forever so the server keeps running until the
    // user presses Ctrl-C.
    futures::future::pending::<()>().await;
}

/// Spawn the server in-process for tests.
///
/// Returns a tuple of the shared `ServerState` and a join handle for the background task.
/// The returned `ServerState` exposes a `snapshot` field that tests can inspect to observe
/// the last snapshot persisted by `on_save_document`.
pub async fn spawn_server(
    bind: &str,
    port: u16,
) -> (Arc<Mutex<ServerState>>, tokio::task::JoinHandle<()>) {
    let state = Arc::new(Mutex::new(ServerState::default()));

    let db_path = PathBuf::from(std::env::var("SYNC_DB").unwrap_or("loro.db".to_string()));
    if let Err(e) = init_db(&db_path).await {
        tracing::warn!(%e, "init_db failed");
    }

    let db_for_load = db_path.clone();
    let db_for_save = db_path.clone();
    let state_for_load = state.clone();
    let state_for_save = state.clone();

    let on_load = std::sync::Arc::new(
        move |args: LoadDocArgs| {
            let p = db_for_load.clone();
            let state = state_for_load.clone();
            let fut: LocalLoadFuture = Box::pin(async move {
                match load_snapshot(&p, &args.workspace, &args.room, args.crdt).await {
                    Ok(Some(snap)) => {
                        let mut st = state.lock().await;
                        st.snapshot = Some(snap.clone());
                        Ok(LoadedDoc { snapshot: Some(snap), ctx: None })
                    }
                    Ok(None) => Ok(LoadedDoc { snapshot: None, ctx: None }),
                    Err(e) => Err(e),
                }
            });
            fut
        },
    );
    let on_save = std::sync::Arc::new(
        move |args: SaveDocArgs<()>| {
            let p = db_for_save.clone();
            let state = state_for_save.clone();
            let fut: LocalSaveFuture = Box::pin(async move {
                let res = save_snapshot(&p, &args.workspace, &args.room, args.crdt, &args.data).await;
                let mut st = state.lock().await;
                st.snapshot = Some(args.data.clone());
                res
            });
            fut
        },
    );

    let cfg = LwsServerConfig {
        on_load_document: Some(on_load),
        on_save_document: Some(on_save),
        save_interval_ms: Some(1_000),
        ..LwsServerConfig::default()
    };

    let _server_handle = serve_with_http(bind, port, cfg)
        .await
        .expect("failed to start loro websocket+http server");
    let join_handle = tokio::spawn(async move {
        futures::future::pending::<()>().await;
    });
    (state, join_handle)
}

/// Spawn a server with a provided `ServerConfig` used mostly in tests to inject
/// custom auth or peer hooks. Returns the same tuple as `spawn_server`.
pub async fn spawn_server_with_config(
    bind: &str,
    port: u16,
    mut cfg: LwsServerConfig,
) -> (Arc<Mutex<ServerState>>, tokio::task::JoinHandle<()>) {
    let state = Arc::new(Mutex::new(ServerState::default()));

    let db_path = PathBuf::from(std::env::var("SYNC_DB").unwrap_or("loro.db".to_string()));
    if let Err(e) = init_db(&db_path).await {
        tracing::warn!(%e, "init_db failed");
    }

    let db_for_load = db_path.clone();
    let db_for_save = db_path.clone();
    let state_for_load = state.clone();
    let state_for_save = state.clone();

    let on_load = std::sync::Arc::new(
        move |args: LoadDocArgs| {
            let p = db_for_load.clone();
            let state = state_for_load.clone();
            let fut: LocalLoadFuture = Box::pin(async move {
                match load_snapshot(&p, &args.workspace, &args.room, args.crdt).await {
                    Ok(Some(snap)) => {
                        let mut st = state.lock().await;
                        st.snapshot = Some(snap.clone());
                        Ok(LoadedDoc { snapshot: Some(snap), ctx: None })
                    }
                    Ok(None) => Ok(LoadedDoc { snapshot: None, ctx: None }),
                    Err(e) => Err(e),
                }
            });
            fut
        },
    );
    let on_save = std::sync::Arc::new(
        move |args: SaveDocArgs<()>| {
            let p = db_for_save.clone();
            let state = state_for_save.clone();
            let fut: LocalSaveFuture = Box::pin(async move {
                let res = save_snapshot(&p, &args.workspace, &args.room, args.crdt, &args.data).await;
                let mut st = state.lock().await;
                st.snapshot = Some(args.data.clone());
                res
            });
            fut
        },
    );

    // Use provided cfg, but ensure on_load_document and on_save_document are set.
    if cfg.on_load_document.is_none() {
        cfg.on_load_document = Some(on_load.clone());
    }
    if cfg.on_save_document.is_none() {
        cfg.on_save_document = Some(on_save.clone());
    }

    let _server_handle = serve_with_http(bind, port, cfg)
        .await
        .expect("failed to start loro websocket+http server");
    let join_handle = tokio::spawn(async move {
        futures::future::pending::<()>().await;
    });
    (state, join_handle)
}

/// Initialize the SQLite persistence DB for snapshot storage.
pub async fn init_db(path: &PathBuf) -> Result<(), String> {
    let p = path.to_path_buf();
    tokio::task::spawn_blocking(move || -> Result<(), String> {
        let conn = rusqlite::Connection::open(p).map_err(|e| e.to_string())?;
        conn.execute_batch(
            r#"
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            CREATE TABLE IF NOT EXISTS documents (
                workspace TEXT NOT NULL,
                crdt TEXT NOT NULL,
                room TEXT NOT NULL,
                data BLOB NOT NULL,
                updated_at INTEGER NOT NULL,
                PRIMARY KEY (workspace, crdt, room)
            );
            "#,
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    })
    .await
    .map_err(|e| e.to_string())?
}

fn crdt_to_str(crdt: CrdtType) -> &'static str {
    match crdt {
        CrdtType::Loro => "loro",
        CrdtType::LoroEphemeralStore => "loro_ephemeral",
        CrdtType::LoroEphemeralStorePersisted => "loro_ephemeral_persisted",
        CrdtType::Yjs => "yjs",
        CrdtType::YjsAwareness => "yjs_awareness",
        CrdtType::Elo => "elo",
    }
}

pub async fn load_snapshot(
    path: &PathBuf,
    workspace: &str,
    room: &str,
    crdt: CrdtType,
) -> Result<Option<Vec<u8>>, String> {
    let p = path.to_path_buf();
    let workspace = workspace.to_string();
    let room = room.to_string();
    let crdt = crdt_to_str(crdt).to_string();
    tokio::task::spawn_blocking(move || -> Result<Option<Vec<u8>>, String> {
        let conn = rusqlite::Connection::open(p).map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare("SELECT data FROM documents WHERE workspace=?1 AND crdt=?2 AND room=?3")
            .map_err(|e| e.to_string())?;
        let mut rows = stmt
            .query(rusqlite::params![workspace, crdt, room])
            .map_err(|e| e.to_string())?;
        if let Some(row) = rows.next().map_err(|e| e.to_string())? {
            let data: Vec<u8> = row.get(0).map_err(|e| e.to_string())?;
            Ok(Some(data))
        } else {
            Ok(None)
        }
    })
    .await
    .map_err(|e| e.to_string())?
}

fn chrono_like_now_ms() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    let dur = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_else(|_| std::time::Duration::from_secs(0));
    dur.as_millis() as i64
}

pub async fn save_snapshot(
    path: &PathBuf,
    workspace: &str,
    room: &str,
    crdt: CrdtType,
    data: &[u8],
) -> Result<(), String> {
    let p = path.to_path_buf();
    let workspace = workspace.to_string();
    let room = room.to_string();
    let crdt = crdt_to_str(crdt).to_string();
    let data_vec = data.to_vec();
    tokio::task::spawn_blocking(move || -> Result<(), String> {
        let conn = rusqlite::Connection::open(p).map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT INTO documents (workspace, crdt, room, data, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)
                  ON CONFLICT(workspace, crdt, room) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at",
            rusqlite::params![workspace, crdt, room, data_vec, chrono_like_now_ms()],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    })
    .await
    .map_err(|e| e.to_string())?
}
