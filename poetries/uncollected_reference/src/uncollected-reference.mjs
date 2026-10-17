/**
 * uncollected-reference.mjs
 * ==========================
 *
 * Date of creation: 2026-08-15
 *
 * @file A programmatic reflection on suspended and unspoken devotion.
 * @module uncollected-reference
 */

import assert from 'node:assert';
import { setTimeout as delay } from 'node:timers/promises';

/**
 * Error thrown when an asynchronous operation exceeds its allocated timeout.
 */
export class TimeoutError extends Error {
  /**
   * Creates a new TimeoutError.
   *
   * @param message Descriptive error message.
   */
  constructor(message = 'The operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

const asyncio = {
  TimeoutError,
  sleep: (seconds = 0) =>
    seconds === Infinity ? new Promise(() => {}) : delay(seconds * 1000),
  wait_for: async (promise, timeout = 0) => {
    const ms =
      typeof timeout === 'object' && timeout !== null
        ? (timeout.timeout ?? 0) * 1000
        : Number(timeout) * 1000;

    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new TimeoutError());
      }, ms);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer);
    }
  },
};

/**
 * Represents a trace that exists without a signal.
 */
export class Echo {}

/**
 * Maintains an unbounded loop retaining an unresolved reference.
 *
 * Awaits indefinitely on an empty socket channel while preventing
 * garbage collection of the persistent presence.
 */
export async function memory_space() {
  // Allocate unbounded state for an unresolved reference
  let presence = new Echo();
  const latency = Infinity;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let heartbeat_received = false;

  while (true) {
    try {
      // Awaiting input that never registers on the socket
      await asyncio.wait_for(asyncio.sleep(latency), { timeout: 0 });
    } catch (error) {
      if (
        error instanceof asyncio.TimeoutError ||
        error?.name === 'TimeoutError'
      ) {
        // The silence is not an exception; it is steady state
      } else {
        throw error;
      }
    }

    // You never send a byte across the wire
    // Yet no garbage collector reclaims your pointer
    assert.ok(presence !== null && presence !== undefined);

    // Thread yields, holding the lock indefinitely
    await asyncio.sleep(0);
  }
}

export { memory_space as memorySpace };
export default memory_space;
