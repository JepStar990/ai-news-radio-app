# ADR-006: Grounded enhancement: rewrite, never fabricate

Status: Proposed

## Context

The current enhancement prompt (`server/openai.ts`) instructs the model to
"expand on key points with additional context and background information"
using only the RSS excerpt as input. For a news product this produces
plausible but fabricated reporting — the single worst failure mode for a
showcase of AI engineering. Senior practice for news summarization is
grounding: the model may rewrite and structure, but must not introduce facts
absent from the source.

## Decision

- Enhancement operates only on the full extracted article text (P2 output),
  never on the RSS excerpt alone.
- The prompt contract is: restructure for audio, improve narrative flow,
  summarize — explicitly forbidden to add facts, quotes, numbers, or context
  not present in the input. The system prompt includes the prohibition and
  the model is instructed to drop detail rather than invent it.
- Output carries provenance: `enhancedContent` is stored alongside the
  original text and the extraction source URL, so the enhancement is always
  auditable against its input.
- A moderation pass (P3) screens enhanced text before publication; failures
  move the article to `blocked` rather than dropping it silently.

## Consequences

- The "full story" feature is honestly scoped: it makes the existing story
  better, it does not write new journalism. This is the defensible position
  for a portfolio and the only safe one for real deployment.
- Extraction quality (P2) becomes the ceiling for enhancement quality — full
  article extraction is a prerequisite, not an optimization.
- Slight reduction in "wow" factor versus free-form generation; recovered by
  showing the pipeline, provenance, and moderation as features.
