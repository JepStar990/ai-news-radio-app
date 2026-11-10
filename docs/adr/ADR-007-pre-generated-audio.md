# ADR-007: Pre-generated audio on object storage with Range + CDN

Status: Proposed

## Context

Audio is currently generated on request: the endpoint buffers the whole TTS
output in memory, has no Range support (so seeking breaks), and caches for one
hour. Every listener re-pays generation cost and latency, and large files
cannot be streamed. The product is audio-first — playback must feel like a
streaming service, not a request queue.

## Decision

- TTS runs once per article in the P4 pipeline; the MP3 is uploaded to object
  storage under `audio/{article_uuid}.mp3` and the article's `audioUrl`
  points at the CDN.
- The API and CDN serve audio with HTTP Range support; the frontend uses
  standard streaming playback with seek.
- Regeneration happens only on demand (voice change, content update) and is a
  pipeline action, never an HTTP request action.
- Voice selection is per-language with configurable defaults, overridable by
  user preference via S2 settings (the `voice` settings section already
  exists in the data model).

## Consequences

- Playback is fast and seekable; generation cost is paid once per article.
- Requires object storage + CDN infrastructure (I4) in Phase 2/3 — a real but
  bounded commitment, and itself a portfolio artifact.
- Storage cost grows with content volume; a retention/lifecycle policy (e.g.
  expire audio for articles older than N days unless favorited) keeps it
  bounded.
