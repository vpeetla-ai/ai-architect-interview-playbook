# Merge K sorted lists / iterators


<!-- question-variants:v1 -->

## Expected question

"Merge k sorted ascending integer lists into one sorted list (or yield via iterator)."

## Variant forms

Interviewers often ask the same structure with different framing or Staff+ extensions — recognize the archetype:

- "Merge K sorted lists — heap of size K."
- "Design a lazy iterator that merges without materializing all output."
- "What if some lists are empty or infinite streams?"
- "Merge K sorted files on disk that don't fit in memory."
- "Complexity vs pairwise merge tournament?"
- "Deduplicate while merging."
- "Merge by a custom comparator (timestamps + id)."
- "How do you unit-test the iterator contract (hasNext/next)?"

## The question, as it might actually be asked

Merge k sorted ascending integer lists into one sorted list (or yield via iterator).

## The framework

Clarify constraints → correct end-to-end solution → narrate complexity and tests → offer a Staff+ extension (concurrency, API contract, or failure mode) without turning a coding round into distributed system design. See Approach ladder and Staff+ deep dive below.

## Where this actually gets asked

Heap classic; Staff+ cares about **iterator API**, laziness, and external sort / k-way merge for files.

## Problem

Merge k sorted ascending integer lists into one sorted list (or yield via iterator).

## Clarifying questions you should ask first

1. Lists already sorted ascending?
2. Duplicates allowed?
3. Total length N, k lists — memory bound?
4. Return list vs lazy iterator?

## Approach ladder

| Step | Idea |
|------|------|
| Brute | Concat + sort — O(N log N) |
| Correct | Min-heap of (value, list_index, elem_index) — O(N log k) |
| Staff+ | Lazy iterator; external k-way merge |

## Reference solution (Python)

```python
from __future__ import annotations
import heapq
from typing import Iterator

def merge_k_sorted(lists: list[list[int]]) -> list[int]:
    heap: list[tuple[int, int, int]] = []
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst[0], i, 0))
    out: list[int] = []
    while heap:
        val, li, ei = heapq.heappop(heap)
        out.append(val)
        nxt = ei + 1
        if nxt < len(lists[li]):
            heapq.heappush(heap, (lists[li][nxt], li, nxt))
    return out

def merge_k_sorted_iter(lists: list[list[int]]) -> Iterator[int]:
    heap: list[tuple[int, int, int]] = []
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst[0], i, 0))
    while heap:
        val, li, ei = heapq.heappop(heap)
        yield val
        nxt = ei + 1
        if nxt < len(lists[li]):
            heapq.heappush(heap, (lists[li][nxt], li, nxt))
```

**Complexity:** O(N log k) time; O(k) heap space (+ output).

## Verbal tests to narrate

1. [[1,4,5],[1,3,4],[2,6]] → [1,1,2,3,4,4,5,6]
2. Empty lists mixed in
3. Single list identity

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| Why not pairwise merge | Tournament/heap better for large k |
| External sort | Same algorithm over file runs |
| Stability | Define if equal keys need source order |

## What not to discuss

- MapReduce job design before the heap works
- Premature parallel merge without measuring

## What's expected at each level

- **Mid-level:** Concat + sort.
- **Senior:** Heap merge + complexity.
- **Staff+:** Lazy API + external merge narrative.
- **Principal:** Connects to real log/compaction pipelines.

## Related

- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
