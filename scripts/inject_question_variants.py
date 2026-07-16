#!/usr/bin/env python3
"""Inject Expected question + Variant forms into playbook entries.

Reads scripts/question_variants.json and inserts sections after the H1 title.
Covers design, behavioral, coding, trade-offs, and Staff+ craft.

Run from repo root: python3 scripts/inject_question_variants.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VARIANTS_PATH = ROOT / "scripts" / "question_variants.json"
FOLDERS = (
    "ai-system-design",
    "general-system-design",
    "cloud-architecture",
    "behavioral",
    "scalability-governance-tradeoffs",
    "coding",
    "staff-plus-interview-craft",
)

MARKER = "<!-- question-variants:v1 -->"

# First real content section after the injected block (varies by category)
_AFTER_VARIANT = re.compile(
    r"\n## (?:Where this actually gets asked|Requirements|"
    r"The question, as it might actually be asked|Situation|"
    r"The framework|Problem|What to talk about|What interviewers listen for|"
    r"What NOT to waste time on)\b"
)

_INTRO = {
    "behavioral": "Interviewers often probe the same competency with different framing — recognize the archetype and answer with *your* story:",
    "coding": "Interviewers often ask the same structure with different framing or Staff+ extensions — recognize the archetype:",
    "scalability-governance-tradeoffs": "Interviewers often ask the same trade-off with different framing — recognize the archetype:",
    "staff-plus-interview-craft": "Interviewers (and reverse-interview moments) often ask the same meta-question differently — recognize the archetype:",
    "default": "Interviewers often ask the same design with different framing — recognize the archetype:",
}


def format_block(expected: str, variants: list[str], folder: str) -> str:
    intro = _INTRO.get(folder, _INTRO["default"])
    lines = [
        MARKER,
        "",
        "## Expected question",
        "",
        f'"{expected}"',
        "",
        "## Variant forms",
        "",
        intro,
        "",
    ]
    for v in variants:
        lines.append(f'- "{v}"')
    lines.append("")
    return "\n".join(lines)


def strip_existing_block(text: str) -> str:
    """Remove marker block (and any duplicate Expected/Variant sections)."""
    idx = text.find(MARKER)
    if idx == -1:
        # Orphan duplicates from a bad prior run
        if text.count("## Expected question") == 0:
            return text
        # Strip from first Expected question through next known section
        pattern = re.compile(
            r"\n## Expected question\n.*?(?=\n## (?:Where this actually gets asked|Requirements|"
            r"The question, as it might actually be asked|Situation|The framework|Problem)\b)",
            re.DOTALL,
        )
        return pattern.sub("\n", text, count=1)

    after = text[idx:]
    m = _AFTER_VARIANT.search(after)
    if m:
        end = idx + m.start()
        return text[:idx] + text[end:]

    pattern = re.compile(
        rf"{re.escape(MARKER)}.*?(?=\n## (?:Where this actually gets asked|Requirements|"
        r"The question, as it might actually be asked|Situation|The framework|Problem)\b)",
        re.DOTALL,
    )
    return pattern.sub("", text, count=1)


def inject(text: str, block: str) -> str:
    text = strip_existing_block(text)
    m = re.match(r"(# .+?\n)(\n)?", text)
    if not m:
        raise ValueError("No H1 found")
    insert_at = m.end()
    return text[:insert_at] + "\n" + block + "\n" + text[insert_at:].lstrip("\n")


def main() -> None:
    data = json.loads(VARIANTS_PATH.read_text(encoding="utf-8"))
    updated = 0
    for key, payload in data.items():
        folder, _ = key.split("/", 1)
        if folder not in FOLDERS:
            print(f"skip unknown folder: {key}")
            continue
        path = ROOT / f"{key}.md"
        if not path.exists():
            print(f"skip missing: {path}")
            continue
        text = path.read_text(encoding="utf-8")
        block = format_block(payload["expected"], payload["variants"], folder)
        new_text = inject(text, block)
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
            updated += 1
            print(f"updated: {key}")
    print(f"done — {updated} files updated")


if __name__ == "__main__":
    main()
