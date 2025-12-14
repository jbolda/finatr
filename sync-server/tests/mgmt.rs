use futures_util::{SinkExt, StreamExt};
use std::time::Duration;
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::Message;

use base64::{engine::general_purpose, Engine as _};
use loro::{ExportMode, LoroDoc};
use loro_protocol as protocol;
use once_cell::sync::Lazy;
use protocol::{encode as proto_encode, try_decode, CrdtType, ProtocolMessage};
use sync_server::spawn_server;
static TEST_MUTEX: Lazy<std::sync::Mutex<()>> = Lazy::new(|| std::sync::Mutex::new(()));

// mgmt tests: no fragmentation helpers required here

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
    ws.send(Message::binary(enc)).await.expect("send join");
}

async fn wait_for_join_ok(ws: &mut WsStream) {
    let t_deadline = Duration::from_secs(3);
    loop {
        let maybe = tokio::time::timeout(t_deadline, ws.next()).await;
        if maybe.is_err() {
            panic!("timeout waiting for join response");
        }
        if let Ok(Some(Ok(Message::Binary(b)))) = maybe {
            if let Some(proto) = try_decode(b.as_ref()) {
                match proto {
                    ProtocolMessage::JoinResponseOk { .. } => return,
                    ProtocolMessage::DocUpdate { .. } => return,
                    _ => continue,
                }
            }
        }
    }
}

struct ServerHandleGuard(tokio::task::JoinHandle<()>);
impl Drop for ServerHandleGuard {
    fn drop(&mut self) {
        self.0.abort();
    }
}

async fn wait_port_open(host: &str, port: u16, timeout_ms: u64) -> bool {
    let start = std::time::Instant::now();
    while start.elapsed().as_millis() < timeout_ms as u128 {
        if tokio::net::TcpStream::connect((host, port)).await.is_ok() {
            return true;
        }
        tokio::time::sleep(Duration::from_millis(50)).await;
    }
    false
}

#[tokio::test(flavor = "current_thread")]
async fn test_mgmt_inspect_includes_raw_peers() {
    let dur = Duration::from_secs(10);
    let fut = async {
        let _ = tracing_subscriber::fmt::try_init();
        let _guard = TEST_MUTEX.lock().unwrap();
        let listener = std::net::TcpListener::bind(("127.0.0.1", 0)).expect("bind");
        let port = listener.local_addr().unwrap().port();
        drop(listener);
        let db_path = std::env::temp_dir().join(format!("sync_server_mgmt_peers_test_{}.db", port));
        let _ = std::fs::remove_file(&db_path);
        std::env::set_var("SYNC_DB", db_path.to_string_lossy().to_string());
        std::env::set_var("SYNC_MANAGEMENT_PORT", port.to_string());
        let (_state, server_handle) = spawn_server("127.0.0.1", port).await;
        let _server_guard = ServerHandleGuard(server_handle);
        assert!(wait_port_open("127.0.0.1", port, 3000).await);

        // Connect a raw websocket (no Loro JoinRequest)
        let ws_url = format!("ws://127.0.0.1:{}/ws", port);
        let (_ws, _) = connect_async(ws_url.clone()).await.expect("connect raw ws");

        // Poll mgmt /inspect until peers exist
        let client = reqwest::Client::new();
        let mut found = false;
        for _ in 0..40 {
            tokio::time::sleep(Duration::from_millis(50)).await;
            let resp = client
                .get(&format!("http://127.0.0.1:{}/inspect", port))
                .send()
                .await
                .expect("mgmt request");
            if let Ok(v) = resp.json::<serde_json::Value>().await {
                // top-level 'peers' or workspace-level 'peers'
                if let Some(arr) = v.get("peers").and_then(|a| a.as_array()) {
                    if !arr.is_empty() {
                        found = true;
                        break;
                    }
                } else if let serde_json::Value::Object(map) = v {
                    for (_ws, info) in map.iter() {
                        if let serde_json::Value::Object(obj) = info {
                            if let Some(serde_json::Value::Array(arr)) = obj.get("peers") {
                                if !arr.is_empty() {
                                    found = true;
                                    break;
                                }
                            }
                        }
                    }
                    if found {
                        break;
                    }
                }
            }
        }
        assert!(found, "inspect did not include peers for raw connection");
    };
    if let Err(_) = tokio::time::timeout(dur, fut).await {
        panic!("test timed out");
    }
}

#[tokio::test(flavor = "current_thread")]
async fn test_mgmt_inspect_returns_snapshot() {
    let dur = Duration::from_secs(10);
    let fut = async {
        let _ = tracing_subscriber::fmt::try_init();
        let _guard = TEST_MUTEX.lock().unwrap();
        // Setup server
        let listener = std::net::TcpListener::bind(("127.0.0.1", 0)).expect("bind");
        let port = listener.local_addr().unwrap().port();
        drop(listener);
        let db_path = std::env::temp_dir().join(format!("sync_server_mgmt_test_{}.db", port));
        let _ = std::fs::remove_file(&db_path);
        std::env::set_var("SYNC_DB", db_path.to_string_lossy().to_string());
        // management runs on the same port as the main server
        std::env::set_var("SYNC_MANAGEMENT_PORT", port.to_string());
        let (state, server_handle) = spawn_server("127.0.0.1", port).await;
        let _server_guard = ServerHandleGuard(server_handle);

        assert!(wait_port_open("127.0.0.1", port, 3000).await);

        let ws_url = format!("ws://127.0.0.1:{}/ws", port);
        let (mut ws1, _) = connect_async(ws_url.clone()).await.expect("connect ws1");
        let (mut ws2, _) = connect_async(ws_url.clone()).await.expect("connect ws2");

        join_room(&mut ws1, "test-room").await;
        join_room(&mut ws2, "test-room").await;
        wait_for_join_ok(&mut ws1).await;
        wait_for_join_ok(&mut ws2).await;

        // create doc update and send non-fragmented DocUpdate
        let doc = LoroDoc::new();
        let text = doc.get_text("t");
        text.insert(0, "hello mgmt").unwrap();
        doc.commit();
        let update_bytes = doc
            .export(ExportMode::all_updates())
            .expect("export updates");
        let du = ProtocolMessage::DocUpdate {
            crdt: CrdtType::Loro,
            room_id: "test-room".to_string(),
            batch_id: protocol::BatchId([0; 8]),
            updates: vec![update_bytes.clone()],
        };
        let enc = proto_encode(&du).expect("encode du");
        ws1.send(Message::binary(enc)).await.expect("send du");

        // Wait for server to persist snapshot
        let mut found = false;
        for _ in 0..40 {
            tokio::time::sleep(Duration::from_millis(50)).await;
            let st = state.lock().await;
            if let Some(snap) = st.snapshot.as_ref() {
                let ds = LoroDoc::new();
                let _ = ds.import(snap.as_slice());
                ds.commit();
                if ds.get_text("t").to_string() == "hello mgmt" {
                    found = true;
                    break;
                }
            }
        }
        assert!(
            found,
            "server snapshot did not reflect update via DOCUPDATE"
        );

        // Hit mgmt /inspect and find base64 encoded snapshot
        // mgmt_port selected during spawn_server start (via SYNC_MANAGEMENT_PORT env var)
        let client = reqwest::Client::new();
        let resp = client
            .get(&format!("http://127.0.0.1:{}/inspect", port))
            .send()
            .await
            .expect("mgmt inspect request");
        let v: serde_json::Value = resp.json().await.expect("json");
        // find any workspace that has rooms.test-room
        let mut got_room_snap = false;
        if let serde_json::Value::Object(map) = v {
            for (_ws, info) in map.iter() {
                if let serde_json::Value::Object(obj) = info {
                    if let Some(rooms) = obj.get("rooms") {
                        if let serde_json::Value::Object(room_map) = rooms {
                            if let Some(serde_json::Value::String(b64)) = room_map.get("test-room")
                            {
                                let decoded = general_purpose::STANDARD
                                    .decode(b64)
                                    .expect("decode base64");
                                let ds = LoroDoc::new();
                                let _ = ds.import(&decoded);
                                ds.commit();
                                if ds.get_text("t").to_string() == "hello mgmt" {
                                    got_room_snap = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        assert!(
            got_room_snap,
            "mgmt inspect did not include test-room snapshot"
        );
    };
    if let Err(_) = tokio::time::timeout(dur, fut).await {
        panic!(
            "test_mgmt_inspect_returns_snapshot timed out after {:?}",
            dur
        );
    }
}

#[tokio::test(flavor = "current_thread")]
async fn test_mgmt_broadcast_reaches_peers() {
    let dur = Duration::from_secs(10);
    let fut = async {
        let _ = tracing_subscriber::fmt::try_init();
        let _guard = TEST_MUTEX.lock().unwrap();
        let listener = std::net::TcpListener::bind(("127.0.0.1", 0)).expect("bind");
        let port = listener.local_addr().unwrap().port();
        drop(listener);
        let db_path = std::env::temp_dir().join(format!("sync_server_mgmt_broadcast_{}.db", port));
        let _ = std::fs::remove_file(&db_path);
        std::env::set_var("SYNC_DB", db_path.to_string_lossy().to_string());
        // management runs on the same port as the main server
        std::env::set_var("SYNC_MANAGEMENT_PORT", port.to_string());
        let (_state, server_handle) = spawn_server("127.0.0.1", port).await;
        let _server_guard = ServerHandleGuard(server_handle);

        assert!(wait_port_open("127.0.0.1", port, 3000).await);

        let ws_url = format!("ws://127.0.0.1:{}/ws", port);
        let (mut ws1, _) = connect_async(ws_url.clone()).await.expect("connect ws1");
        let (mut ws2, _) = connect_async(ws_url.clone()).await.expect("connect ws2");
        join_room(&mut ws1, "test-room").await;
        join_room(&mut ws2, "test-room").await;

        wait_for_join_ok(&mut ws1).await;
        wait_for_join_ok(&mut ws2).await;

        let client = reqwest::Client::new();
        let _ = client
            .post(&format!("http://127.0.0.1:{}/broadcast", port))
            .json(&serde_json::json!({"msg":"hello mgmt broadcast"}))
            .send()
            .await
            .expect("broadcast request");

        // ws1 and ws2 should receive Message::Text("hello mgmt broadcast")
        let mut got1 = false;
        let mut got2 = false;
        for _ in 0..40 {
            let m1 = tokio::time::timeout(Duration::from_millis(50), ws1.next()).await;
            if let Ok(Some(Ok(Message::Text(t1)))) = m1 {
                if t1 == "hello mgmt broadcast" {
                    got1 = true;
                }
            }
            let m2 = tokio::time::timeout(Duration::from_millis(50), ws2.next()).await;
            if let Ok(Some(Ok(Message::Text(t2)))) = m2 {
                if t2 == "hello mgmt broadcast" {
                    got2 = true;
                }
            }
            if got1 && got2 {
                break;
            }
        }
        assert!(got1 && got2, "broadcast did not reach both peers");
    };
    if let Err(_) = tokio::time::timeout(dur, fut).await {
        panic!(
            "test_mgmt_broadcast_reaches_peers timed out after {:?}",
            dur
        );
    }
}
