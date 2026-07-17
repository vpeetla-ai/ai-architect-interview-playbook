# Design a hit counter (Staff+ distributed extension)


<!-- question-variants:v1 -->

## Expected question

"Design a hit counter that returns the number of hits received in the past five minutes."

## Variant forms

Interviewers often ask the same structure with different framing or Staff+ extensions — recognize the archetype:

- "Implement a hit counter for the last 300 seconds."
- "Record page views and return trailing five-minute traffic."
- "What if multiple hits arrive in the same second?"
- "Make hit and get_hits safe under concurrent callers."
- "What if timestamps arrive out of order?"
- "Use a fixed-size ring buffer instead of an unbounded queue."
- "How do you merge counters from many servers?"
- "How would you count one hour or arbitrary rolling windows?"

## The question, as it might actually be asked

Implement `hit(timestamp)` and `get_hits(timestamp)` for hits in the inclusive time window `[timestamp - 299, timestamp]`. Timestamps are in seconds and are non-decreasing in the base problem.

## The framework

Clarify window boundaries, timestamp order, granularity, and concurrency → aggregate identical seconds rather than enqueue every request → evict expired buckets on every public operation → explain that exact distributed aggregation requires coordinated event-time semantics, while local coding ends at a correct bounded counter.

## Where this actually gets asked

Common in observability, API-platform, and product-infrastructure interviews. At Staff level, candidates are expected to distinguish a per-process counter from a globally correct distributed metric and to name the effects of clock skew, late events, and shard failure.

## Problem

Design a counter with `hit(timestamp)` to record a hit and `get_hits(timestamp)` to return the number of hits in the trailing five-minute window.

## Clarifying questions you should ask first

1. Is the time window inclusive, and is it exactly 300 seconds?
2. Are timestamps non-decreasing, or can late/out-of-order events appear?
3. Is one-second granularity sufficient?
4. Is the counter process-local or globally aggregated?
5. What should happen when a caller supplies an earlier timestamp than the last observed time?

## Approach ladder

| Step | Idea |
|------|------|
| Brute | Store one timestamp per hit and scan all timestamps on every query |
| Correct | Queue `(second, count)` buckets and evict buckets older than the 300-second window |
| Staff+ | Lock bucket mutation and total together; use time-sharded aggregates with an explicit consistency/late-event contract |

## Reference solution (Python)

```python
from __future__ import annotations

from collections import deque
from threading import RLock


class HitCounter:
    """Thread-safe, process-local trailing 300-second hit counter."""

    _WINDOW_SECONDS = 300

    def __init__(self) -> None:
        self._buckets: deque[tuple[int, int]] = deque()
        self._total = 0
        self._last_timestamp: int | None = None
        self._lock = RLock()

    def hit(self, timestamp: int) -> None:
        with self._lock:
            self._validate_monotonic(timestamp)
            self._evict_expired(timestamp)
            if self._buckets and self._buckets[-1][0] == timestamp:
                second, count = self._buckets.pop()
                self._buckets.append((second, count + 1))
            else:
                self._buckets.append((timestamp, 1))
            self._total += 1
            self._last_timestamp = timestamp

    def get_hits(self, timestamp: int) -> int:
        with self._lock:
            self._validate_monotonic(timestamp)
            self._evict_expired(timestamp)
            self._last_timestamp = timestamp
            return self._total

    def _evict_expired(self, timestamp: int) -> None:
        oldest_allowed = timestamp - self._WINDOW_SECONDS + 1
        while self._buckets and self._buckets[0][0] < oldest_allowed:
            _, count = self._buckets.popleft()
            self._total -= count

    def _validate_monotonic(self, timestamp: int) -> None:
        if self._last_timestamp is not None and timestamp < self._last_timestamp:
            raise ValueError("timestamps must be non-decreasing")
```

**Complexity:** amortized O(1) per operation; the queue holds at most 300 per-second buckets for a continuously queried five-minute window.

## Tests / edge cases

1. Hits at `1`, `1`, and `2`; `get_hits(2)` returns `3`.
2. A hit at `1` is included by `get_hits(300)` and excluded by `get_hits(301)`.
3. A long idle period evicts all old buckets.
4. Many same-second hits use one bucket, not one queue entry per request.
5. Concurrent requests preserve the running total; out-of-order timestamps fail under the declared API contract.

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| Concurrency | Queue eviction, bucket merge, and total update must be one atomic operation |
| Fixed memory | A 300-slot ring buffer avoids allocations but needs epoch/timestamp checks before slot reuse |
| Shard merge | Publish per-shard time buckets, sum matching epochs, and define late-arrival/clock-skew tolerance |
| Metrics | Report staleness, dropped late events, shard coverage, and aggregation lag—not only the count |

## What's expected at each level

- **Mid-level:** Gets window eviction and boundary math mostly correct.
- **Senior:** Aggregates per second, explains amortized O(1), and tests the 300/301 boundary.
- **Staff+:** Makes concurrent mutation atomic and specifies distributed aggregation semantics rather than claiming a local queue is global.
- **Principal:** Connects metric correctness to dashboards, alerting, regional rollups, cost, and acceptable freshness/error budgets.

## Follow-up questions to expect

- "What if timestamps are unordered?" — Use a bounded map/ring by event-time bucket and define a late-event watermark.
- "Support an hour." — Parameterize the window; choose bucket size based on accuracy and memory.
- "Global count?" — Aggregate epoch-keyed buckets from shards; decide between eventual aggregation and a stronger centralized store.

## Related

- [02-rate-limiter-token-bucket.md](02-rate-limiter-token-bucket.md)
- [../general-system-design/01-distributed-rate-limiter.md](../general-system-design/01-distributed-rate-limiter.md)
- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
