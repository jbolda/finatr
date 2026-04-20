//! Integrated sync server implementation.
//!
//! `core` contains protocol/server runtime behavior (kept close to upstream).
//! `hooks` contains public hook/config types used by embedders.

mod core;
mod hooks;

pub use core::{serve, serve_incoming, serve_incoming_with_config, serve_with_http, ServerHandle};
pub use hooks::{
    AuthArgs, CloseConnectionArgs, HandshakeAuthArgs, LoadDocArgs, LoadedDoc, SaveDocArgs,
    ServerConfig,
};
