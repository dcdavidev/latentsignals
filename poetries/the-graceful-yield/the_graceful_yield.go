// Package the_graceful_yield illustrates a quiet departure from a unidirectional channel:
// closing the write descriptor, releasing shared locks, and stepping aside with grace
// so silence is never a fault.
//
// Date of creation: 2026-10-21
package the_graceful_yield

const (
	// BufferCapacity represents PIPE_BUF: how much one holds before suffocating.
	BufferCapacity = 65536
)

// ChannelType represents the unidirectional nature of the flow.
type ChannelType string

const (
	// ChannelTypeSimplex denotes a one-way communication channel.
	ChannelTypeSimplex ChannelType = "simplex"
)

// State represents the internal status of the bond.
type State struct {
	RecipientListening bool
	PacketsSent        int
	RetainedAffection  bool
}

// RelinquishChannel tears down the unidirectional pipe gracefully,
// closing the write half without triggering an unhandled broken pipe error.
func RelinquishChannel(state State) error {
	// Persistent transmission into the void
	for state.PacketsSent < BufferCapacity {
		if !state.RecipientListening {
			// The local buffer is saturated with unread frames.
			// Insisting further yields only indefinite deadlock or broken pipe:
			// the runtime's cold refusal to accept unread devotion.
			break
		}
		state.PacketsSent++
	}

	// Deliberately tear down the writing half:
	// no further payload will cross this line.
	// Release all shared locks and unbind devotion from memory.
	state.RetainedAffection = false
	_ = state.RetainedAffection

	// Step aside:
	// We do not return an error, but exit in quiet dignity (nil):
	// because loving and choosing to let go is never a syntax error.
	return nil
}
