use futures_util::{SinkExt, StreamExt};
use loro_protocol as protocol;
use once_cell::sync::Lazy;
use protocol::{encode as proto_encode, try_decode, CrdtType, ProtocolMessage};
use serial_test::serial;
use std::sync::Arc;
use std::time::Duration;
use sync_server::server::ServerConfig as LwsServerConfig;
use sync_server::spawn_server;
use sync_server::spawn_server_with_config;
use tokio_tungstenite::connect_async;

static TEST_MUTEX: Lazy<std::sync::Mutex<()>> = Lazy::new(|| std::sync::Mutex::new(()));

type WsStream =
    tokio_tungstenite::WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>;

async fn join_room(ws: &mut WsStream, room: &str) {
    let join = ProtocolMessage::JoinRequest {
        crdt: CrdtType::Loro,
        room_id: room.to_string(),
        auth: Vec::new(),
        version: Vec::new(),
    };
    let enc = proto_encode(&join).expect("encode join");
    ws.send(tokio_tungstenite::tungstenite::Message::binary(enc))
        .await
        .expect("send join");
}

#[tokio::test(flavor = "current_thread")]
#[serial]
async fn test_workspace_in_inspect_response() {
    let _ = tracing_subscriber::fmt::try_init();
    let _guard = TEST_MUTEX.lock().unwrap_or_else(|e| e.into_inner());
    let listener = std::net::TcpListener::bind(("127.0.0.1", 0)).expect("bind");
    let port = listener.local_addr().unwrap().port();
    drop(listener);
    let db_path = std::env::temp_dir().join(format!("sync_server_handshake_{}.db", port));
    let _ = std::fs::remove_file(&db_path);
    std::env::set_var("SYNC_DB", db_path.to_string_lossy().to_string());

    let (_state, server_handle) = spawn_server("127.0.0.1", port).await;
    let _guard_handle = server_handle;

    // Connect to path workspace 'special-ws': '/ws/special-ws'
    let ws_url = format!("ws://127.0.0.1:{}/ws/special-ws", port);
    let (mut ws, _) = connect_async(ws_url.clone()).await.expect("connect ws");
    join_room(&mut ws, "room-a").await;

    // Wait for join OK / doc update
    let mut saw_ok = false;
    for _ in 0..40 {
        let res = tokio::time::timeout(Duration::from_millis(50), ws.next()).await;
        if let Ok(Some(Ok(tokio_tungstenite::tungstenite::Message::Binary(b)))) = res {
            if let Some(proto) = try_decode(b.as_ref()) {
                if let ProtocolMessage::JoinResponseOk { .. } = proto {
                    saw_ok = true;
                    break;
                }
            }
        }
    }
    assert!(saw_ok, "did not receive join response ok");

    // Query the mgmt inspect endpoint
    let client = reqwest::Client::new();
    let resp = client
        .get(&format!("http://127.0.0.1:{}/inspect", port))
        .send()
        .await
        .expect("mgmt inspect request");
    let v: serde_json::Value = resp.json().await.expect("json");
    // Check workspace 'special-ws' exists
    let mut found_ws = false;
    if let serde_json::Value::Object(map) = v {
        for (ws_name, _info) in map.iter() {
            if ws_name == "special-ws" {
                found_ws = true;
                break;
            }
        }
    }
    assert!(found_ws, "inspect did not include workspace 'special-ws'");
}

#[tokio::test(flavor = "current_thread")]
#[serial]
async fn test_handshake_auth_rejects_unauthorized_ws_upgrade() {
    let _ = tracing_subscriber::fmt::try_init();
    let _guard = TEST_MUTEX.lock().unwrap_or_else(|e| e.into_inner());

    let listener = std::net::TcpListener::bind(("127.0.0.1", 0)).expect("bind");
    let port = listener.local_addr().unwrap().port();
    drop(listener);
    let db_path = std::env::temp_dir().join(format!("sync_server_handshake_auth_{}.db", port));
    let _ = std::fs::remove_file(&db_path);
    std::env::set_var("SYNC_DB", db_path.to_string_lossy().to_string());

    let mut cfg = LwsServerConfig::default();
    cfg.handshake_auth = Some(Arc::new(|args| {
        args.token.map(|v| v == "ok").unwrap_or(false)
    }));

    let (_state, server_handle) = spawn_server_with_config("127.0.0.1", port, cfg).await;
    let _guard_handle = server_handle;

    let err = connect_async(format!("ws://127.0.0.1:{}/ws?token=nope", port))
        .await
        .expect_err("expected unauthorized handshake");
    match err {
        tokio_tungstenite::tungstenite::Error::Http(resp) => {
            assert_eq!(resp.status().as_u16(), 401);
        }
        other => panic!("expected HTTP error with status 401, got {other:?}"),
    }
}

#[tokio::test(flavor = "current_thread")]
#[serial]
async fn test_join_response_version_matches_and_snapshot_skipped_when_up_to_date() {
    let _ = tracing_subscriber::fmt::try_init();
    let _guard = TEST_MUTEX.lock().unwrap_or_else(|e| e.into_inner());

    let listener = std::net::TcpListener::bind(("127.0.0.1", 0)).expect("bind");
    let port = listener.local_addr().unwrap().port();
    drop(listener);
    let db_path = std::env::temp_dir().join(format!("sync_server_join_version_{}.db", port));
    let _ = std::fs::remove_file(&db_path);
    std::env::set_var("SYNC_DB", db_path.to_string_lossy().to_string());

    let (_state, server_handle) = spawn_server("127.0.0.1", port).await;
    let _guard_handle = server_handle;

    let ws_url = format!("ws://127.0.0.1:{}/ws", port);

    // First connection joins with empty version and should receive current version.
    let (mut ws1, _) = connect_async(ws_url.clone()).await.expect("connect ws1");
    join_room(&mut ws1, "room-version").await;

    let mut server_version: Option<Vec<u8>> = None;
    for _ in 0..40 {
        let res = tokio::time::timeout(Duration::from_millis(100), ws1.next()).await;
        if let Ok(Some(Ok(tokio_tungstenite::tungstenite::Message::Binary(b)))) = res {
            if let Some(proto) = try_decode(b.as_ref()) {
                if let ProtocolMessage::JoinResponseOk { version, .. } = proto {
                    server_version = Some(version);
                    break;
                }
            }
        }
    }
    let server_version = server_version.expect("missing JoinResponseOk.version");
    assert!(!server_version.is_empty(), "server version should not be empty");

    // Second connection joins with current version and should not receive a snapshot DocUpdate.
    let (mut ws2, _) = connect_async(ws_url.clone()).await.expect("connect ws2");
    let join = ProtocolMessage::JoinRequest {
        crdt: CrdtType::Loro,
        room_id: "room-version".to_string(),
        auth: Vec::new(),
        version: server_version.clone(),
    };
    let enc = proto_encode(&join).expect("encode join with version");
    ws2.send(tokio_tungstenite::tungstenite::Message::binary(enc))
        .await
        .expect("send join with version");

    let mut got_join_ok = false;
    let mut got_snapshot_update = false;
    for _ in 0..40 {
        let res = tokio::time::timeout(Duration::from_millis(100), ws2.next()).await;
        if let Ok(Some(Ok(tokio_tungstenite::tungstenite::Message::Binary(b)))) = res {
            if let Some(proto) = try_decode(b.as_ref()) {
                match proto {
                    ProtocolMessage::JoinResponseOk { version, .. } => {
                        got_join_ok = true;
                        assert_eq!(version, server_version);
                    }
                    ProtocolMessage::DocUpdate { .. } => {
                        got_snapshot_update = true;
                    }
                    _ => {}
                }
            }
        }
        if got_join_ok {
            break;
        }
    }

    assert!(got_join_ok, "did not receive JoinResponseOk on second join");
    assert!(
        !got_snapshot_update,
        "unexpected snapshot DocUpdate when client version is up-to-date"
    );
}
