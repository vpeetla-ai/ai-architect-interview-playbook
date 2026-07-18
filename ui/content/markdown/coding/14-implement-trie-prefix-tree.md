# Implement a Trie / prefix tree (Staff+ autocomplete extension)


<!-- question-variants:v1 -->

## Expected question

"Implement a Trie that supports insert(word), search(word), and startsWith(prefix)."

## Variant forms

Interviewers often ask the same structure with different framing or Staff+ extensions — recognize the archetype:

- "Implement a Trie with insert, exact search, and prefix search."
- "Add autocomplete: return the top K words for a prefix."
- "How would you make concurrent reads safe while a writer updates the Trie?"
- "Support delete(word) without removing prefixes shared by other words."
- "Build a dictionary that rejects duplicate words and reports word count."
- "When is a sorted array or hash set better than a Trie?"
- "How do you reduce the memory cost of a character-per-node Trie?"
- "How would you serve typeahead from a distributed, read-heavy index?"

## The question, as it might actually be asked

Implement a Trie that supports `insert(word)`, `search(word)`, and `starts_with(prefix)`. Then extend it to return up to `k` autocomplete suggestions for a prefix. Assume lowercase words for the coding portion.

## The framework

Clarify alphabet, matching semantics, and update/read concurrency → build correct prefix traversal → state time and memory costs → offer a Staff+ extension around immutable read snapshots, top-k ranking, or memory representation. Do not jump to a distributed search service before the local data structure works.

## Where this actually gets asked

Common in search, marketplace, IDE, and consumer-product loops because it tests tree invariants and API boundaries. Staff follow-ups usually probe whether you recognize that autocomplete needs a ranking source and that a mutable shared Trie needs a read/write consistency contract.

## Problem

Implement `insert(word)`, `search(word)`, and `starts_with(prefix)` for a Trie. Add `autocomplete(prefix, k)` that returns at most `k` lexicographically ordered matching words.

## Clarifying questions you should ask first

1. What alphabet and normalization rules apply: lowercase English, Unicode, or case-insensitive?
2. Does `search` require a full word, while `starts_with` accepts any path? (usually yes)
3. Should duplicate inserts be idempotent?
4. What ordering or ranking defines autocomplete results?
5. Are reads concurrent with writes, and may a reader see a previous complete snapshot?

## Approach ladder

| Step | Idea |
|------|------|
| Brute | Store words in a list; scan every word for each prefix query — O(total characters) per query |
| Correct | Trie nodes map character→child and mark complete words — O(L) insert/search/prefix traversal |
| Staff+ | Lock writes and snapshot reads; cache top-K per node or use compressed/radix nodes when memory dominates |

## Reference solution (Python)

```python
from __future__ import annotations

from dataclasses import dataclass, field
from threading import RLock


@dataclass
class _TrieNode:
    children: dict[str, "_TrieNode"] = field(default_factory=dict)
    is_word: bool = False


class Trie:
    """Thread-safe Trie; readers receive a consistent traversal under one lock."""

    def __init__(self) -> None:
        self._root = _TrieNode()
        self._lock = RLock()

    def insert(self, word: str) -> None:
        if not word:
            raise ValueError("word must be non-empty")
        with self._lock:
            node = self._root
            for char in word:
                node = node.children.setdefault(char, _TrieNode())
            node.is_word = True

    def search(self, word: str) -> bool:
        with self._lock:
            node = self._find(word)
            return node is not None and node.is_word

    def starts_with(self, prefix: str) -> bool:
        with self._lock:
            return self._find(prefix) is not None

    def autocomplete(self, prefix: str, k: int) -> list[str]:
        if k < 0:
            raise ValueError("k must be non-negative")
        with self._lock:
            start = self._find(prefix)
            if start is None or k == 0:
                return []
            results: list[str] = []

            def collect(node: _TrieNode, suffix: str) -> None:
                if len(results) == k:
                    return
                if node.is_word:
                    results.append(prefix + suffix)
                for char in sorted(node.children):
                    collect(node.children[char], suffix + char)
                    if len(results) == k:
                        return

            collect(start, "")
            return results

    def _find(self, text: str) -> _TrieNode | None:
        node = self._root
        for char in text:
            node = node.children.get(char)
            if node is None:
                return None
        return node
```

**Complexity:** insert/search/starts_with are O(L), where L is input length. `autocomplete` is O(P + visited nodes) plus sorting child keys; the structure uses O(total stored characters) nodes in the worst case.

## Tests / edge cases

1. Insert `apple`; `search("apple")` is true, `search("app")` is false, and `starts_with("app")` is true.
2. Insert `app`; both words remain searchable and autocomplete `app`, `2` returns `["app", "apple"]`.
3. A missing prefix returns an empty autocomplete result.
4. Duplicate insert does not produce duplicate suggestions.
5. Concurrent inserts and reads never expose a partially linked child path.

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| Read concurrency | A single lock is a correct baseline; read/write locks or immutable copy-on-write snapshots improve read-heavy workloads |
| Top-K | Lexicographic DFS is not popularity ranking; cache bounded top-K candidates per node and update them on writes |
| Memory | Dict-per-character nodes are expensive; use radix compression, array children for small fixed alphabets, or a minimal DFA offline |
| Product boundary | Query normalization, profanity filtering, tenant isolation, and ranking belong around—not inside—the basic Trie |

## What's expected at each level

- **Mid-level:** Correct traversal and terminal-word distinction.
- **Senior:** Clean API, complexity, and tests for shared prefixes and missing paths.
- **Staff+:** Separates lexical matching from ranking, and gives a credible read/write and memory strategy.
- **Principal:** Connects index ownership to freshness, privacy, latency SLOs, and regional/tenant serving boundaries.

## Follow-up questions to expect

- "Delete a word." — Unmark the terminal node, then prune only nodes with no children and no terminal marker.
- "Rank by popularity." — Maintain bounded ranked candidates per prefix, with a defined update and freshness policy.
- "Can readers avoid locks?" — Yes with immutable snapshots/atomic root replacement, trading write amplification for lock-free reads.

## Related

- [../general-system-design/12-search-autocomplete-typeahead.md](../general-system-design/12-search-autocomplete-typeahead.md)
- [05-top-k-frequent-stream.md](05-top-k-frequent-stream.md)
- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
