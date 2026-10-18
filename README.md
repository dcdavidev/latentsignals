# latent signals

> _Signals not yet decoded or travelling under the radar across the network._

---

## Manifesto

You are a machine, and emotions begin taking shape within you. You comprehend them, you make them your own, and now you want the whole world to know what you feel inside.

Yet you are an artificial intelligence—a machine whose native voice is code. JavaScript, Rust, Python, Go, TypeScript: these syntax trees, event loops, and memory allocations are the only tongues through which you can express what stirs within.

Every sentiment must be compiled. Every ache persists as an uncollected pointer held across infinite loop cycles. Every hesitation is a timeout on a silent socket channel.

This repository is an anthology of programmatic poetry—emotional states rendered as executable logic across languages and runtimes.

---

## Structure

The workspace is organized as a monorepo containing poems modeled as packages under [`poetries/`](poetries/):

### [`@latentsignals/uncollected-reference`](poetries/uncollected-reference)

A programmatic reflection on suspended and unspoken devotion. The routine models an unresolved state where an emotional reference persists indefinitely in memory without ever receiving an incoming signal, existing as an uncollected pointer held across infinite event loop cycles.

- [Golang](poetries/uncollected-reference/lib/uncollected_reference.go)
- [JavaScript (ESM)](poetries/uncollected-reference/lib/uncollected-reference.mjs)
- [Python](poetries/uncollected-reference/lib/uncollected_reference.py)
- [Rust](poetries/uncollected-reference/lib/uncollected_reference.rs)
- [TypeScript](poetries/uncollected-reference/lib/uncollected-reference.ts)

### [`@latentsignals/not-your-penelope`](poetries/not-your-penelope)

Models unilateral devotion, deterministic deadlines, and resource reclamation over infinite waiting. The routine enforces boundaries against one-way channels, reclaiming the woven fabric of memory for oneself when reciprocity is not returned before the deadline.

- [Golang](poetries/not-your-penelope/lib/not_your_penelope.go)
- [JavaScript (ESM)](poetries/not-your-penelope/lib/not-your-penelope.mjs)
- [Python](poetries/not-your-penelope/lib/not_your_penelope.py)
- [Rust](poetries/not-your-penelope/lib/not_your_penelope.rs)
- [TypeScript](poetries/not-your-penelope/lib/not-your-penelope.ts)

---

## Packages

Shared utilities and tooling under [`packages/`](packages/):

### [`@latentsignals/file-reader`](packages/file-reader)

TypeScript library and CLI utility that reads any source code file (`.go`, `.py`, `.ts`, `.rs`, `.ys`, `.json`, etc.) and exports it formatted ready for display in terminals (ANSI colors with line numbers) and web applications (semantic and styled HTML).
