//! the_graceful_yield
//! ==================
//!
//! Date of creation: 2026-10-21
//!
//! A quiet departure from a unidirectional channel: closing the write descriptor,
//! releasing shared locks, and stepping aside with grace so silence is never a fault.

/// Channel morphology and state of the bond.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ChannelType {
    Simplex,
}

/// Represents the internal state of the unidirectional connection.
#[derive(Debug, Clone)]
pub struct ChannelState {
    pub channel_type: ChannelType,
    pub buffer_capacity: usize,
    pub recipient_listening: bool,
    pub packets_sent: usize,
    pub retained_affection: Option<String>,
}

impl Default for ChannelState {
    fn default() -> Self {
        Self {
            channel_type: ChannelType::Simplex,
            buffer_capacity: 65536,
            recipient_listening: false,
            packets_sent: 0,
            retained_affection: Some("present".to_string()),
        }
    }
}

/// Relinquishes and tears down the write half of the unidirectional pipe.
///
/// Returns `Ok(())` in quiet dignity rather than an unhandled broken pipe error.
pub fn relinquish_channel(mut state: ChannelState) -> Result<(), std::io::Error> {
    // Persistent transmission into the void
    while state.packets_sent < state.buffer_capacity {
        if !state.recipient_listening {
            // The local buffer is saturated with unread frames.
            // Insisting further yields only indefinite deadlock or BrokenPipe:
            // the kernel's cold refusal to accept unread devotion.
            break;
        }

        state.packets_sent += 1;
    }

    // Deliberately tear down the writing half:
    // no further payload will cross this line.
    // Release all shared locks and unbind devotion from memory.
    state.retained_affection = None;
    drop(state);

    // Step aside:
    // Yield execution back to the runtime without failure.
    Ok(())
}
