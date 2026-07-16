# Design an in-memory pub/sub (LLD in code)


<!-- question-variants:v1 -->

## Expected question

"Implement an in-process pub/sub: subscribe(topic, handler), unsubscribe(sub_id), publish(topic, message) delivering to current subscribers."

## Variant forms

Interviewers often ask the same structure with different framing or Staff+ extensions — recognize the archetype:

- "Design in-memory pub/sub with slow handlers — sync vs async delivery?"
- "What happens if a handler throws during publish?"
- "Should publish copy the subscriber list to avoid concurrent mod issues?"
- "Add once-subscriptions and wildcard topics."
- "Backpressure: what if handlers can't keep up?"
- "Thread-safe subscribe/unsubscribe while publishing."
- "Ordered delivery per topic vs best-effort?"
- "How far is this from Kafka — where does the LLD stop?"

## The question, as it might actually be asked

Implement an in-process pub/sub: - `subscribe(topic, handler)` → subscription id - `unsubscribe(sub_id)` - `publish(topic, message)` — delivers to current subscribers Handlers may be slow; define semantics.

## The framework

Clarify constraints → correct end-to-end solution → narrate complexity and tests → offer a Staff+ extension (concurrency, API contract, or failure mode) without turning a coding round into distributed system design. See Approach ladder and Staff+ deep dive below.

## Where this actually gets asked

Low-level design / coding hybrid: API design + concurrency. Staff+ shows **subscription lifecycle**, backpressure, and what is explicitly out of scope (persistence, cross-process).

## Problem

Implement an in-process pub/sub:

- `subscribe(topic, handler)` → subscription id
- `unsubscribe(sub_id)`
- `publish(topic, message)` — delivers to current subscribers

Handlers may be slow; define semantics.

## Clarifying questions you should ask first

1. Sync vs async delivery?
2. If handler throws — continue others?
3. Subscribe during publish — see message?
4. Ordering guarantees per topic?
5. Backpressure when handlers are slow?

## Approach ladder

| Step | Idea |
|------|------|
| Brute | Dict topic→list handlers; call inline |
| Correct | Sub ids; copy subscriber list under lock before dispatch |
| Staff+ | Queue per subscriber; drop/block policies; metrics |

## Reference solution (Python)

```python
from __future__ import annotations
from dataclasses import dataclass, field
from threading import RLock
from typing import Callable, DefaultDict
from collections import defaultdict
import itertools

Handler = Callable[[str], None]

@dataclass
class _Sub:
    topic: str
    handler: Handler

class PubSub:
    def __init__(self) -> None:
        self._lock = RLock()
        self._subs: dict[int, _Sub] = {}
        self._by_topic: DefaultDict[str, set[int]] = defaultdict(set)
        self._ids = itertools.count(1)

    def subscribe(self, topic: str, handler: Handler) -> int:
        with self._lock:
            sid = next(self._ids)
            self._subs[sid] = _Sub(topic, handler)
            self._by_topic[topic].add(sid)
            return sid

    def unsubscribe(self, sub_id: int) -> None:
        with self._lock:
            sub = self._subs.pop(sub_id, None)
            if sub:
                self._by_topic[sub.topic].discard(sub_id)

    def publish(self, topic: str, message: str) -> None:
        with self._lock:
            ids = list(self._by_topic.get(topic, ()))
            handlers = [self._subs[i].handler for i in ids if i in self._subs]
        for h in handlers:  # outside lock — avoid deadlocks / long critical sections
            try:
                h(message)
            except Exception:
                # Staff+: log/metric; continue
                continue
```

**Complexity:** subscribe/unsubscribe O(1); publish O(subscribers).

## Verbal tests to narrate

1. Two subs same topic both receive
2. Unsubscribe stops delivery
3. Handler exception does not kill other handlers

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| Copy-on-publish | Snapshot under lock, dispatch outside |
| Slow handlers | Per-sub queue + drop oldest / block publisher |
| Process boundary | Redis Streams / NATS — different round |

## What not to discuss

- Exactly-once cross-datacenter messaging in this round
- Holding the lock while running user handlers

## What's expected at each level

- **Mid-level:** Dict of callbacks works single-threaded.
- **Senior:** Thread-safe subscribe + snapshot publish.
- **Staff+:** Exception isolation, backpressure policy, clear non-goals.
- **Principal:** Relates to real event-bus ownership and failure budgets.

## Related

- [04-concurrent-bounded-queue.md](04-concurrent-bounded-queue.md)
- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
