# Implement a token-bucket rate limiter (in-process)

## The question, as it might actually be asked

Implement `allow(client_id) -> bool` using a token bucket: capacity `C`, refill `R` tokens per second. Each allowed request consumes 1 token. Reject when empty.

## The framework

Clarify constraints → correct end-to-end solution → narrate complexity and tests → offer a Staff+ extension (concurrency, API contract, or failure mode) without turning a coding round into distributed system design. See Approach ladder and Staff+ deep dive below.

## Where this actually gets asked

Coding sibling of the classic "design a rate limiter" system-design question. In coding rounds, expect an **in-process** or single-node API first; Redis/Lua atomicity is the Staff follow-up, not the opening move.

## Problem

Implement `allow(client_id) -> bool` using a token bucket: capacity `C`, refill `R` tokens per second. Each allowed request consumes 1 token. Reject when empty.

## Clarifying questions you should ask first

1. Per-client buckets or global?
2. Burst size = capacity?
3. Clock source / monotonic time?
4. Thread-safe?
5. Fail open or closed if state store fails? (for distributed follow-up)

## Approach ladder

| Step | Idea |
|------|------|
| Brute | Fixed window counter — easy, boundary burst 2× |
| Correct | Token bucket with last refill timestamp |
| Staff+ | Atomic update under lock; discuss Redis Lua for multi-node |

## Reference solution (Python)

```python
from __future__ import annotations
import time
from dataclasses import dataclass
from threading import Lock

@dataclass
class _Bucket:
    tokens: float
    last_ts: float

class TokenBucketLimiter:
    def __init__(self, capacity: float, refill_per_sec: float) -> None:
        if capacity <= 0 or refill_per_sec <= 0:
            raise ValueError("capacity and refill must be positive")
        self.capacity = capacity
        self.refill_per_sec = refill_per_sec
        self._buckets: dict[str, _Bucket] = {}
        self._lock = Lock()

    def allow(self, client_id: str, now: float | None = None) -> bool:
        now = time.monotonic() if now is None else now
        with self._lock:
            b = self._buckets.get(client_id)
            if b is None:
                b = _Bucket(tokens=self.capacity, last_ts=now)
                self._buckets[client_id] = b
            elapsed = max(0.0, now - b.last_ts)
            b.tokens = min(self.capacity, b.tokens + elapsed * self.refill_per_sec)
            b.last_ts = now
            if b.tokens < 1.0:
                return False
            b.tokens -= 1.0
            return True
```

**Complexity:** O(1) per allow; O(#clients) memory (mention TTL eviction of idle clients as Staff follow-up).

## Verbal tests to narrate

1. capacity=1, refill=1/s: allow→True, immediate allow→False, after 1s allow→True
2. capacity=5: five bursts succeed, sixth fails
3. Two clients independent

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| Fixed vs sliding vs token bucket | Burst vs smoothness vs accuracy |
| Multi-node | Shared Redis + Lua to avoid TOCTOU on GET/INCR |
| Fail open/closed | Product/security decision — say it explicitly |
| Idle client GC | Bound memory |

## What not to discuss

- Drawing a full multi-region mesh before the local algorithm works
- Claiming "exactly N per window" with token bucket (it's burst-friendly)

## What's expected at each level

- **Mid-level:** Fixed window works.
- **Senior:** Token bucket + tests + complexity.
- **Staff+:** Concurrency + multi-node atomicity + fail-open/closed.
- **Principal:** Ties limiter choice to abuse economics and customer UX SLOs.

## Follow-up questions to expect

- "How do you enforce 1000/day AND 10/s?" — Answer: two buckets / two rules, both must allow.

## Related

- [../general-system-design/01-distributed-rate-limiter.md](../general-system-design/01-distributed-rate-limiter.md)
- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
