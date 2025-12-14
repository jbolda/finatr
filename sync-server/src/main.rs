//! Minimal CLI to run the Loro WebSocket server with SQLite persistence
//!
//! Usage:
//!   cargo run -p loro-websocket-server --example simple-server -- [--host 127.0.0.1] [--port 9000] [--db loro.db]
//!   cargo run -p loro-websocket-server --example simple-server -- --addr 0.0.0.0:9000 --db state.db
//!
//! Notes:
//! - Uses a single-thread Tokio runtime to match crate features.
//! - Defaults to 127.0.0.1:9000 and ./loro.db if not specified.

use clap::Parser;
use std::{error::Error, path::PathBuf};
use tracing::info;
use tracing_subscriber::EnvFilter;

use sync_server::{init_db, start_server};

#[derive(Parser, Debug)]
#[command(
    name = "simple-server",
    about = "Loro WebSocket server with SQLite persistence"
)]
struct Args {
    #[arg(short = 'a', long, value_name = "ADDR", conflicts_with_all = ["host", "port"], help = "Full socket address to bind, e.g. 0.0.0.0:9000")]
    addr: Option<String>,

    #[arg(
        short = 'H',
        long,
        default_value = "127.0.0.1",
        help = "Host to bind when --addr not provided"
    )]
    host: String,

    #[arg(
        short = 'p',
        long,
        default_value_t = 9000,
        help = "Port to bind when --addr not provided"
    )]
    port: u16,

    #[arg(
        short = 'd',
        long = "db",
        value_name = "PATH",
        default_value = "loro.db",
        help = "SQLite database path"
    )]
    db: PathBuf,
}

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn Error + Send + Sync>> {
    // Init tracing
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));
    tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_target(true)
        .compact()
        .init();

    let args = Args::parse();
    let addr = args
        .addr
        .unwrap_or_else(|| format!("{}:{}", args.host, args.port));
    let db_path = args.db;

    // Set env var used by the start_server helper
    std::env::set_var("SYNC_DB", db_path.to_string_lossy().to_string());
    init_db(&db_path).await?;

    info!(%addr, db=%db_path.display().to_string(), "starting loro-websocket-server with management endpoints");
    info!("Press Ctrl-C to stop.");

    // parse addr (host:port) into host+port pair
    let mut parts = addr.split(':');
    let host = parts.next().unwrap_or("127.0.0.1");
    let port: u16 = parts.next().unwrap_or("9000").parse().unwrap_or(9000);
    start_server(host, port).await;
    Ok(())
}
