# ADR-002: Article identity is a UUID string across all services

Status: Proposed

## Context

Articles cross four boundaries: the ingestion pipeline, the AI/audio
pipelines, the content API, and the user service (favorites, downloads,
history reference `content_id`). Today the app uses Postgres `serial` integers
assigned by the storage layer, and the pipelines have no ID at all (identity
is the source URL). Integer IDs are not portable across services and cannot be
assigned before the article reaches a database, which breaks the pipeline's
need to reference articles end-to-end.

## Decision

- The RSS ingestion stage (P1) assigns each article a **UUIDv7 string** at
  first sight.
- The UUID is the article ID in every API response, in Kafka messages, in the
  user service's `content_id` field, and in the audio object key
  (`audio/{uuid}.mp3`).
- The content API stores it as a `uuid` primary key column alongside the
  existing `serial` column during the transition, then drops the serial.
- Favorites, downloads, history, playlists, and shares reference the UUID.

## Consequences

- Articles are addressable end-to-end before any database is involved;
  pipeline stages become idempotent by keying on the UUID.
- The frontend must change from numeric article IDs to string IDs — this is a
  breaking change done once, in Phase 1, alongside the contract package.
- URL-based deduplication must additionally hash the content, because the same
  URL can serve updated text (see ADR-005).
