# Time-based key-value store


<!-- question-variants:v1 -->

## Expected question

"Implement set(key, value, timestamp) and get(key, timestamp) — return the largest value with time ≤ timestamp."

## Variant forms

Interviewers often ask the same structure with different framing or Staff+ extensions — recognize the archetype:

- "Design a time-travel key-value store with strictly increasing timestamps per key."
- "Add get_latest(key) and get_range(key, t1, t2)."
- "How do you store history efficiently if most keys have few versions?"
- "Make set/get thread-safe when different keys are updated concurrently."
- "What if timestamps can arrive out of order?"
- "Support delete(key, timestamp) tombstones."
- "Binary search vs tree map per key — trade-offs?"
- "How would you persist this structure for crash recovery? (Staff extension)"

## The question, as it might actually be asked

Implement: - `set(key, value, timestamp)` — timestamps for a key are strictly increasing - `get(key, timestamp)` — largest value with time ≤ timestamp, or null

## The framework

Clarify constraints → correct end-to-end solution → narrate complexity and tests → offer a Staff+ extension (concurrency, API contract, or failure mode) without turning a coding round into distributed system design. See Approach ladder and Staff+ deep dive below.

## Where this actually gets asked

Common Meta/FAANG-style medium: map of keys to timestamped values; query value at time `t`. Staff signal is **API clarity**, binary search correctness, and memory/GC discussion — not jumping to a distributed database.

## Problem

Implement:

- `set(key, value, timestamp)` — timestamps for a key are strictly increasing
- `get(key, timestamp)` — largest value with time ≤ timestamp, or null

## Clarifying questions you should ask first

1. Are timestamps strictly increasing per key? (usually yes — confirm)
2. Integer timestamps?
3. Concurrent sets on same key?
4. Need delete / range scan?

## Approach ladder

| Step | Idea |
|------|------|
| Brute | List of (ts, val); linear scan |
| Correct | List/array per key + binary search |
| Staff+ | Discuss write concurrency; immutable snapshots; disk spill |

## Reference solution (Python)

```python
from __future__ import annotations
import bisect
from threading import RLock

class TimeMap:
    def __init__(self) -> None:
        self._data: dict[str, list[tuple[int, str]]] = {}
        self._lock = RLock()

    def set(self, key: str, value: str, timestamp: int) -> None:
        with self._lock:
            arr = self._data.setdefault(key, [])
            if arr and timestamp < arr[-1][0]:
                raise ValueError("timestamps must be non-decreasing per key")
            arr.append((timestamp, value))

    def get(self, key: str, timestamp: int) -> str | None:
        with self._lock:
            arr = self._data.get(key)
            if not arr:
                return None
            i = bisect.bisect_right(arr, (timestamp, chr(0x10FFFF))) - 1
            if i < 0:
                return None
            return arr[i][1]
```

**Complexity:** set O(1) amortized append; get O(log n) per key history.

## Verbal tests to narrate

1. set a@1, b@2; get@1→a; get@3→b; get@0→None
2. Multiple keys independent
3. Duplicate timestamp policy — confirm with interviewer (overwrite vs reject)

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| bisect keying | Pair (ts, value) ordering pitfalls — prefer parallel ts/val arrays |
| Memory | Bound history; downsample old versions |
| Distributed | Versioned stores / MVCC — only if asked |

## What not to discuss

- Building Cassandra in 40 minutes
- Ignoring the non-decreasing timestamp assumption without asking

## What's expected at each level

- **Mid-level:** Linear scan works.
- **Senior:** Binary search + clean API.
- **Staff+:** Concurrency + memory bounds + bisect edge cases.
- **Principal:** Relates to real config/feature-flag versioning systems.

## Related

- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
