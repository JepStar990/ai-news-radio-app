# ADR-008: Live radio starts as simulated-live HLS

Status: Proposed

## Context

The live radio page expects stations with live badges and real-time listener
counts, but today it renders seeded placeholders. True 24/7 live broadcasting
requires a media server (Icecast-class), continuous mixing, and a large
operational commitment — heavy cost for a feature whose product value is
"continuous news audio," not "we own a radio transmitter."

## Decision

- Phase 3 ships **simulated live**: the Live Radio service (S4) curates
  continuously advancing playlists from pre-generated audio, streamed as HLS
  segments so every listener is synchronized to the same schedule — the
  experience is indistinguishable from live for the listener.
- Listener counts are real: S4 tracks active sessions and pushes counts over
  WebSocket; the frontend live badges consume that stream.
- The stream schedule is derived from the pipeline (breaking tier first), so
  "live" genuinely tracks the news cycle rather than shuffling old audio.
- A future migration to continuous broadcast (real announcer mixing) is
  possible behind the same station API; it is not a roadmap commitment.

## Consequences

- Live radio ships on the existing P4/I4 infrastructure with modest new code.
- Honest framing in docs: it is simulated-live, not broadcast — the README and
  the UI should not claim otherwise (the app is a portfolio piece; accuracy
  is part of the craft).
- HLS segmentation adds ffmpeg work to S4; worth it because it also gives
  synchronized, seekable streams and works on mobile browsers.
