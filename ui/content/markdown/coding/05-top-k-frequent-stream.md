# Top-K frequent elements (stream-aware)

## The question, as it might actually be asked

Given an array of integers, return the `k` most frequent elements. Order among ties can be arbitrary unless specified.

## The framework

Clarify constraints → correct end-to-end solution → narrate complexity and tests → offer a Staff+ extension (concurrency, API contract, or failure mode) without turning a coding round into distributed system design. See Approach ladder and Staff+ deep dive below.

## Where this actually gets asked

Classic heap/hash medium. Staff+ extension: **streaming / approximate** (Count-Min + heap) when N does not fit in memory — mention without implementing a full sketch unless asked.

## Problem

Given an array of integers, return the `k` most frequent elements. Order among ties can be arbitrary unless specified.

## Clarifying questions you should ask first

1. Can entire array fit in memory?
2. Tie-breaking rules?
3. k relative to unique count?
4. Online/stream version needed?

## Approach ladder

| Step | Idea |
|------|------|
| Brute | Count + sort unique — O(u log u) |
| Correct | Count + size-k heap — O(n log k) |
| Staff+ | Stream: Count-Min Sketch + heap; error bounds |

## Reference solution (Python)

```python
from __future__ import annotations
from collections import Counter
import heapq

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    if k <= 0:
        return []
    counts = Counter(nums)
    # nsmallest on (-freq) via heapq.nlargest on freq
    return [x for x, _ in heapq.nlargest(k, counts.items(), key=lambda kv: kv[1])]
```

**Complexity:** O(n + u log k) time; O(u) space.

## Verbal tests to narrate

1. [1,1,1,2,2,3], k=2 → [1,2]
2. All unique, k=1 → any one
3. k equals unique count → all keys

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| Why heap not full sort | k << u |
| Stream | Sketch trades accuracy for memory — state error bound |
| Distributed | Local top-k + merge is approximate |

## What not to discuss

- Building a real-time analytics platform before the heap solution works
- Ignoring memory assumption

## What's expected at each level

- **Mid-level:** Counter + sort.
- **Senior:** Heap solution + complexity.
- **Staff+:** Streaming/approximate trade-off with clear error talk.
- **Principal:** Relates to real metrics pipelines and cardinality limits.

## Related

- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
