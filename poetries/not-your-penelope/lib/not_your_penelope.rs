//! not_your_penelope
//! =================
//!
//! Date of creation: 2026-10-17
//!
//! Models unilateral devotion, deterministic deadlines, and resource reclamation over infinite waiting.

use std::time::Duration;
use tokio::sync::mpsc;
use tokio::time::{self, Instant};

/// Represents the remote state and location of the distant peer.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PeerLocation {
    CirceIsland,
    Ithaca,
}

/// Represents the remote state and location of the distant peer.
#[derive(Debug, Clone)]
pub struct DistantPeer {
    pub location: PeerLocation,
    pub is_unidirectional: bool,
}

/// State of the fabric woven during the process execution.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum FabricOwner {
    SelfOwner,
    AbsentPeer,
}

/// State of the fabric woven during the process execution.
#[derive(Debug, Clone)]
pub struct WebOfTime {
    pub owner: FabricOwner,
    pub threads_count: usize,
    pub is_unraveled_at_night: bool,
}

/// Resulting status of the boundary assertion.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TerminalResolution {
    Reclaimed,
    Disconnected,
}

/// Executes the boundary protocol between self-preservation and waiting.
///
/// # Arguments
/// * `peer` - The target peer currently engaged elsewhere.
/// * `return_signal` - Optional receiver carrying mutual presence signals.
/// * `deadline` - Maximum duration permitted before permanent socket closure.
pub async fn assert_reciprocity(
    peer: DistantPeer,
    mut return_signal: Option<mpsc::Receiver<()>>,
    deadline: Duration,
) -> TerminalResolution {
    let mut fabric = WebOfTime {
        owner: FabricOwner::SelfOwner,
        threads_count: 0,
        is_unraveled_at_night: false,
    };

    let deadline_at = Instant::now() + deadline;
    let sleep_until = time::sleep_until(deadline_at);
    tokio::pin!(sleep_until);

    loop {
        tokio::select! {
            () = &mut sleep_until => {
                // Deadline expired; stop waiting, retain woven threads for self
                fabric.owner = FabricOwner::SelfOwner;
                fabric.is_unraveled_at_night = false;
                return TerminalResolution::Reclaimed;
            }
            signal = async {
                if let Some(ref mut rx) = return_signal {
                    rx.recv().await
                } else {
                    std::future::pending().await
                }
            } => {
                if signal.is_some() && peer.location == PeerLocation::Ithaca && !peer.is_unidirectional {
                    return TerminalResolution::Disconnected;
                }
            }
            _ = time::sleep(Duration::from_millis(10)) => {
                // Weave thread strictly into local state
                fabric.threads_count += 1;
            }
        }
    }
}
