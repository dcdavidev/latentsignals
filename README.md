# latent signals

> _Signals not yet decoded or travelling under the radar across the network._

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React Router](https://img.shields.io/badge/React_Router-v8-black?logo=reactrouter)](https://reactrouter.com/)
[![uv](https://img.shields.io/badge/Python-uv-purple?logo=python)](https://github.com/astral-sh/uv)
[![Cargo](https://img.shields.io/badge/Rust-Cargo-orange?logo=rust)](https://www.rust-lang.org/)
[![Go](https://img.shields.io/badge/Go-1.25+-00ADD8?logo=go)](https://go.dev/)

**Latent Signals** is an archive of executable code poetry exploring low-level networking, memory spaces, socket lifecycles, and asynchronous concurrency as metaphors for human experience, attachment, and disconnection.

Each signal is written across multiple programming languages—**Go**, **JavaScript (ESM)**, **Python**, **Rust**, and **TypeScript**—and served via a modern full-stack web application.

---

## 📡 Signal Archive

| Signal                                                          | Title                        | Created    | Languages                       | Theme / Concept                                                                                                                                                                                                            |
| :-------------------------------------------------------------- | :--------------------------- | :--------- | :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`connection-reset-by-peer`](poetries/connection-reset-by-peer) | **Connection Reset by Peer** | 2026-10-18 | `Bash` `Go` `JS` `Py` `Rs` `Ts` | A formal protocol teardown illustrating betrayal, wounded pride, and irreversible socket termination across a duplex channel. Once mutual integrity is violated, belated apology frames cannot revive a closed descriptor. |
| [`not-your-penelope`](poetries/not-your-penelope)               | **Not Your Penelope**        | 2026-10-17 | `Bash` `Go` `JS` `Py` `Rs` `Ts` | Models unilateral devotion, deterministic deadlines, and resource reclamation over infinite waiting. The local runtime reclaims thread execution and state rather than waiting indefinitely for an absent peer.            |
| [`the-graceful-yield`](poetries/the-graceful-yield)             | **The Graceful Yield**       | 2026-10-21 | `Bash` `Go` `JS` `Py` `Rs` `Ts` | A quiet departure from a unidirectional channel: closing the write descriptor, releasing shared locks, and stepping aside with grace so silence is never a fault.                                                          |
| [`uncollected-reference`](poetries/uncollected-reference)       | **Uncollected Reference**    | 2026-10-15 | `Bash` `Go` `JS` `Py` `Rs` `Ts` | A programmatic reflection on suspended and unspoken devotion. Maintains an unbounded loop on an empty socket channel while preventing garbage collection of the persistent presence.                                       |

---

## 🏗️ Repository Architecture

The project is structured as a unified, flat polyglot monorepo:

```text
latentsignals/
├── app/                              # Full-stack web application (React Router, MUI, Tailwind)
│   ├── lib/poetries.server.ts        # Server-side poetry loader & syntax highlighter
│   ├── routes/
│   │   ├── home.tsx                  # Catalog & archive gallery
│   │   └── poetry.tsx                # Multi-language code poetry viewer
│   └── root.tsx
├── poetries/                         # Polyglot code poems (organized by slug)
│   ├── connection-reset-by-peer/
│   │   ├── connection_reset_by_peer.go
│   │   ├── connection-reset-by-peer.mjs
│   │   ├── connection_reset_by_peer.py
│   │   ├── connection_reset_by_peer.rs
│   │   ├── connection_reset_by_peer.sh
│   │   └── connection-reset-by-peer.ts
│   ├── not-your-penelope/
│   ├── the-graceful-yield/
│   │   ├── the_graceful_yield.go
│   │   ├── the-graceful-yield.mjs
│   │   ├── the_graceful_yield.py
│   │   ├── the_graceful_yield.rs
│   │   ├── the-graceful-yields.sh
│   │   └── the-graceful-yield.ts
│   └── uncollected-reference/
├── Cargo.toml                        # Rust cargo crate configuration
├── lib.rs                            # Rust root library re-exporting poetry modules
├── go.mod                            # Go module definition (latentsignals)
├── .golangci.yml                     # Go linter configuration
├── pyproject.toml                    # Python project configuration (uv, ruff, mypy, isort)
├── package.json                      # Web application & TypeScript dev dependencies
├── Dockerfile                        # Multi-stage container deployment
└── vite.config.ts                    # Vite build pipeline
```

---

## 🛠️ Development & Tooling

Each language ecosystem maintains its own native toolchain, linting, and formatting anchored at the project root.

### 🌐 Web Application (React Router & TypeScript)

```bash
# Install dependencies
pnpm install

# Start local development server (with HMR)
pnpm dev

# Type check
pnpm typecheck

# Build for production
pnpm build

# Run production server
pnpm start
```

### 🐍 Python (via `uv` & `poe`)

All Python poetry scripts are located under `poetries/**/*` and managed with [uv](https://github.com/astral-sh/uv). Convenient tasks are defined in [pyproject.toml](pyproject.toml) via `poethepoet`:

```bash
# Sync virtual environment and dependencies
uv sync

# Run all checks (format, isort, lint, typecheck)
uv run poe check

# Automatically fix & format everything
uv run poe fix

# Individual verification tasks
uv run poe fmt-check   # uv run ruff format --check
uv run poe isort-check # uv run isort poetries --check
uv run poe lint        # uv run ruff check
uv run poe typecheck   # uv run mypy

# In-place formatters and fixers
uv run poe fmt      # uv run ruff format
uv run poe isort    # uv run isort poetries
uv run poe lint-fix # uv run ruff check --fix
```

### 🦀 Rust (via `cargo`)

All Rust poetry modules are configured in [Cargo.toml](Cargo.toml) and exposed via [lib.rs](lib.rs). Native task aliases are defined in [.cargo/config.toml](.cargo/config.toml):

```bash
# Lint with Clippy
cargo lint

# Check formatting with rustfmt
cargo fmt-check

# Format code in place
cargo fmt-fix

# Type & borrow check
cargo check-lib

# Run tests
cargo test-lib
```

### 🔷 Go (via `go modules` & `task`)

Each poetry directory represents an individual subpackage under the root `latentsignals` module. Tasks are managed via [Taskfile.yml](Taskfile.yml):

```bash
# Run all Go checks (vet, staticcheck, lint, formatting)
task check

# Format Go code and organize imports
task fmt

# Run individual linters
task lint
task staticcheck
task vet

# Run all checks across all languages (Go, Python, Rust, TypeScript)
task check:all
```

---

## 🐳 Docker Deployment

The project includes a multi-stage [Dockerfile](Dockerfile) optimized for Node.js production runtime:

```bash
# Build Docker image
docker build -t latentsignals .

# Run container on port 3000
docker run -p 3000:3000 latentsignals
```

---

## 📄 License

[MIT](LICENSE) © Davide Di Criscito
