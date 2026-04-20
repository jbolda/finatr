use futures_util::SinkExt;
use loro_protocol::{encode as proto_encode, CrdtType, ProtocolMessage};
use once_cell::sync::Lazy;
use serial_test::serial;
use std::sync::Arc;
use std::time::Duration;
use sync_server::server::ServerConfig as LwsServerConfig;
use sync_server::spawn_server_with_config;
use tokio::sync::Mutex as TokioMutex;
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::Message;

static TEST_MUTEX: Lazy<std::sync::Mutex<()>> = Lazy::new(|| std::sync::Mutex::new(()));

async fn join_room(
    ws: &mut tokio_tungstenite::WebSocketStream<
        tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>,
    >,
    room: &str,
) {
    let join = ProtocolMessage::JoinRequest {
        crdt: CrdtType::Loro,
        room_id: room.to_string(),
        auth: Vec::new(),
        version: Vec::new(),
    };
    let enc = proto_encode(&join).expect("encode join");
    ws.send(Message::binary(enc)).await.expect("send join");
}

#[tokio::test(flavor = "current_thread")]
#[serial]
async fn test_on_close_connection_hook_invoked() {
    let _ = tracing_subscriber::fmt::try_init();
    let _guard = TEST_MUTEX.lock().unwrap();
    let called_close = Arc::new(TokioMutex::new(false));
    let close_clone = called_close.clone();

    let mut cfg = LwsServerConfig::default();
    cfg.on_close_connection = Some(Arc::new(move |_args| {
        let close_clone = close_clone.clone();
        Box::pin(async move {
            *close_clone.lock().await = true;
            Ok(())
        })
    }));

    let listener = std::net::TcpListener::bind(("127.0.0.1", 0)).expect("bind");
    let port = listener.local_addr().unwrap().port();
    drop(listener);
    let db_path = std::env::temp_dir().join(format!("sync_server_auth_peer_hooks_{}.db", port));
    let _ = std::fs::remove_file(&db_path);
    std::env::set_var("SYNC_DB", db_path.to_string_lossy().to_string());

    let (_state, handle) = spawn_server_with_config("127.0.0.1", port, cfg).await;
    // wait port open
    let start = std::time::Instant::now();
    while start.elapsed() < Duration::from_secs(3) {
        if tokio::net::TcpStream::connect(("127.0.0.1", port))
            .await
            .is_ok()
        {
            break;
        }
        tokio::time::sleep(Duration::from_millis(50)).await;
    }

    let ws_url = format!("ws://127.0.0.1:{}/ws", port);
    let (mut ws, _) = connect_async(ws_url).await.expect("connect ws");
    join_room(&mut ws, "test-room").await;
    let _ = ws.close(None).await;

    for _ in 0..40 {
        tokio::time::sleep(Duration::from_millis(20)).await;
        if *called_close.lock().await {
            break;
        }
    }
    assert_eq!(
        *called_close.lock().await,
        true,
        "on_close_connection was not called"
    );

    handle.abort();
}

#[tokio::test(flavor = "current_thread")]
#[serial]
async fn test_on_close_connection_receives_workspace_and_joined_rooms() {
    let _ = tracing_subscriber::fmt::try_init();
    let _guard = TEST_MUTEX.lock().unwrap();

    let captured_workspace = Arc::new(TokioMutex::new(String::new()));
    let captured_conn_id = Arc::new(TokioMutex::new(0u64));
    let captured_rooms = Arc::new(TokioMutex::new(Vec::<(CrdtType, String)>::new()));

    let ws_cap = captured_workspace.clone();
    let id_cap = captured_conn_id.clone();
    let rooms_cap = captured_rooms.clone();

    let mut cfg = LwsServerConfig::default();
    cfg.on_close_connection = Some(Arc::new(move |args| {
        let ws_cap = ws_cap.clone();
        let id_cap = id_cap.clone();
        let rooms_cap = rooms_cap.clone();
        Box::pin(async move {
            *ws_cap.lock().await = args.workspace;
            *id_cap.lock().await = args.conn_id;
            *rooms_cap.lock().await = args.rooms;
            Ok(())
        })
    }));

    let listener = std::net::TcpListener::bind(("127.0.0.1", 0)).expect("bind");
    let port = listener.local_addr().unwrap().port();
    drop(listener);
    let db_path = std::env::temp_dir().join(format!("sync_server_close_hook_{}.db", port));
    let _ = std::fs::remove_file(&db_path);
    std::env::set_var("SYNC_DB", db_path.to_string_lossy().to_string());

    let (_state, handle) = spawn_server_with_config("127.0.0.1", port, cfg).await;

    let ws_url = format!("ws://127.0.0.1:{}/ws/workspace-x", port);
    let (mut ws, _) = connect_async(ws_url).await.expect("connect ws");
    join_room(&mut ws, "room-close").await;

    // Allow join to be processed.
    tokio::time::sleep(Duration::from_millis(100)).await;
    let _ = ws.close(None).await;

    for _ in 0..50 {
        tokio::time::sleep(Duration::from_millis(20)).await;
        if *captured_conn_id.lock().await != 0 {
            break;
        }
    }

    assert_eq!(&*captured_workspace.lock().await, "workspace-x");
    assert_ne!(*captured_conn_id.lock().await, 0);
    let rooms = captured_rooms.lock().await;
    assert!(
        rooms
            .iter()
            .any(|(crdt, room)| *crdt == CrdtType::Loro && room == "room-close"),
        "expected on_close_connection payload to include joined room"
    );

    handle.abort();
}
