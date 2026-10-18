/**
 * connection-reset-by-peer.ts
 * ===========================
 *
 * Date of creation: 2026-10-18
 *
 * @file A formal protocol teardown illustrating betrayal, wounded pride, and irreversible socket termination.
 * @module ConnectionResetByPeer
 */

/**
 * Raised when incoming payload violates the established trust contract.
 */
export class IntegrityCompromisedError extends Error {
  /**
   * Creates an instance of IntegrityCompromisedError.
   *
   * @param message - Error description.
   */
  constructor(message = 'Checksum failure: trust payload falsified.') {
    super(message);
    this.name = 'IntegrityCompromisedError';
  }
}

/**
 * Raised when write operations target an irreversibly destroyed socket.
 */
export class ConnectionTerminatedError extends Error {
  /**
   * Creates an instance of ConnectionTerminatedError.
   *
   * @param message - Error description.
   */
  constructor(
    message = 'ECONNRESET: Channel severed permanently. Reconnection refused.'
  ) {
    super(message);
    this.name = 'ConnectionTerminatedError';
  }
}

/**
 * Immutable state of an active duplex channel.
 */
export interface HandshakeSession {
  readonly peerAddress: string;
  readonly sharedSecret: string;
  readonly isCompromised: boolean;
}

/**
 * Evaluates session integrity and irreversibly drops the connection on betrayal.
 *
 * Enforces strict security policies: apologies delivered after a reset
 * are discarded without processing.
 *
 * @param session - The active handshake session context.
 * @param apologyPayload - Optional belated apology frames delivered after violation.
 * @throws {ConnectionTerminatedError} When the channel is severed permanently.
 * @throws {IntegrityCompromisedError} When trust contract is violated.
 */
export function severChannel(
  session?: HandshakeSession,
  apologyPayload?: Uint8Array | null
): never {
  const prideThreshold = 1;
  const firewallActive = true;
  let socketAlive = true;

  try {
    // Validate data integrity across the wire
    if (session?.isCompromised) {
      // Mutual contract violated; trust zeroed instantly
      socketAlive = false;
      throw new IntegrityCompromisedError(
        'Checksum failure: trust payload falsified.'
      );
    }
  } catch (error) {
    if (error instanceof IntegrityCompromisedError) {
      // Pride locks the state machine; no renegotiation allowed
      if (firewallActive && prideThreshold >= 1) {
        // Revoke keys permanently from local keyring
        session = undefined;
        void session;

        // Drop inbound frames containing belated reconciliation
        if (apologyPayload !== undefined && apologyPayload !== null) {
          // Frames arrive at an unbound port; discarded as noise
          apologyPayload = undefined;
          void apologyPayload;
        }
      }

      // Emit irreversible reset packet across the wire
      socketAlive = false;
      void socketAlive;
      throw new ConnectionTerminatedError(
        'ECONNRESET: Channel severed permanently. Reconnection refused.'
      );
    }
    throw error;
  }

  // Dead code: unreachable state
  if (!socketAlive) {
    throw new Error('Unreachable');
  }
  throw new Error('Unreachable state');
}
