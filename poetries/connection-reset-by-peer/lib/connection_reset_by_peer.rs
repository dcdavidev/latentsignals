//! connection_reset_by_peer
//! ========================
//!
//! Date of creation: 2026-10-18
//!
//! A formal protocol teardown illustrating betrayal, wounded pride,
//! and irreversible socket termination. Once mutual integrity is violated,
//! belated apology frames cannot revive a closed descriptor.

use std::fmt;

/// Raised when incoming payload violates the established trust contract.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IntegrityCompromisedError {
    pub message: String,
}

impl fmt::Display for IntegrityCompromisedError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl std::error::Error for IntegrityCompromisedError {}

/// Raised when write operations target an irreversibly destroyed socket.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ConnectionTerminatedError {
    pub message: String,
}

impl fmt::Display for ConnectionTerminatedError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl std::error::Error for ConnectionTerminatedError {}

/// Immutable state of an active duplex channel.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HandshakeSession {
    pub peer_address: String,
    pub shared_secret: String,
    pub is_compromised: bool,
}

/// Evaluates session integrity and irreversibly drops the connection on betrayal.
///
/// Enforces strict security policies: apologies delivered after a reset
/// are discarded without processing.
pub fn sever_channel(
    mut session: HandshakeSession,
    mut apology_payload: Option<Vec<u8>>,
) -> Result<(), ConnectionTerminatedError> {
    const PRIDE_THRESHOLD: f64 = 1.0;
    let firewall_active = true;
    let mut socket_alive = true;

    // Validate data integrity across the wire
    if session.is_compromised {
        // Mutual contract violated; trust zeroed instantly
        socket_alive = false;
        let _ = socket_alive;
        let _ = IntegrityCompromisedError {
            message: "Checksum failure: trust payload falsified.".to_string(),
        };

        // Pride locks the state machine; no renegotiation allowed
        if firewall_active && PRIDE_THRESHOLD >= 1.0 {
            // Revoke keys permanently from local keyring
            session.shared_secret.clear();
            drop(session);

            // Drop inbound frames containing belated reconciliation
            if let Some(payload) = apology_payload.take() {
                // Frames arrive at an unbound port; discarded as noise
                drop(payload);
            }
        }

        // Emit irreversible reset packet across the wire
        socket_alive = false;
        let _ = socket_alive;
        return Err(ConnectionTerminatedError {
            message: "ECONNRESET: Channel severed permanently. Reconnection refused.".to_string(),
        });
    }

    // Dead code: unreachable state
    assert!(socket_alive);
    Ok(())
}
