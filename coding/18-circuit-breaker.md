# Implement a circuit breaker (Staff+ resilience extension)


<!-- question-variants:v1 -->

## Expected question

"Implement a circuit breaker with closed, open, and half-open states around an unreliable dependency."

## Variant forms

Interviewers often ask the same structure with different framing or Staff+ extensions — recognize the archetype:

- "Implement a circuit breaker around an HTTP client."
- "Model closed, open, and half-open transitions."
- "Open after N consecutive failures, then retry after a cooldown."
- "Make the breaker safe when many requests fail concurrently."
- "Should failure rate or consecutive failures trip the breaker?"
- "How do you limit half-open probe traffic?"
- "Add metrics and alerts for breaker state changes."
- "How does a circuit breaker differ from retries, timeouts, and bulkheads?"

## The question, as it might actually be asked

Implement a `call(operation)` wrapper. The breaker starts closed, opens after a configured number of consecutive failures, rejects calls while open, and permits one probe after a recovery timeout. A successful probe closes it; a failed probe reopens it.

## The framework

Clarify which failures count, timeout ownership, trip policy, and fallback behavior → write a small explicit state machine → hold a lock only for state transitions, never while invoking user code → add Staff+ concerns around metrics, probe stampedes, and bulkhead isolation.

## Where this actually gets asked

Appears in platform, SRE, payments, and distributed-systems coding rounds because it turns operational resilience into a testable local state machine. Staff candidates should know a breaker reduces cascading load; it does not replace deadlines, retries, admission control, or dependency isolation.

## Problem

Implement a circuit breaker that wraps an operation and transitions through `CLOSED`, `OPEN`, and `HALF_OPEN` safely under concurrent calls.

## Clarifying questions you should ask first

1. Which exceptions count as dependency failures versus caller/input errors?
2. Is the trip policy consecutive failures, failure rate, or both?
3. Who enforces operation timeouts: this wrapper or the caller?
4. How many half-open probes may execute concurrently?
5. Should rejected calls raise, return a fallback, or enqueue work elsewhere?

## Approach ladder

| Step | Idea |
|------|------|
| Brute | Retry every failing call independently; dependency receives more load during failure |
| Correct | Explicit state machine with failure threshold, cooldown, and one half-open probe |
| Staff+ | Lock state transitions only; emit state metrics, bound in-flight work with a bulkhead, and define distributed scope |

## Reference solution (Python)

```python
from __future__ import annotations

from enum import Enum
from threading import RLock
from time import monotonic
from typing import Callable, TypeVar


T = TypeVar("T")


class CircuitOpenError(RuntimeError):
    pass


class _State(str, Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


class CircuitBreaker:
    """Concurrent circuit breaker with one half-open probe at a time."""

    def __init__(self, failure_threshold: int = 3, recovery_seconds: float = 30.0) -> None:
        if failure_threshold <= 0 or recovery_seconds < 0:
            raise ValueError("invalid circuit-breaker configuration")
        self._failure_threshold = failure_threshold
        self._recovery_seconds = recovery_seconds
        self._state = _State.CLOSED
        self._failures = 0
        self._opened_at = 0.0
        self._probe_in_flight = False
        self._lock = RLock()

    def call(self, operation: Callable[[], T]) -> T:
        with self._lock:
            now = monotonic()
            if self._state is _State.OPEN:
                if now - self._opened_at < self._recovery_seconds:
                    raise CircuitOpenError("circuit is open")
                if self._probe_in_flight:
                    raise CircuitOpenError("half-open probe already in flight")
                self._state = _State.HALF_OPEN
                self._probe_in_flight = True
            elif self._state is _State.HALF_OPEN:
                raise CircuitOpenError("half-open probe already in flight")

        try:
            result = operation()
        except Exception:
            self._record_failure()
            raise
        else:
            self._record_success()
            return result

    def _record_failure(self) -> None:
        with self._lock:
            self._probe_in_flight = False
            self._failures += 1
            if self._state is _State.HALF_OPEN or self._failures >= self._failure_threshold:
                self._state = _State.OPEN
                self._opened_at = monotonic()

    def _record_success(self) -> None:
        with self._lock:
            self._state = _State.CLOSED
            self._failures = 0
            self._probe_in_flight = False
```

**Complexity:** O(1) state work per call; operation latency is outside the breaker. State is O(1).

## Tests / edge cases

1. Successful calls keep the breaker closed and reset the consecutive-failure count.
2. The Nth consecutive failure opens the breaker; later calls fail fast before invoking the operation.
3. After the recovery period, exactly one caller can execute the half-open probe.
4. A successful probe closes/reset the breaker; a failed probe reopens it and restarts cooldown.
5. Concurrent callers do not all become probes or execute user code while the breaker is open.

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| Metrics | Emit state transitions, rejected calls, probe outcome, dependency latency, and fallback rate with dependency labels |
| Concurrency | Never hold the state lock while running the dependency; that would serialize calls and can deadlock |
| Bulkhead | A breaker limits calls after failures; a semaphore/pool limits concurrent in-flight calls before failures cascade |
| Distributed scope | Prefer per-process breakers for fast local protection; central state can synchronize policy but adds a failure dependency |

## What's expected at each level

- **Mid-level:** Identifies the three states and implements basic transitions.
- **Senior:** Handles cooldown, reset behavior, and failure boundaries with tests.
- **Staff+:** Limits half-open probes under concurrency, separates breaker/retry/timeout responsibilities, and names useful metrics.
- **Principal:** Tunes policy by dependency and tenant, connects state to SLO/error-budget response, and designs coordinated but failure-tolerant rollout.

## Follow-up questions to expect

- "Use a failure rate window." — Track a bounded recent outcome window and require a minimum request volume before tripping.
- "Add retries." — Retry only idempotent calls with deadlines/jitter; breaker evaluates the final dependency outcome.
- "What is a bulkhead?" — Bound concurrency/queues per dependency so one slow downstream cannot exhaust all worker capacity.

## Related

- [04-concurrent-bounded-queue.md](04-concurrent-bounded-queue.md)
- [../general-system-design/04-distributed-job-scheduler-task-queue.md](../general-system-design/04-distributed-job-scheduler-task-queue.md)
- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
