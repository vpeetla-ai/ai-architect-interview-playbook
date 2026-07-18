# Find median from a data stream (Staff+ concurrent extension)


<!-- question-variants:v1 -->

## Expected question

"Design a data structure that receives integers from a stream and returns the median at any time."

## Variant forms

Interviewers often ask the same structure with different framing or Staff+ extensions — recognize the archetype:

- "Implement MedianFinder with addNum and findMedian."
- "Find the running median of a stream without sorting the full stream each time."
- "Make median updates and reads safe for concurrent callers."
- "What changes if the stream is too large to retain exactly?"
- "Return the 90th percentile instead of the median."
- "Support deletion or a sliding-window median."
- "How do two heaps stay balanced after every insert?"
- "How would you aggregate approximate medians across distributed shards?"

## The question, as it might actually be asked

Implement `add_num(value)` and `find_median()` for an unbounded stream of integers. `find_median()` should be O(1) after each insertion; do not resort all prior values per query.

## The framework

Clarify numeric domain, empty-stream behavior, and exact-vs-approximate requirements → show the lower/upper partition invariant → balance two heaps after each write → explain concurrency and distributed quantile boundaries only after the exact local solution is complete.

## Where this actually gets asked

Common in streaming analytics, observability, marketplace, and finance-adjacent loops. The Staff signal is knowing that the two-heaps answer is exact but stateful and unmergeable in a useful way across large shards; approximate sketches are often the production answer.

## Problem

Design a structure with `add_num(value)` and `find_median()` that reports the exact median of all values seen so far.

## Clarifying questions you should ask first

1. What should `find_median` do before any value is added?
2. Is median for an even count the average of the middle two values?
3. Are values integers only, and can their average overflow in the target language?
4. Do we need a sliding window or deletion? (not in the base problem)
5. Is the stream local and exact, or distributed and approximate at scale?

## Approach ladder

| Step | Idea |
|------|------|
| Brute | Append then sort on every query — O(n log n) query |
| Correct | Max-heap lower half + min-heap upper half, sizes differ by at most one — O(log n) add, O(1) median |
| Staff+ | One lock preserves both-heap invariant; for distributed percentiles use mergeable sketches such as t-digest/KLL |

## Reference solution (Python)

```python
from __future__ import annotations

import heapq
from threading import RLock


class MedianFinder:
    """Exact, thread-safe running median using two balanced heaps."""

    def __init__(self) -> None:
        self._lower: list[int] = []  # max-heap encoded as negated values
        self._upper: list[int] = []  # min-heap
        self._lock = RLock()

    def add_num(self, value: int) -> None:
        with self._lock:
            if not self._lower or value <= -self._lower[0]:
                heapq.heappush(self._lower, -value)
            else:
                heapq.heappush(self._upper, value)

            if len(self._lower) > len(self._upper) + 1:
                heapq.heappush(self._upper, -heapq.heappop(self._lower))
            elif len(self._upper) > len(self._lower):
                heapq.heappush(self._lower, -heapq.heappop(self._upper))

    def find_median(self) -> float:
        with self._lock:
            if not self._lower:
                raise ValueError("median is undefined for an empty stream")
            if len(self._lower) > len(self._upper):
                return float(-self._lower[0])
            return (-self._lower[0] + self._upper[0]) / 2.0
```

**Complexity:** `add_num` is O(log n), `find_median` is O(1), and space is O(n).

## Tests / edge cases

1. Add `1`, then median is `1.0`; add `2`, then median is `1.5`; add `3`, then median is `2.0`.
2. Repeated values and negative values preserve the partition invariant.
3. Empty stream raises a documented error rather than returning a misleading sentinel.
4. After every insertion, heap sizes differ by at most one and every lower value is at most every upper value.
5. Concurrent add/read operations cannot observe an item moved out of one heap but not yet placed in the other.

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| Lock scope | Both heaps form one invariant, so one lock covers insertion, rebalance, and median read |
| Sliding window | Heap deletion is awkward; add lazy-deletion maps or use an order-statistics tree |
| Approximation | KLL/t-digest sketches bound quantile error with bounded memory and merge across shards |
| Distributed merge | A shard's scalar median cannot be combined into a global median; send mergeable summaries or raw partitions |

## What's expected at each level

- **Mid-level:** Recognizes sorting repeatedly is too slow and reaches two heaps.
- **Senior:** States and maintains heap ordering and balance invariants.
- **Staff+:** Identifies concurrency as an atomic two-heap operation and distinguishes exact local state from mergeable approximation.
- **Principal:** Frames accuracy, memory, merge cost, late data, and per-tenant observability as product/SLO decisions.

## Follow-up questions to expect

- "Support removals." — Use lazy deletion plus heap cleanup, or switch to an ordered multiset.
- "Return p95." — Two heaps only solve the median cleanly; use an order-statistics structure or quantile sketch.
- "Aggregate across hosts." — Do not average medians; merge KLL/t-digest sketches and track their error bounds.

## Related

- [05-top-k-frequent-stream.md](05-top-k-frequent-stream.md)
- [03-time-based-kv-store.md](03-time-based-kv-store.md)
- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
