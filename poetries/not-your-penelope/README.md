# Not Your Penelope

> **Created:** 2026-10-17  
> **Languages:** `Bash` • `Go` • `JavaScript (ESM)` • `Python` • `Rust` • `TypeScript`

---

## 🧶 Concept & Emotional Theme

_Not Your Penelope_ is an assertive meditation on unilateral devotion, deterministic deadlines, and resource reclamation over infinite waiting.

In Homer's _Odyssey_, Queen Penelope stalls her aggressive suitors for over twenty years while awaiting Odysseus's return from the Trojan War and the sorceress Circe's island. By day she weaves a burial shroud; by night, she undoes the day's work by candlelight so the tapestry is never completed.

This poem rewrites the myth for autonomous systems: the local runtime sets a strict timeout (`deadline`). If the remote peer lingers indefinitely on Circe's island and offers only unidirectional devotion, Penelope refuses to unravel her work. Upon deadline expiration, she claims the woven threads for herself, closes the socket, and returns `RECLAIMED`.

---

## 📖 Plain English Analogy (For Humans)

Imagine someone who has been waiting endlessly for an emotionally absent partner. The absent partner is off living their own adventure, only sending an occasional, vague message that asks for more patience.

For a long time, the waiting person puts their life on hold: every day they build dreams, start projects, and weave hopes, only to dismantle them each evening so they remain ready and unattached whenever their partner might decide to come home.

Finally, they draw a line in the sand: _"You have until the end of this month. If you are not home by then, I am not unraveling my life anymore. The career I built, the art I made, the peace I cultivated—I am keeping all of it for myself. I am not Penelope, and my life is not a waiting room."_

When the deadline strikes, they pack away the longing, keep their creations, and step out into the world.

---

## 🔬 Language-Specific Metaphor Analysis

### 1. Go (`not_your_penelope.go`)

- **`context.WithTimeout`**: The foundation of modern Go concurrency. Replaces infinite waiting with deterministic lifecycle control.
- **`select` Multiplexing**: Symmetrically checks `ctxWithDeadline.Done()` against incoming signals on `returnSignal`. The moment the timer fires, the default branch stops weaving and returns `ResolutionReclaimed`.
- **State Struct (`WebOfTime`)**: Explicitly updates `Owner = "self"` and `IsUnraveledAtNight = false`, turning what was an act of sacrificial delay into lasting local equity.

### 2. Python (`not_your_penelope.py`)

- **`asyncio` Event Loop**: Computes precise floating-point deadlines (`end_time = loop.time() + deadline_seconds`) without stalling thread execution.
- **Non-Blocking Sleep**: Uses `await asyncio.sleep(min(0.01, max(0.0, remaining)))` to weave threads in tight micro-steps while continually testing the boundary condition.
- **`TerminalResolution` Enum**: Uses Python's `Enum` to constrain possible outcomes strictly to `RECLAIMED` or `DISCONNECTED`.

### 3. Rust (`not_your_penelope.rs`)

- **Tokio `select!` Macro**: Coordinates asynchronous futures concurrently. It pins the `sleep_until` timer to memory using `tokio::pin!`, guaranteeing zero allocation overhead.
- **Channel Receivers (`mpsc::Receiver<()>`)**: Represents the elusive presence packet. If the channel is disconnected or unidirectional, the future falls through to deadline expiration.
- **Enforced Ownership**: The fabric (`WebOfTime`) is mutated locally and retained by value rather than yielded to an absent caller.

### 4. TypeScript & JavaScript (`not-your-penelope.ts`, `.mjs`)

- **Modern Web Standards (`AbortController` & `AbortSignal`)**: Uses the canonical browser/Node.js primitive for cancellations. The timer triggers `controller.abort()`.
- **Signal Event Listeners**: Penelope listens for the `'abort'` event not as a catastrophe, but as the scheduled trigger to resolve her promise with `'RECLAIMED'`.
- **Clean Asynchronous Control**: A Promise-based architecture demonstrating that waiting must always have an explicit resolution path.

### 5. Bash / POSIX Shell (`not_your_penelope.sh`)

- **Portable Epoch Arithmetic**: Calculates deterministic deadlines using POSIX integer math `$(( (deadline_ms + 999) / 1000 ))` and `date +%s`.
- **Subshell Encapsulation**: Guarantees that internal state variables (`fabric_owner`, `fabric_threads_count`) remain encapsulated and never leak into the parent environment.
- **Standard Resolution Output**: Emits the final state directly to standard output before exiting cleanly with status code `0`.

---

## 🗺️ Architectural Mapping

| Mythological & Emotional Element | Distributed Systems Primitive                            |
| :------------------------------- | :------------------------------------------------------- |
| **Penelope (The Waiting One)**   | Local client process managing local state                |
| **Odysseus (Circe's Island)**    | Remote peer unresponsive / stuck on one-way link         |
| **The Shroud (Daily Weaving)**   | CPU cycles, worker threads, and memory allocations       |
| **Unraveling by Night**          | Voluntary rollback of progress / endless deferral        |
| **The Deadline**                 | `context.WithTimeout` / `AbortSignal` / `deadline_ms`    |
| **`RECLAIMED`**                  | Resource retention, socket termination, self-sovereignty |

---

## 📂 Source Files

- [`not_your_penelope.go`](not_your_penelope.go)
- [`not_your_penelope.py`](not_your_penelope.py)
- [`not_your_penelope.rs`](not_your_penelope.rs)
- [`not-your-penelope.ts`](not-your-penelope.ts)
- [`not-your-penelope.mjs`](not-your-penelope.mjs)
- [`not_your_penelope.sh`](not_your_penelope.sh)
