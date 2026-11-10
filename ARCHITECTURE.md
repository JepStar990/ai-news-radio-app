# RadioChat System Architecture

Status: **Proposed** — this document is the target architecture for the RadioChat
system (the AI news radio platform behind this repository). It defines the north
star that the roadmap phases build toward. Individual decisions are recorded in
[`docs/adr/`](docs/adr/). The original app-internal architecture notes live in
[`docs/app-internal-architecture.md`](docs/app-internal-architecture.md).

## Scope and repository map

RadioChat spans multiple repositories. This document covers the system, not any
single repo.

| Repo | Role | Status |
|---|---|---|
| `ai-news-radio-app` (this repo) | Frontend + content API (Express BFF) | Exists — rework |
| `real-time-news-aggregation-pipeline` | RSS ingestion (Kafka-based, 844 feeds) | Exists — rework |
| `news-aggregator-azure` | RSS ingestion (Azure Functions variant) | Exists — documented alternative |
| `user-profile-system-backend-go` | User/auth service (Fiber + GORM + Postgres) | Exists — rework |
| Future services | AI pipeline, audio pipeline, podcast service, live radio service, notification service | New |

## 1. System context

RadioChat converts RSS news into audio content: articles are ingested,
extracted, summarized, enhanced ("the full story"), and converted to speech;
the resulting audio powers an on-demand player, category podcasts, and live
radio streams, served by a React frontend with user accounts, libraries, and
social sharing.

Design goals:

1. **Production-grade showcase** — every service has tests, CI, observability,
   and a documented failure story. This is a portfolio system, so engineering
   craft is the product.
2. **Senior-level data engineering** — real streaming (Kafka), persistent
   deduplication, schema contracts, state-machine processing, and an analytics
   pipeline.
3. **Senior-level AI engineering** — asynchronous, cost-controlled, grounded
   LLM processing with a provider abstraction; pre-generated audio, not
   on-request synthesis.
4. **Microservices where they earn it** — services split along scaling and
   failure domains (ingestion, AI, TTS, live delivery, users), not by feature
   count. Thin features stay in their natural host.

## 2. Component inventory

The system is **22 build units**: 5 pipelines, 8 services, 8 platform projects,
1 frontend.

### Pipelines

| ID | Name | Status | Responsibility |
|---|---|---|---|
| P1 | RSS Ingestion | Exists — rework | Poll 800+ feeds, parse, assign UUID, dedup by content hash, publish raw articles to Kafka. See ADR-004 |
| P2 | Article Extraction & Normalization | New | Fetch full article HTML, clean and normalize, extract metadata (author, image, language), publish normalized articles |
| P3 | AI Enrichment Pipeline | New | LLM summarization, categorization, grounded enhancement, moderation. State machine per article. See ADR-005, ADR-006 |
| P4 | Audio Generation Pipeline | New | TTS per language/voice, upload to object storage, record `audioUrl` + duration. Cost budgets and retries |
| P5 | Analytics Event Pipeline | New (partial) | Consume playback/share/search events (Go backend already writes `ListeningEvent`/`ActivityLog`) into a warehouse for dashboards |

### Services

| ID | Name | Status | Responsibility |
|---|---|---|---|
| S1 | Content API (this repo's Express server) | Exists — rework | Articles, categories, search, trending, featured, shares. Postgres-backed, drop seeded data, remove duplicated user routes. See ADR-010 |
| S2 | User/Auth Service (Go) | Exists — rework | Auth, profiles, settings, favorites, downloads, history, playlists (new). System of record for all user data. See ADR-010 |
| S3 | Podcast Service | New | Group generated audio into category podcasts, generate RSS 2.0 feeds with episodes, artwork, chapters; subscription status |
| S4 | Live Radio Service | New | Continuous streams from curated audio queues; HLS segmentation; real listener counts via WebSocket/SSE. See ADR-008 |
| S5 | Notification Service | New | Breaking-news detection from pipeline output, system alerts, delivery to frontend (SSE), honors per-user preferences from S2 |
| S6 | Recommendation Service | New (later) | Content-based recommendations from category + listening history. Start as SQL inside S1; extract only if complexity demands. See ADR-011 |
| S7 | Share/Social | Inside S1 | Share tracking and platform URLs. Deliberately not a separate service. See ADR-011 |
| S8 | API Gateway | New (later) | Single origin for the frontend in production; routes to S1–S5. See ADR-012 |

### Platform projects

| ID | Name | Status | Responsibility |
|---|---|---|---|
| I1 | Shared Contracts | New | Versioned JSON Schemas for APIs, Avro for Kafka topics, shared TypeScript types package. Single source of truth for inter-service data |
| I2 | PostgreSQL | New (formalize) | One managed instance, three schemas: `content`, `user`, `analytics`. See ADR-003 |
| I3 | Kafka + Schema Registry | Exists — upgrade | Registry, idempotent producers, topic versioning, fixed monitoring |
| I4 | Object Storage + CDN | New | Audio files with HTTP Range support behind a CDN. See ADR-007 |
| I5 | Observability | Partial — unify | Metrics (Prometheus), central tracing (article → AI → audio journey), logs, dashboards, alerts across all services |
| I6 | CI/CD | Partial | Per-service pipelines that run tests (today Kafka CI builds but never tests), image builds, integration and e2e stages |
| I7 | IaC + Deployment | Partial | One deployment story (k8s or Azure), fixed hardcoded regions/names, real volumes (no `emptyDir` for persistent outputs) |
| I8 | QA | New | Contract tests between frontend and both backends, Playwright e2e suite, k6 load tests |

### Frontend

| ID | Name | Status | Responsibility |
|---|---|---|---|
| F1 | React app | Exists — rework | All UI. Contract fixes with S2, remove broken artifacts, add playlists and recommendations UI, wire notifications to S5, Media Session API, production env wiring |

## 3. System topology

```
                       +---------------------+
                       |   API Gateway (S8)  |   production only
                       +----------+----------+
                                  |
        +--------------+----------+-----------+--------------+
        |              |                      |              |
   +----v-----+   +----v-----+          +-----v----+   +-----v-----+
   | Content  |   |  User    |          | Podcast  |   |  Live     |
   | API (S1) |   |  Auth (S2)|         |  (S3)    |   |  (S4)     |
   +----+-----+   +----+-----+          +-----+----+   +-----+-----+
        |              |                      |              |
        |              |                      |              |
   +----v--------------v----------------------v--------------v-----+
   |                    PostgreSQL (I2)                            |
   |   schemas: content | user | analytics                         |
   +----------------------------------------------------------------+
```

```
   RSS feeds
      |
      v
+------------+    raw articles     +-------------------+
| Ingestion  |-------------------->| Extraction &      |
| (P1)       |    Kafka topics     | Normalization (P2)|
+------------+    rss.raw          +---------+---------+
                                            |
                                            |  rss.normalized
                                            v
                                 +---------------------+      +-------------------+
                                 | AI Enrichment (P3)  |----->| Postgres content  |
                                 | summarize/categorize|      | schema (article   |
                                 | enhance/moderate    |      | published)        |
                                 +----------+----------+      +---------+---------+
                                            |                               |
                                            |  audio.requests               |  audioUrl
                                            v                               v
                                 +---------------------+      +-------------------+
                                 | Audio Gen (P4)      |----->| Object Storage    |
                                 | TTS -> mp3          |      | + CDN (I4)        |
                                 +---------------------+      +---------+---------+
                                                                          |
                                            +--------------+--------------+
                                            |              |
                                     +------v-----+  +-----v------+
                                     | Podcasts   |  | Live Radio |
                                     | (S3)       |  | (S4)       |
                                     +------------+  +------------+
                                            |
                                            v
                                     Frontend (F1)
```

## 4. End-to-end data flows

**Flow A — article journey:** RSS feeds → P1 (UUID, dedup) → Kafka → P2 (full
content, normalized) → Kafka → P3 (summary, category, grounded enhancement,
moderation) → Postgres → Kafka → P4 (TTS → object storage) → Postgres
(`audioUrl`) → S1 → frontend player.

**Flow B — user journey:** register/login (S2) → browse (S1) → play (audio URL
with Range) → progress/favorites/downloads/history (S2) → P5 warehouse →
dashboards → S6 recommendations.

**Flow C — live radio:** P4 output → S4 station playlists → HLS segments → I4/CDN
→ frontend player; listener counts over WebSocket → live badges.

**Flow D — notifications:** P3 detects breaking category → S5 (user prefs from
S2) → SSE to frontend → toasts + notifications page.

## 5. Functional inventory and ownership

Every user-facing feature, its owning component, and its current state. This is
the traceability matrix — anything the app must do appears here.

| Feature | Owner | State |
|---|---|---|
| Home feed (featured/trending) | S1 | Seeded data; needs real ingestion |
| Browse, categories, search | S1 | Seeded data |
| Article reading view (enhanced content) | S1 + P3 | `enhancedContent` always null today |
| Audio player (queue, seek, volume, resume) | F1 + S1 | Works; needs Range + Media Session API |
| Playback progress/resume | S2 | Two competing systems (Express + Go) — ADR-010 |
| Downloads (offline) | S2 + I4 | `GET /downloads/url` returns nothing real |
| Summaries, categorization | P3 | Not built |
| Per-article TTS | P4 | Synchronous on-request today; no key configured |
| Podcasts (discovery, episodes, subscribe) | S3 | Seeded fake feeds |
| Live radio (stations, listeners, badges) | S4 | Seeded fake streams, hardcoded counts |
| Social sharing + stats | S1 | Endpoints exist; wire to real data |
| Register/login/logout | S2 | Works |
| Token refresh | S2 + F1 | Client never calls `/auth/refresh`; 15-min sessions |
| Profile + avatar upload | S2 | Avatar endpoint exists; profile PUT broken |
| Password change | S2 | Broken (payload mismatch) |
| Settings (audio, voice, live_radio, notifications, appearance) | S2 | Section names mismatch; saves fail |
| Favorites | S2 | Works; duplicate insert returns 500 |
| Playlists | S2 + F1 | Does not exist anywhere (schema only) |
| History + stats | S2 | Works |
| Notifications (breaking, system) | S5 | Page exists; nothing generates events |
| Voice commands (browser Web Speech) | F1 | Works client-side |
| Recommendations | S6 | Does not exist anywhere |
| Dark mode, themes, responsive, toasts | F1 | Works; no backend dependency |

## 6. Data contracts

- **Article identity:** UUID string, assigned in P1, used in every API, in S2
  content references (`content_id`), and as the audio object key. See ADR-002.
- **API envelopes:** errors `{success:false, error:{code,message,request_id}}`;
  success `{success:true, data:...}`. The Go backend has both defined but only
  the error envelope is used; S1 returns bare objects. Unify in Phase 0.
- **Kafka events:** Avro schemas in the registry (I3), versioned, with
  idempotent producer keys (article UUID) and a consumer that tolerates
  at-least-once delivery by keying the state machine on the article UUID.
- **Content reference:** `(content_id: UUID, content_type: article|podcast|live)`
  is the S2 contract for favorites, downloads, history. Already exists in the Go
  models; the frontend must switch fully to it.
- **Shared package:** a contracts repo (I1) publishes TypeScript types for the
  frontend and both backends — the drift found between S2 and F1 in Phase 0 is
  the proof that this must exist.

## 7. Cross-cutting concerns

**Observability (I5).** One stack across all services: Prometheus metrics,
OpenTelemetry traces (a single article must be traceable through P1 → P4 → S1),
structured logs with request IDs, Grafana dashboards, alert rules. The Go
service already sets the pattern; the Express server has none today.

**Security.** Content API endpoints that touch user data (favorites, history,
downloads) must be removed from S1 entirely (ADR-010). Secrets in env/secret
managers only — the pipeline config currently ships a default API key. TTS/LLM
calls to third parties are server-side only. Rate limiting at S8 and per-user
at S2 (exists: 100/min global).

**Testing (I8).** Three layers: contract tests (frontend ↔ S1, frontend ↔ S2)
run in CI on every change to either side; integration tests per service
(Azurite pattern in the Azure repo is the model); Playwright e2e on the whole
stack. Load tests (k6) for the audio endpoints before claiming production.

**Cost control.** 844 feeds polled every 15 minutes feeding LLM + TTS is an
unbounded bill. Dedup-before-AI (content hash), priority tiers (breaking news
first), per-feed budgets, and token/latency metrics per pipeline stage are
load-bearing requirements, not polish.

**Failure handling.** Every pipeline stage has a dead-letter path and is
idempotent by article UUID. Retry with backoff (the ingestion service already
does this well). No silent drops — the Azure pipeline's dedup bug that
silently discards enrichment is the anti-pattern to avoid.

## 8. Roadmap

**Phase 0 — Stabilize (immediate).** Go↔frontend contract fixes; token refresh
flow; tests for Go and the app repo; delete broken artifacts; fix #3 and #4;
unify envelopes. Rationale: everything later builds on these two backends.

**Phase 1 — Content backbone.** I1 contracts → I2 Postgres → S1 rework (real
storage, drop duplicated user routes) → P1 rework (UUID, persistent dedup,
schema registry). Milestone: real articles flowing into a real database.

**Phase 2 — The AI factory.** P2 → P3 → P4 with state machine, then I4 object
storage. Milestone: every article automatically gets summary, enhanced story,
and audio.

**Phase 3 — Audio delivery.** S3 podcast service → S4 live radio (simulated-live
HLS first). Milestone: podcasts and live pages show real, listenable content.

**Phase 4 — Engagement.** S5 notifications → playlists (S2 + F1) → S6
recommendations → social polish. Milestone: the app feels alive.

**Phase 5 — Production hardening.** S8 gateway, I5 observability, I6 CI/CD with
real tests, I7 deployment, I8 load tests. Milestone: deployable environment
with a documented failure story.

## 9. Risks

- **AI cost explosion** — mitigated by dedup-before-AI, budgets, tiering.
- **Hallucinated news content** — the grounding policy (ADR-006) is a hard
  requirement; enhanced content must not invent facts.
- **Dual ownership of user data** — resolved by ADR-010; until then, analytics
  will be wrong and security posture is split.
- **No test culture yet** — Phase 0 builds it before the system grows.
- **Third-party content rights** — TTS of news articles is acceptable for a
  portfolio demo; flag in the README before any real deployment.
- **Two ingestion pipelines** — ADR-004 keeps one as flagship, one as
  documented alternative, to avoid maintaining both.

## 10. Decision records

See [`docs/adr/`](docs/adr/) — index in [`docs/adr/README.md`](docs/adr/README.md).

| ADR | Decision |
|---|---|
| ADR-002 | Article identity: UUID string across all services |
| ADR-003 | One Postgres instance, per-service schemas |
| ADR-004 | Kafka pipeline is the primary ingestion; Azure Functions is the documented alternative |
| ADR-005 | AI processing is asynchronous and queue-driven with a per-article state machine |
| ADR-006 | Grounded enhancement: the LLM rewrites from extracted text, never fabricates |
| ADR-007 | Audio is pre-generated to object storage, served with Range + CDN |
| ADR-008 | Live radio starts as simulated-live HLS; continuous broadcast later |
| ADR-009 | LLM/TTS behind a provider abstraction; nothing pinned in code |
| ADR-010 | The Go service is the sole owner of user data |
| ADR-011 | Thin features (shares, initial recommendations) stay in the content API |
| ADR-012 | API gateway only in production; dual-origin client in dev |
