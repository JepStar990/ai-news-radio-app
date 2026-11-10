# ADR-004: Kafka pipeline is the primary ingestion path

Status: Proposed

## Context

Two ingestion systems exist: a self-hosted Kafka pipeline (844 feeds,
scheduler, Prometheus/Grafana, k8s manifests) and an Azure Functions pipeline
(828 feeds, queue/blob/table storage, Bicep, CI). Maintaining both as live
systems doubles surface area and drifts their behavior (the Azure one has a
dedup bug that silently discards enrichment). The portfolio needs one flagship
that demonstrates senior data engineering.

## Decision

- **The Kafka pipeline is the primary ingestion path** for RadioChat.
- The Azure Functions pipeline is kept in its repository as a documented
  alternative for a serverless cost profile, and is not part of the running
  system.
- The Kafka pipeline is reworked to: assign UUIDs (ADR-002), deduplicate
  persistently by content hash (not an in-memory LRU), publish with idempotent
  keys, and register Avro schemas for `rss.raw` (ADR-005 topics).

## Consequences

- One ingestion path to operate and monitor; the Azure variant stays as a
  portfolio talking point rather than maintenance debt.
- Kafka becomes load-bearing for the whole system, so its monitoring gaps
  (broken dashboard references, un-incremented metrics) must be fixed in
  Phase 1.
- The Azure repo's CI and Bicep remain valuable as a reference for the
  eventual production deployment story (Phase 5) even if it is not running.
