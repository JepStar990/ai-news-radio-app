# ADR-003: One PostgreSQL instance with per-service schemas

Status: Proposed

## Context

The system needs relational storage for content (articles, podcasts, streams,
shares) and user data (profiles, settings, favorites, history, playlists), plus
analytics tables. Purist microservice practice gives each service its own
database; that doubles operational burden and blocks cross-schema queries that
this system genuinely needs (recommendations join listening history with
article categories).

## Decision

- One managed PostgreSQL instance for the system.
- Three schemas: `content` (owned by S1/S3/S4), `user` (owned by S2),
  `analytics` (owned by P5, append-mostly).
- Each service connects with a dedicated role granted only its own schema.
  The analytics role may read `user` and `content` via views.
- The existing Drizzle schema in this repo maps to `content`; the Go service's
  GORM models map to `user`.

## Consequences

- Operational simplicity: one instance to back up, monitor, and restore.
- Cross-domain queries (recommendations, share analytics) become plain SQL
  instead of service orchestration.
- Coupling risk is contained by role grants and schema ownership rules — a
  service may not read another service's tables directly except through the
  analytics views.
- If a service later outgrows the shared instance (e.g. analytics), it can
  migrate to its own store without contract changes, since schemas already
  isolate the tables.
