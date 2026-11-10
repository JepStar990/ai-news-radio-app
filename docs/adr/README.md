# Architecture Decision Records

Decisions for the RadioChat system. ADR-001 reserves this convention; records
start at ADR-002. Each record is immutable once merged — supersede, do not edit.

## Index

| ADR | Title | Status |
|---|---|---|
| ADR-002 | [Article identity is a UUID string across all services](ADR-002-article-identity-uuid.md) | Proposed |
| ADR-003 | [One PostgreSQL instance with per-service schemas](ADR-003-shared-postgres-schemas.md) | Proposed |
| ADR-004 | [Kafka pipeline is the primary ingestion path](ADR-004-kafka-primary-ingestion.md) | Proposed |
| ADR-005 | [AI processing is asynchronous with a per-article state machine](ADR-005-async-ai-pipeline.md) | Proposed |
| ADR-006 | [Grounded enhancement: rewrite, never fabricate](ADR-006-grounded-enhancement.md) | Proposed |
| ADR-007 | [Pre-generated audio on object storage with Range + CDN](ADR-007-pre-generated-audio.md) | Proposed |
| ADR-008 | [Live radio starts as simulated-live HLS](ADR-008-simulated-live-hls.md) | Proposed |
| ADR-009 | [LLM/TTS behind a provider abstraction](ADR-009-provider-abstraction.md) | Proposed |
| ADR-010 | [The Go service is the sole owner of user data](ADR-010-user-data-ownership.md) | Proposed |
| ADR-011 | [Thin features stay in the content API](ADR-011-thin-features-in-content-api.md) | Proposed |
| ADR-012 | [API gateway only in production](ADR-012-gateway-production-only.md) | Proposed |

## Template

```markdown
# ADR-NNN: Title

Status: Proposed | Accepted | Superseded by ADR-XXX

## Context
The forces at play — technical, business, portfolio.

## Decision
What we will do, stated so a new engineer can implement it.

## Consequences
What becomes easier, what becomes harder, what must be done as a result.
```
