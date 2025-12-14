use futures_util::{SinkExt, StreamExt};
use loro::{ExportMode, LoroDoc};
use loro_protocol as protocol;
use once_cell::sync::Lazy;
use protocol::{encode as proto_encode, try_decode, CrdtType, ProtocolMessage};
use serial_test::serial;
use std::time::Duration;
use sync_server::spawn_server;
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::Message;

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

#[tokio::test(flavor = "current_thread")]
#[serial]
async fn test_two_clients_sync_loro_update() {
    let _ = tracing_subscriber::fmt::try_init();
    let _guard = TEST_MUTEX.lock().unwrap();
    let listener = std::net::TcpListener::bind(("127.0.0.1", 0)).expect("bind");
    let port = listener.local_addr().unwrap().port();
    drop(listener);
    let db_path = std::env::temp_dir().join(format!("sync_server_loro_sync_{}.db", port));
    let _ = std::fs::remove_file(&db_path);
    std::env::set_var("SYNC_DB", db_path.to_string_lossy().to_string());

    let (_state, server_handle) = spawn_server("127.0.0.1", port).await;
    let _guard_handle = server_handle;

    let ws_url = format!("ws://127.0.0.1:{}/ws", port);
    let (mut ws1, _) = connect_async(ws_url.clone()).await.expect("connect ws1");
    let (mut ws2, _) = connect_async(ws_url.clone()).await.expect("connect ws2");

    join_room(&mut ws1, "room1").await;
    join_room(&mut ws2, "room1").await;
    wait_for_join_ok(&mut ws1).await;
    wait_for_join_ok(&mut ws2).await;

    // client 1 updates doc
    let doc = LoroDoc::new();
    let text = doc.get_text("t");
    text.insert(0, "hello sync").unwrap();
    doc.commit();
    let update_bytes = doc
        .export(ExportMode::all_updates())
        .expect("export updates");

    let du = ProtocolMessage::DocUpdate {
        crdt: CrdtType::Loro,
        room_id: "room1".to_string(),
        batch_id: protocol::BatchId([0; 8]),
        updates: vec![update_bytes.clone()],
    };
    let enc = proto_encode(&du).expect("encode du");
    ws1.send(Message::binary(enc)).await.expect("send du");

    // ws2 should receive the DocUpdate containing the updates
    let mut got_update = false;
    for _ in 0..80 {
        let res = tokio::time::timeout(Duration::from_millis(50), ws2.next()).await;
        if let Ok(Some(Ok(Message::Binary(b)))) = res {
            if let Some(proto) = try_decode(b.as_ref()) {
                if let ProtocolMessage::DocUpdate { updates, .. } = proto {
                    if !updates.is_empty() {
                        // apply update to doc2 and check text
                        let doc2 = LoroDoc::new();
                        let _ = doc2.import(&updates[0]);
                        doc2.commit();
                        if doc2.get_text("t").to_string() == "hello sync" {
                            got_update = true;
                            break;
                        }
                    }
                }
            }
        }
    }
    assert!(got_update, "other client did not receive doc update");
}
