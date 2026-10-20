//! latentsignals
//! ============
//!
//! Root crate exposing all poetry modules located in `poetries/**/*`.

#![allow(unused_variables, unused_assignments)]

#[path = "poetries/connection-reset-by-peer/connection_reset_by_peer.rs"]
pub mod connection_reset_by_peer;

#[path = "poetries/not-your-penelope/not_your_penelope.rs"]
pub mod not_your_penelope;

#[path = "poetries/uncollected-reference/uncollected_reference.rs"]
pub mod uncollected_reference;
