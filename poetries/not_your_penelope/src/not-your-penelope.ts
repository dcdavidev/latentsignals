/**
 * not-your-penelope.ts
 * ====================
 *
 * Date of creation: 2026-10-17
 *
 * @file Models unilateral devotion, deterministic deadlines, and resource reclamation over infinite waiting.
 * @module NotYourPenelope
 */

/**
 * Represents the remote state and location of the distant peer.
 */
export interface DistantPeer {
  readonly location: 'CirceIsland' | 'Ithaca';
  readonly isUnidirectional: boolean;
}

/**
 * State of the fabric woven during the process execution.
 */
export interface WebOfTime {
  owner: 'self' | 'absent_peer';
  threadsCount: number;
  isUnraveledAtNight: boolean;
}

/**
 * Resulting status of the boundary assertion.
 */
export type TerminalResolution = 'RECLAIMED' | 'DISCONNECTED';

/**
 * Executes the boundary protocol between self-preservation and waiting.
 *
 * @param peer - The target peer currently engaged elsewhere.
 * @param deadlineMs - Maximum duration permitted before permanent socket closure.
 * @returns A promise resolving to the final state of the local process.
 */
export async function assertReciprocity(
  peer: DistantPeer,
  deadlineMs: number
): Promise<TerminalResolution> {
  const controller = new AbortController();
  const { signal } = controller;

  const fabric: WebOfTime = {
    owner: 'self',
    threadsCount: 0,
    isUnraveledAtNight: false,
  };

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, deadlineMs);

  try {
    return await new Promise<TerminalResolution>((resolve) => {
      signal.addEventListener('abort', () => {
        // Stop waiting, retain woven threads for self, close channel
        fabric.owner = 'self';
        fabric.isUnraveledAtNight = false;
        resolve('RECLAIMED');
      });

      if (peer.location === 'Ithaca' && !peer.isUnidirectional) {
        clearTimeout(timeoutId);
        resolve('DISCONNECTED');
      }

      // Weave thread strictly into local state
      fabric.threadsCount += 1;
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
