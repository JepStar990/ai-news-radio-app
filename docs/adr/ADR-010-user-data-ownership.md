# ADR-010: The Go service is the sole owner of user data

Status: Proposed

## Context

User data currently has two systems of record: the Express content API serves
`/api/favorites`, `/api/history`, and `/api/downloads` from its in-memory
store (unauthenticated), while the Go service owns the real Postgres-backed
versions behind auth — and the frontend calls both (the audio player posts
progress to Express; the history page reads from Go). This splits analytics,
breaks security posture, and already produced drift (two different progress
payload shapes).

## Decision

- The Go user service (S2) is the **sole owner** of all user data: auth,
  profiles, settings, favorites, downloads, history, playlists.
- The Express content API deletes its user-data routes and any
  user-scoped storage; it serves anonymous content only.
- The frontend routes all user calls through the existing `userApi` client
  (`VITE_USER_API_BASE_URL`); the audio player's progress writes switch from
  Express to the Go endpoint with the Go payload contract
  (`position_seconds`, `event_type`, `session_id`).
- Contract mismatches found in Phase 0 (profile, password, settings sections,
  history payload) are fixed against the shared contract package (I1).

## Consequences

- One owner per data domain — the rule every other integration follows.
- Analytics (P5) reads a single, authenticated source of truth for listening
  behavior.
- Express loses its seed data for favorites/history, which also removes
  unauthenticated write endpoints from the public surface.
