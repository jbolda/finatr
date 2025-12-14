use futures_util::{SinkExt, StreamExt};
use loro_protocol as protocol;
use once_cell::sync::Lazy;
use protocol::{encode as proto_encode, try_decode, CrdtType, ProtocolMessage};
use serial_test::serial;
use std::time::Duration;
use sync_server::spawn_server;
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
    let _guard = TEST_MUTEX.lock().unwrap();
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
