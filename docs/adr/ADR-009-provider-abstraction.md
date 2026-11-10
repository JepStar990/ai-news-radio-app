# ADR-009: LLM/TTS behind a provider abstraction

Status: Proposed

## Context

`server/openai.ts` hardcodes the OpenAI SDK and pins a model with a comment
forbidding change. The portfolio story benefits from demonstrating
provider-agnostic design (the author's other repos already show BYOK DeepSeek
patterns), and pricing/availability realities differ between development
(cheap, low volume) and demonstration (cost-controlled).

## Decision

- Define provider interfaces in the enrichment (P3) and audio (P4) pipelines:
  `TextEnhancer` (summarize, categorize, enhance, moderate) and
  `SpeechSynthesizer` (text → audio, voice, language).
- Ships with an OpenAI implementation (GPT-4o-class + TTS) and is structured
  so Azure Speech, ElevenLabs, or a local model slot in behind the same
  interface.
- Provider, model, voice, and cost parameters are configuration (env/
  config files), never code. Nothing is pinned in comments.
- The content API's on-request OpenAI calls are deleted when P3/P4 take over
  (ADR-005), leaving exactly one place per capability that calls a model.

## Consequences

- The demo can switch providers or voices without code changes; the
  abstraction is a visible portfolio artifact.
- One more indirection layer in pipelines that are already async — the
  interface must include timeout, retry, and cost-token return values so the
  state machine (ADR-005) can react.
- Configuration sprawl risk: provider config is part of the per-stage config
  contract, validated at startup.
