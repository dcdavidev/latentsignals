# Connection Reset by Peer

> **Created:** 2026-10-18  
> **Languages:** `Bash` • `Go` • `JavaScript (ESM)` • `Python` • `Rust` • `TypeScript`

---

## 🥀 Concept & Emotional Theme

_Connection Reset by Peer_ explores the formal protocol of sudden betrayal, wounded self-respect, and irreversible termination across a duplex channel.

In networking, an `ECONNRESET` indicates that the remote side abruptly severed an existing connection without a polite four-way handshake. In this poem, the dynamic is reversed: upon discovering that incoming traffic violates the fundamental trust contract (checksum falsification), the local system refuses renegotiation. It locks its firewall, purges keys, throws away belated apology packets as unbound noise, and deliberately terminates the socket with exit code `104`.

---

## 📖 Plain English Analogy (For Humans)

Imagine two people who spent years building a shared, encrypted telephone line between their homes. They had their own private cipher, their own mutual secrets, and an ironclad agreement of honesty.

One afternoon, one person discovers that the other has been transmitting counterfeit messages, violating the core promise of their bond.

There is no screaming match and no prolonged debate. The wounded person immediately unplugs the cable, physically cuts the copper wire, burns the cipher notebook, and unbinds the telephone number. When the other person subsequently slips handwritten apology letters under the front door, no one is waiting on the other side. The letters fall onto an empty entryway and are swept straight into the incinerator without being opened. The connection has not merely gone quiet—it has been permanently wiped from existence.

---

## 🔬 Language-Specific Metaphor Analysis

### 1. Go (`connection_reset_by_peer.go`)

- **Typed Error Contracts**: Defines custom error types (`IntegrityCompromisedError`, `ConnectionTerminatedError`) that fulfill the Go `error` interface. Betrayal is treated as a first-class failure mode.
- **Struct Zeroing**: `session = HandshakeSession{}` instantly zeroes out memory fields (`PeerAddress`, `SharedSecret`), reflecting an irreversible revocation of shared history.
- **Unreachable Assertions**: The function proves mathematically that a compromised socket cannot survive (`if !socketAlive { return errors.New("unreachable state") }`).

### 2. Python (`connection_reset_by_peer.py`)

- **Frozen Dataclass**: `HandshakeSession` is decorated with `@dataclass(frozen=True)`, signifying that mutual trust was supposed to be immutable and tamper-proof.
- **Explicit Memory Unbinding**: Uses Python's `del session` and `del apology_payload`. The names are expunged from the local scope, casting them out of memory.
- **Terminal Return Type**: Annotated with `NoReturn` to declare to static type analyzers (`mypy`) that reconciliation cannot be returned—execution halts with an unhandled exception.

### 3. Rust (`connection_reset_by_peer.rs`)

- **Ownership & RAII Drop Semantics**: Leverages Rust's strict linear type system. When betrayal occurs, `drop(session)` and `session.shared_secret.clear()` purge heap-allocated byte buffers.
- **Take Semantics**: `apology_payload.take()` moves ownership of the inbound vector out of optional storage, dropping the apology frames into non-existence without reading their bytes.
- **`Result<(), ConnectionTerminatedError>`**: Formalizes refusal to panic silently; it returns an explicit error representing catastrophic protocol breakdown.

### 4. TypeScript & JavaScript (`connection-reset-by-peer.ts`, `.mjs`)

- **Readonly Interfaces**: Attributes like `readonly peerAddress` and `readonly sharedSecret` demonstrate that the trust contract was designed to be inviolable.
- **Reference Nullification & Voiding**: Explicitly unsets `session = undefined` and `apologyPayload = undefined`, invoking `void session` to communicate to the runtime that the connection state has been deliberately discarded.
- **Error Polymorphism**: Extends standard `Error` prototypes with explicit error names for precise stack trace identification.

### 5. Bash / POSIX Shell (`connection_reset_by_peer.sh`)

- **Subshell Isolation `( ... )`**: The entire function executes inside a subshell compound command, guaranteeing that modified environment variables and temporary allocations vanish upon completion.
- **Standard Descriptor Redirection**: Discards unwanted payload frames into `/dev/null` and redirects diagnostics strictly to standard error (`>&2`).
- **Errno 104 (`ECONNRESET`)**: Exits with return code `104`, matching the Linux kernel's exact numeric definition for `ECONNRESET` in `asm-generic/errno.h`.

---

## 🗺️ Architectural Mapping

| Dimension          | Networking Primitives                           | Human / Emotional Meaning                        |
| :----------------- | :---------------------------------------------- | :----------------------------------------------- |
| **Trust Contract** | Checksum verification / cryptographic signature | Honesty, vulnerability, and mutual commitment    |
| **Violation**      | Payload forgery / frame corruption              | Betrayal, duplicity, broken promises             |
| **Reaction**       | Firewall locking / `PRIDE_THRESHOLD >= 1.0`     | Protective pride, refusal to negotiate           |
| **Belated Frames** | Packets arriving on unbound port                | Apologies offered after the bridge is burned     |
| **Result**         | `ECONNRESET` / Exit code `104`                  | Irreversible parting; the number is disconnected |
