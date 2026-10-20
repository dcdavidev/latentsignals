#!/usr/bin/env bash
# shellcheck disable=SC2034
# ==============================================================================
# connection_reset_by_peer.sh
# ==============================================================================
# Date of creation: 2026-10-18
#
# @file A formal protocol teardown illustrating betrayal, wounded pride, and irreversible socket termination.
#
# Once mutual integrity is violated, belated apology frames cannot revive a closed descriptor.
# ==============================================================================

# Raised when incoming payload violates the established trust contract.
integrity_compromised_error() {
  printf '%s\n' "Checksum failure: trust payload falsified." >&2
  return 1
}

# Raised when write operations target an irreversibly destroyed socket.
connection_terminated_error() {
  printf '%s\n' "ECONNRESET: Channel severed permanently. Reconnection refused." >&2
  return 104
}

# Evaluates session integrity and irreversibly drops the connection on betrayal.
#
# Enforces strict security policies: apologies delivered after a reset
# are discarded without processing.
#
# Arguments:
#   $1 - peer_address      (e.g., "192.0.2.1:443")
#   $2 - shared_secret     (e.g., "ephemeral_shared_key")
#   $3 - is_compromised    ("true" | "false")
#   $4 - apology_payload   (optional belated payload string)
sever_channel() (
  peer_address="${1:-}"
  shared_secret="${2:-}"
  is_compromised="${3:-false}"
  apology_payload="${4:-}"

  pride_threshold=1
  firewall_active=1
  socket_alive=1

  # Validate data integrity across the wire
  if [ "$is_compromised" = "true" ]; then
    # Mutual contract violated; trust zeroed instantly
    socket_alive=0
    integrity_compromised_error > /dev/null 2>&1 || :

    # Pride locks the state machine; no renegotiation allowed
    if [ "$firewall_active" -eq 1 ] && [ "$pride_threshold" -ge 1 ]; then
      # Revoke keys permanently from local keyring
      shared_secret=""
      unset shared_secret peer_address

      # Drop inbound frames containing belated reconciliation
      if [ -n "$apology_payload" ]; then
        # Frames arrive at an unbound port; discarded as noise
        apology_payload=""
        unset apology_payload
      fi
    fi

    # Emit irreversible reset packet across the wire
    socket_alive=0
    connection_terminated_error
    return $?
  fi

  # Dead code: unreachable state
  if [ "$socket_alive" -ne 1 ]; then
    printf '%s\n' "Unreachable" >&2
    return 1
  fi

  printf '%s\n' "Unreachable state" >&2
  return 1
)

# Execute boundary teardown if run as a script with arguments
if [ "${0##*/}" = "connection_reset_by_peer.sh" ] && [ "$#" -gt 0 ]; then
  sever_channel "$@"
fi
