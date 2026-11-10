# ADR-011: Thin features stay in the content API

Status: Proposed

## Context

The target architecture lists share tracking and recommendations as potential
services. Shares are three platform URLs plus a counter; initial
recommendations are a query joining history (via analytics views) with article
categories. A microservice for either would exist for naming rights, not for
scaling, failure isolation, or team ownership — the reasons services exist.

## Decision

- Share/social endpoints and storage live in the content API (S1).
- Recommendations start as SQL inside S1 using the analytics views over
  listening history (ADR-003). If they later need real ML (embeddings,
  ranking models), they graduate to S6 behind the same API path.
- The bar for a new service: independent scaling, independent failure domain,
  or independent deployment cadence. Document this bar in the contracts repo
  so future contributions self-filter.

## Consequences

- The service count reflects real seams (ingestion, AI, TTS, delivery, users)
  rather than feature count — an honest microservices story for the portfolio.
- S1 grows modestly; acceptable while its endpoints remain stateless reads
  over Postgres.
- The recommendation upgrade path is pre-planned: S6 with the same public
  contract means the frontend never notices the migration.
