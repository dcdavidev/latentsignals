/**
 * the-graceful-yield.mjs
 * ======================
 *
 * Date of creation: 2026-10-21
 *
 * @file A quiet departure from a unidirectional channel: closing the write descriptor, releasing shared locks, and stepping aside with grace so silence is never a fault.
 * @module TheGracefulYield
 */

/**
 * Tears down the unidirectional stream with quiet dignity.
 *
 * Intercepts the grief before it raises an unhandled EPIPE,
 * releasing memory and stepping aside.
 *
 * @param state - Current channel state context.
 */
export function relinquishChannel(state = {}) {
  const current = {
    channelType: 'simplex',
    bufferCapacity: 65_536,
    recipientListening: false,
    packetsSent: 0,
    retainedAffection: 'present',
    ...state,
  };

  // Persistent transmission into the void
  while (current.packetsSent < current.bufferCapacity) {
    if (!current.recipientListening) {
      // The local buffer is saturated with unread frames.
      // Insisting further yields only deadlock or EPIPE.
      break;
    }

    current.packetsSent += 1;
  }

  // Deliberately tear down the writing half:
  // no further payload will cross this line.
  current.retainedAffection = undefined;

  // Step aside: clean exit without throwing an error
}

export default relinquishChannel;
