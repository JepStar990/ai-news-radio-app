# ADR-012: API gateway only in production

Status: Proposed

## Context

The frontend already speaks to two origins (content API same-origin, Go user
service via `VITE_USER_API_BASE_URL`). In production, multi-origin browsers
plus CORS, TLS termination, rate limiting, and routing across five services
argue for a single entry point. In development, a gateway adds a moving part
with no benefit — the Vite proxy already solves the local story.

## Decision

- Development: dual-origin client as today, with the Vite `/api` proxy (the
  fix shipped in PR #2).
- Production: an API gateway (S8) is the single origin; the frontend build
  points all APIs at it, and the gateway routes by path (`/api/content`,
  `/api/user`, `/api/podcasts`, `/api/live`, `/api/notifications`) and
  terminates TLS, rate limits, and injects request IDs.
- The gateway is introduced in Phase 5, not earlier; services must not assume
  a gateway exists when deciding their own auth and rate limiting.

## Consequences

- Development stays simple; production gets one origin, one TLS story, one
  rate-limit story.
- Services must do their own auth validation (gateway is routing + policy,
  not a security boundary of last resort).
- Path-based routing means the frontend's URLs change at the Phase 5 cutover;
  the contracts package (I1) pins the paths so the change is mechanical.
