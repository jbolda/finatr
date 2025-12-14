use futures_util::SinkExt;
use loro_protocol::{encode as proto_encode, CrdtType, ProtocolMessage};
use once_cell::sync::Lazy;
use serial_test::serial;
use std::sync::Arc;
use std::time::Duration;
use sync_server::lws_wrapper::ServerConfig as LwsServerConfig;
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
async fn test_on_peer_connect_disconnect_hooks() {
    let _ = tracing_subscriber::fmt::try_init();
    let _guard = TEST_MUTEX.lock().unwrap();
    // Prepare capture vars
    let called_connect = Arc::new(TokioMutex::new(false));
    let called_disconnect = Arc::new(TokioMutex::new(false));
    let cc_clone = called_connect.clone();
    let cd_clone = called_disconnect.clone();

    // Build cfg with peer hooks
    let mut cfg = LwsServerConfig::default();
    cfg.on_peer_connect = Some(Arc::new(move |_id: u64| {
        let cc = cc_clone.clone();
        let _ = tokio::spawn(async move {
            let mut g = cc.lock().await;
            *g = true;
        });
    }));
    cfg.on_peer_disconnect = Some(Arc::new(move |_id: u64| {
        let cd = cd_clone.clone();
        let _ = tokio::spawn(async move {
            let mut g = cd.lock().await;
            *g = true;
        });
    }));

    // Bind port
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
    let (mut ws, _) = connect_async(ws_url.clone()).await.expect("connect ws");
    join_room(&mut ws, "test-room").await;

    // Wait a little for on_peer_connect to be invoked
    for _ in 0..40 {
        tokio::time::sleep(Duration::from_millis(20)).await;
        if *called_connect.lock().await {
            break;
        }
    }
    assert_eq!(
        *called_connect.lock().await,
        true,
        "on_peer_connect was not called"
    );

    // Close socket and check disconnect
    let _ = ws.close(None).await;
    for _ in 0..40 {
        tokio::time::sleep(Duration::from_millis(20)).await;
        if *called_disconnect.lock().await {
            break;
        }
    }
    assert_eq!(
        *called_disconnect.lock().await,
        true,
        "on_peer_disconnect was not called"
    );

    handle.abort();
}
