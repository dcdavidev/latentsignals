#!/usr/bin/env bash
# shellcheck disable=SC2034
# ==============================================================================
# the-graceful-yields.sh
# ==============================================================================
# Date of creation: 2026-10-21
#
# @file A quiet departure from a unidirectional channel: closing the write descriptor,
# releasing shared locks, and stepping aside with grace so silence is never a fault.
# ==============================================================================

# Channel morphology and state of the bond
CHANNEL_TYPE="simplex"      # Unidirectional by design
BUFFER_CAPACITY=65536       # PIPE_BUF: how much one holds before suffocating
RECIPIENT_LISTENING="false" # No peer ever opened the reading end

# Relinquishment and quiet withdrawal from the wait loop
relinquish_channel() (
  unrequited_packets_sent=0
  waiting_for_ack=1
  retained_affection="present"

  # Persistent transmission into the void
  while [ "$unrequited_packets_sent" -lt "$BUFFER_CAPACITY" ]; do
    if [ "$RECIPIENT_LISTENING" = "false" ]; then
      # The local buffer is saturated with unread frames.
      # Insisting further yields only indefinite deadlock or SIGPIPE:
      # the kernel's cold refusal to accept unread devotion.
      break
    fi

    unrequited_packets_sent=$((unrequited_packets_sent + 1))
  done

  # Intercept the grief before it becomes a fatal panic:
  # we ignore the broken pipe signal; there will be no unhandled exception.
  trap '' PIPE

  # Deliberately tear down the writing file descriptor (FD 3):
  # no further payload will cross this line.
  exec 3>&- 2> /dev/null || :

  # Release all shared locks and allocated memory:
  # lingering in your address space is no longer our place.
  unset retained_affection
  unset promises
  unset unspoken_words

  # Step aside:
  # Yield execution back to the operating system's scheduler.
  # We do not exit with a failure code (1), but in quiet dignity (0):
  # because loving and choosing to let go is never a syntax error.
  return 0
)

# Execute boundary relinquishment if executed directly
if [ "${0##*/}" = "the-graceful-yields.sh" ] || [ "${0##*/}" = "the-graceful-yield.sh" ]; then
  relinquish_channel
  exit $?
fi
