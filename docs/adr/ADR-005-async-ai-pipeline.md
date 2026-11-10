# ADR-005: AI processing is asynchronous with a per-article state machine

Status: Proposed

## Context

Today the Express server calls OpenAI synchronously on the request path:
`GET /api/articles/:id/audio` blocks the HTTP request on TTS, and enhancement
runs on demand. This couples API latency to model latency, re-pays generation
costs on every request, and offers no retry, dead-letter, or cost control. The
volume (800+ feeds, thousands of articles/day) makes synchronous generation
unsustainable.

## Decision

- All AI work moves to queue-driven pipeline stages: extraction/normalization
  (P2), enrichment (P3), audio generation (P4), each consuming a Kafka topic
  and publishing to the next.
- Each article has a **state machine**: `ingested → extracted → enriched →
  audio_ready → published`, plus terminal states `dead_letter` and `blocked`
  (moderation). Transitions are persisted and keyed by article UUID.
- Consumers are idempotent on the UUID and tolerant of at-least-once
  delivery; the state machine collapses duplicate messages.
- Every stage has a dead-letter path; failures are retried with backoff and
  are visible in metrics (attempts, latency, token spend).
- Priority tiers: breaking-news feeds and articles are processed before
  general content.

## Consequences

- API latency is decoupled from model latency; the API serves what is ready
  and can signal `isProcessed` state to the frontend.
- Cost becomes controllable per stage (budgets, concurrency, tiering) and
  measurable (per-article token/latency metrics).
- More moving parts: Kafka topics, a state store, worker deployments. The
  observability investment (tracing article → AI → audio) is mandatory for
  this to be debuggable.
