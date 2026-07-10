#!/usr/bin/env python3
"""Build ui/content/catalog.json from playbook markdown folders.

Run from repo root: python3 scripts/build_catalog.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "ui" / "content" / "catalog.json"
MD_OUT = ROOT / "ui" / "content" / "markdown"

CATEGORIES = [
    ("ai-system-design", "AI system design", "AI/ML platform design — hellointerview depth"),
    ("general-system-design", "General system design", "Classic distributed systems round"),
    ("cloud-architecture", "Cloud architecture", "AI infra cloud, network, security"),
    ("behavioral", "Behavioral (STAR)", "Reusable prompts + real case studies"),
    ("scalability-governance-tradeoffs", "Trade-off frameworks", "Cost, build/buy, governance, model strategy"),
    ("coding", "Staff+ coding", "High-signal coding with Staff+ extensions"),
    ("staff-plus-interview-craft", "Staff+ interview craft", "What to say, ask, and skip"),
]


def _title(md: str, fallback: str) -> str:
    m = re.search(r"^#\s+(.+)$", md, re.MULTILINE)
    return m.group(1).strip() if m else fallback


def _sections(md: str) -> list[dict[str, str]]:
    parts = re.split(r"^##\s+", md, flags=re.MULTILINE)
    out: list[dict[str, str]] = []
    for part in parts[1:]:
        lines = part.splitlines()
        if not lines:
            continue
        heading = lines[0].strip()
        out.append({"id": re.sub(r"[^a-z0-9]+", "-", heading.lower()).strip("-"), "heading": heading})
    return out


def main() -> None:
    MD_OUT.mkdir(parents=True, exist_ok=True)
    categories = []
    entries = []

    for folder, label, blurb in CATEGORIES:
        dir_path = ROOT / folder
        if not dir_path.is_dir():
            continue
        files = sorted(dir_path.glob("*.md"))
        cat_entries = []
        for path in files:
            text = path.read_text(encoding="utf-8")
            slug = path.stem
            title = _title(text, slug)
            rel = f"{folder}/{path.name}"
            dest = MD_OUT / folder
            dest.mkdir(parents=True, exist_ok=True)
            (dest / path.name).write_text(text, encoding="utf-8")
            entry = {
                "id": f"{folder}/{slug}",
                "category": folder,
                "slug": slug,
                "title": title,
                "path": rel,
                "sections": _sections(text),
            }
            entries.append(entry)
            cat_entries.append(entry["id"])
        categories.append(
            {
                "id": folder,
                "label": label,
                "blurb": blurb,
                "count": len(files),
                "entryIds": cat_entries,
            }
        )

    catalog = {
        "generatedFrom": "ai-architect-interview-playbook",
        "totalEntries": len(entries),
        "categories": categories,
        "entries": entries,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(catalog, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({len(entries)} entries, {len(categories)} categories)")


if __name__ == "__main__":
    main()
