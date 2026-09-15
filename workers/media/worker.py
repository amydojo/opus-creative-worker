#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable


VIDEO_EXTS = {".mp4", ".mov", ".m4v", ".avi", ".mkv"}
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}


@dataclass
class MediaAsset:
    path: str
    kind: str
    duration_seconds: float | None = None
    width: int | None = None
    height: int | None = None
    fps: float | None = None


def _run(cmd: list[str]) -> str:
    proc = subprocess.run(cmd, check=True, capture_output=True, text=True)
    return proc.stdout


def probe_video(path: Path) -> MediaAsset:
    raw = _run([
        "ffprobe",
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,r_frame_rate:format=duration",
        "-of", "json",
        str(path),
    ])
    data = json.loads(raw)
    stream = (data.get("streams") or [{}])[0]
    rate = stream.get("r_frame_rate") or "0/1"
    num, den = rate.split("/") if "/" in rate else (rate, "1")
    fps = float(num) / float(den) if float(den) else None
    duration = float((data.get("format") or {}).get("duration") or 0) or None
    return MediaAsset(
        path=str(path),
        kind="video",
        duration_seconds=duration,
        width=stream.get("width"),
        height=stream.get("height"),
        fps=fps,
    )


def probe_image(path: Path) -> MediaAsset:
    # Leave dimensions nullable in V0 so the worker stays dependency-light.
    return MediaAsset(path=str(path), kind="image")


def discover(paths: Iterable[Path]) -> list[MediaAsset]:
    assets: list[MediaAsset] = []
    for root in paths:
        candidates = root.rglob("*") if root.is_dir() else [root]
        for path in candidates:
            if not path.is_file():
                continue
            suffix = path.suffix.lower()
            try:
                if suffix in VIDEO_EXTS:
                    assets.append(probe_video(path))
                elif suffix in IMAGE_EXTS:
                    assets.append(probe_image(path))
            except subprocess.CalledProcessError as exc:
                print(f"probe failed: {path}: {exc}", file=sys.stderr)
    return assets


def extract_contact_sheet(asset: MediaAsset, out_dir: Path) -> str | None:
    if asset.kind != "video":
        return None
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{Path(asset.path).stem}-contact.jpg"
    _run([
        "ffmpeg", "-y", "-i", asset.path,
        "-vf", "fps=1/8,scale=480:-1,tile=4x3",
        "-frames:v", "1", str(out),
    ])
    return str(out)


def main() -> int:
    parser = argparse.ArgumentParser(description="OPUS OS deterministic media intake worker")
    parser.add_argument("inputs", nargs="+", type=Path)
    parser.add_argument("--out", type=Path, default=Path("worker-output"))
    parser.add_argument("--contact-sheets", action="store_true")
    args = parser.parse_args()

    args.out.mkdir(parents=True, exist_ok=True)
    assets = discover(args.inputs)
    records = []
    for asset in assets:
        record = asdict(asset)
        if args.contact_sheets:
            record["contact_sheet"] = extract_contact_sheet(asset, args.out / "contact-sheets")
        records.append(record)

    manifest = {
        "worker": "opus-media-v0.2",
        "asset_count": len(records),
        "assets": records,
    }
    manifest_path = args.out / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(manifest_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
