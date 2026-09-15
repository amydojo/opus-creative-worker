# OPUS Media Worker

Python stays the heavy-media lane inside OPUS OS. Vercel/TypeScript owns orchestration, state, approvals, Canva routing, and publishing manifests; Python owns deterministic media processing.

## V0.2 responsibilities

- discover source video/image assets
- probe video duration, dimensions, and frame rate with `ffprobe`
- generate optional contact sheets with `ffmpeg`
- emit a machine-readable `manifest.json`
- fail locally per asset instead of destroying the whole batch

This intentionally starts smaller than the older Dojo Lab worker. The Dojo implementation proved useful patterns — headless remote runs, FFmpeg, Python 3.12, cached models, and a stable request ID — but OPUS OS separates those concerns from Drive-specific transport and keeps the worker as a stateless processor.

## Boundary

The worker does **not** decide ad spend, medical claims, patient consent, publishing status, or Canva layout. Those remain in OPUS OS approval and production lanes.

## Next media capabilities

1. transcript/ASR adapter
2. scene and silence segmentation
3. proxy generation + thumbnail bank
4. before/after pairing and dimensional QC
5. matched crop solver
6. deliverable normalization and READY_UPLOAD manifests
