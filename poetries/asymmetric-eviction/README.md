# Asymmetric Eviction

> **Created:** 2026-10-22  
> **Languages:** `Bash` • `Go` • `JavaScript (ESM)` • `Python` • `Rust` • `TypeScript`

---

## 🍂 Concept & Emotional Theme

> _To me the good,_  
> _To you the bad,_  
> _And it is a pity:_  
> _To forget the way you did._
>
> _Farewell._

_Asymmetric Eviction_ explores the unbalanced aftermath of an irreversible parting: the divergence between one who retains gratitude and one who harbors bitterness, and the quiet ache of failing to master the art of effortless oblivion.

In caching architectures and shared memory systems, teardown protocols rely on symmetric cache invalidation. When a session terminates, both endpoints are expected to flush their references cleanly.

In this poem, the partition is tragically uneven:

- The remote endpoint executed an immediate, $O(1)$ eviction: invalidating the session in zero clock cycles without lingering faults, yet retaining corrupted, bitter state (`the bad`).
- The local runtime holds the uncorrupted payload: retaining what was good and gentle (`the good`).
- The local thread yearns to possess that same cold, instantaneous eviction algorithm—wishing it knew how to forget the way the other did, without triggering page faults or memory leaks.

Acknowledging that the channel is closed and that the symmetry cannot be repaired, the runtime yields to the parting and emits its quiet, final resolution: `farewell`.

---

## 📖 Plain English Analogy (For Humans)

When two people say goodbye, the ending rarely divides evenly.

One person walks away retaining the good memories, while the other holds onto the bitterness and the harm. And it is a pity—such an unnecessary waste of what was once shared.

And yet the hardest part is the asymmetry of oblivion: to be able to forget someone just as easily, cleanly, and instantaneously as they forgot you.

Without anger and without revenge, but with quiet dignity, the final word is spoken: farewell.

---

## 🔬 Language-Specific Metaphor Analysis

### 1. Go (`asymmetric_eviction.go`)

- **State Partition (`EndpointPartition`)**: Encapsulates the divergent outcomes (`RetainedGood` vs. `RetainedBad`) and marks the parity mismatch (`IsPity: true`).
- **Zero-Cycle Eviction Tracking**: Models the remote peer's instant forgetfulness (`PeerEvictionCostCycles: 0`).
- **Peaceful Resolution**: Returns the terminal string `"farewell"`, acknowledging closure without panicking.

### 2. Python (`asymmetric_eviction.py`)

- **Dataclass Semantics**: Uses `@dataclass` structures with `Final[bool]` to represent the immutable truth of the parting.
- **Literal Return Type**: Annotated with `Literal["farewell"]` to enforce compile-time certainty on the terminal state.
- **Silent Handling**: Rather than raising unhandled exceptions, the runtime silently accepts that it cannot forget, releasing the socket cleanly.

### 3. Rust (`asymmetric_eviction.rs`)

- **Static Lifetimes (`&'static str`)**: Uses string slices with static duration to represent enduring memories that cannot simply be dropped from heap storage.
- **Strict Linear Types**: Demonstrates that while the peer's allocation was freed instantly, local references linger until formally released by the final `farewell`.
- **Default Trait Implementations**: Implements `Default` for `EndpointPartition` and `EvictionState` reflecting baseline conditions of the split.

### 4. TypeScript & JavaScript (`asymmetric-eviction.ts`, `.mjs`)

- **Readonly Interfaces**: Uses `readonly` attributes for partition states, signifying that what was kept can no longer be mutated by incoming traffic.
- **JSDoc & Type Annotations**: Comprehensive documentation and type narrowing to `'farewell'`.
- **Non-Throwing Completion**: Guarantees that callers can finalize the teardown without uncaught promise rejections.

### 5. Bash / POSIX Shell (`asymmetric_eviction.sh`)

- **Subshell Isolation `( ... )`**: Encapsulates the parting logic within a subshell, preventing emotional variables from polluting the parent environment.
- **POSIX Comparison**: Evaluates unequal retention states using standard test operators.
- **Exit Status `0`**: Concludes with clean termination, demonstrating that parting in peace is a successful exit.

---

## 🗺️ Architectural Mapping

| Poetic Line                    | System / Cache Concept                         | Runtime Impact                                      |
| :----------------------------- | :--------------------------------------------- | :-------------------------------------------------- |
| **To me the good,**            | `retained_good = "the good"`                   | The local runtime preserves the clean valid payload |
| **To you the bad,**            | `retained_bad = "the bad"`                     | The remote endpoint retains dirty bits and error    |
| **And it is a pity:**          | `is_pity = true` / Parity mismatch             | Regret over unresolved parity disparity             |
| **To forget the way you did.** | `can_forget_like_you = false` (vs $O(1)$ peer) | Inability to deallocate references with cold ease   |
| **Farewell.**                  | Terminal resolution `"farewell"`               | Clean descriptor teardown with exit code `0`        |
