# Implement an idempotent event consumer


<!-- question-variants:v1 -->

## Expected question

"Implement an idempotent event consumer: given at-least-once delivery, process each `event_id` at most once for side effects, and advance the offset only after successful handling."

## Variant forms

Interviewers often ask the same structure with different framing or Staff+ extensions — recognize the archetype:

- "Consumers see duplicates — how do you make handlers safe?"
- "Implement process(event) with a processed-ids store."
- "Commit offsets before or after side effects — which is correct for at-least-once?"
- "What happens if we crash after the side effect but before offset commit?"
- "Add a poison-message path that skips and dead-letters."
- "Make the dedupe store safe under concurrent partition handlers."
- "How is this different from Kafka exactly-once transactions?"
- "Implement a tiny in-memory broker + consumer group to demo the contract."

## The question, as it might actually be asked

You receive events with unique `event_id`s from an at-least-once log (Kafka-style). Implement
`handle(event) -> HandleResult` that applies a side effect at most once per `event_id`, records
progress, and distinguishes success, duplicate, and poison failures. Define when the caller may
advance the offset.

## The framework

Clarify delivery contract → store dedupe keys durably with the side effect when possible → commit
offset only after success or intentional skip → offer Staff+ extension (concurrency, DLT, crash
windows) without turning the round into full Kafka cluster design. See Approach ladder and Staff+
deep dive below.

## Where this actually gets asked

Coding / LLD bridge for event-driven systems. Interviewers use it after or instead of pure
leet-code to see whether you understand **at-least-once + idempotency** (the production default)
versus waving at "exactly-once." Pairs with
[general-system-design/18](../general-system-design/18-event-driven-architecture-with-kafka.md)
and the in-memory pub/sub LLD in [09](09-design-inmemory-pubsub.md).

## Problem

Implement an idempotent consumer helper:

- `handle(event: Event) -> HandleResult` where `Event` has `event_id` and `payload`
- Side effect is provided as `apply(payload) -> None` (may raise)
- Duplicates must not re-apply side effects
- Poison / non-retryable errors can be marked skipped for offset advance + dead-letter hook
- Retryable errors must not advance progress

## Clarifying questions you should ask first

1. At-least-once, at-most-once, or transactional EOS assumed?
2. Is `event_id` globally unique, or unique per aggregate/stream?
3. Is the dedupe store in-memory for the interview, or should we narrate a DB unique constraint?
4. What exceptions are retryable vs poison?
5. Single-threaded handler or concurrent handlers on different partitions?

## Approach ladder

| Step | Idea |
|------|------|
| Brute | Always call `apply`; ignore duplicates |
| Correct | Record `event_id` before/with success; skip if already processed; commit only after success |
| Staff+ | Atomic inbox + side effect narrative; poison → DLT + skip; bound dedupe memory; concurrent safety |

## Reference solution (Python)

```python
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from threading import Lock
from typing import Callable, Protocol, Set


class HandleStatus(str, Enum):
    APPLIED = "applied"
    DUPLICATE = "duplicate"
    RETRY = "retry"
    POISON_SKIPPED = "poison_skipped"


@dataclass(frozen=True)
class Event:
    event_id: str
    payload: str


@dataclass(frozen=True)
class HandleResult:
    status: HandleStatus
    advance_offset: bool


class PoisonMessageError(Exception):
    """Non-retryable handler failure; safe to skip after dead-lettering."""


class RetryableError(Exception):
    """Transient failure; do not advance offset."""


class DeadLetter(Protocol):
    def send(self, event: Event, reason: str) -> None: ...


class IdempotentConsumer:
    """At-least-once safe helper: side effects once per event_id."""

    def __init__(
        self,
        apply: Callable[[str], None],
        dead_letter: DeadLetter | None = None,
        processed: Set[str] | None = None,
    ) -> None:
        self._apply = apply
        self._dead_letter = dead_letter
        self._processed: Set[str] = processed if processed is not None else set()
        self._in_flight: Set[str] = set()
        self._lock = Lock()

    def handle(self, event: Event) -> HandleResult:
        with self._lock:
            if event.event_id in self._processed:
                return HandleResult(HandleStatus.DUPLICATE, advance_offset=True)
            if event.event_id in self._in_flight:
                # Another worker is applying; caller should not advance (wait / retry delivery).
                return HandleResult(HandleStatus.RETRY, advance_offset=False)
            self._in_flight.add(event.event_id)

        try:
            self._apply(event.payload)
        except PoisonMessageError as exc:
            if self._dead_letter is not None:
                self._dead_letter.send(event, str(exc))
            with self._lock:
                self._in_flight.discard(event.event_id)
                self._processed.add(event.event_id)
            return HandleResult(HandleStatus.POISON_SKIPPED, advance_offset=True)
        except RetryableError:
            with self._lock:
                self._in_flight.discard(event.event_id)
            return HandleResult(HandleStatus.RETRY, advance_offset=False)
        except Exception:
            with self._lock:
                self._in_flight.discard(event.event_id)
            # Unknown errors: fail closed — do not commit progress.
            return HandleResult(HandleStatus.RETRY, advance_offset=False)

        with self._lock:
            self._in_flight.discard(event.event_id)
            # Crash window: if we die here, at-least-once redelivers; durable inbox/unique
            # constraint with the side effect closes this in production (Staff+ narrative).
            self._processed.add(event.event_id)
        return HandleResult(HandleStatus.APPLIED, advance_offset=True)
```

**Complexity:** O(1) average per event with a hash set; memory grows with distinct `event_id`s unless
bounded or externalized.

## Verbal tests to narrate

1. First delivery applies side effect and returns `advance_offset=True`.
2. Redelivery of same `event_id` returns `DUPLICATE`, does not call `apply` again.
3. `RetryableError` → `advance_offset=False` so the log redelivers.
4. `PoisonMessageError` → dead-letter once, mark processed, advance offset (skip).
5. Concurrent duplicate deliveries: only one `apply` wins (lock / unique constraint).

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| Crash window | Process-then-dedupe-in-memory still double-applies if crash is after side effect and before recording; production pairs side effect + inbox insert in one DB transaction, or uses an idempotent upsert keyed by `event_id` |
| Offset commit | Commit after success/skip; never commit before side effects for at-least-once business events |
| EOS vs this | Kafka transactions help atomic consume→produce; they do not make SMTP/charge APIs exactly-once — idempotency still required |
| Memory | Bound local caches; durable dedupe in DB/Redis with TTL only if business allows re-apply after expiry |
| Partitions | One consumer thread per partition keeps per-key order; dedupe store must still be correct across rebalances |

## What's expected at each level

- **Mid-level:** Checks a set before applying; explains duplicates from retries.
- **Senior:** Ties offset commit to success; separates retryable vs poison; writes clear tests.
- **Staff+:** Names the crash window, transactional inbox/outbox pairing, and why EOS ≠ no idempotency.
- **Principal:** Sets org standards for `event_id`, DLT ownership, and consumer lag / poison SLOs.

## Follow-up questions to expect

- "Commit sync vs async?" — Async commit risks more redelivery; sync after batch reduces duplicates at latency cost.
- "How do you dedupe without storing every id forever?" — Upsert natural business keys; compacted inbox keyed by aggregate version; TTL only when safe.
- "Show the outbox on the producer side." — Same interview often pivots to dual-write; see design entry 18.

## Related

- [09-design-inmemory-pubsub.md](09-design-inmemory-pubsub.md)
- [04-concurrent-bounded-queue.md](04-concurrent-bounded-queue.md)
- [18-circuit-breaker.md](18-circuit-breaker.md)
- [../general-system-design/18-event-driven-architecture-with-kafka.md](../general-system-design/18-event-driven-architecture-with-kafka.md)
- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
