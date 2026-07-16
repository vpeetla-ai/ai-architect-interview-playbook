# Concurrent bounded blocking queue


<!-- question-variants:v1 -->

## Expected question

"Implement a bounded queue with put(item) (blocks if full) and take() (blocks if empty), safe for multiple producers and consumers."

## Variant forms

Interviewers often ask the same structure with different framing or Staff+ extensions — recognize the archetype:

- "Implement a blocking queue like ArrayBlockingQueue."
- "Add offer/poll with timeouts."
- "How do you avoid lost wakeups with condition variables?"
- "Support fair ordering of waiting producers/consumers?"
- "Implement using locks vs lock-free ring buffer — trade-offs?"
- "Add drainTo(list, max) for batch consumers."
- "What invariants must hold after every put/take?"
- "How do you test for deadlock and race conditions in an interview?"

## The question, as it might actually be asked

Implement a bounded queue with `put(item)` (blocks if full) and `take()` (blocks if empty), safe for multiple producers and consumers.

## The framework

Clarify constraints → correct end-to-end solution → narrate complexity and tests → offer a Staff+ extension (concurrency, API contract, or failure mode) without turning a coding round into distributed system design. See Approach ladder and Staff+ deep dive below.

## Where this actually gets asked

Concurrency classic (producer/consumer). Staff+ cares about **correct waiting**, spurious wakeups, and fairness — not clever lock-free unless prompted.

## Problem

Implement a bounded queue with `put(item)` (blocks if full) and `take()` (blocks if empty), safe for multiple producers and consumers.

## Clarifying questions you should ask first

1. Capacity fixed?
2. Timeout variants needed (`offer` / `poll`)?
3. Fair locking required?
4. Null items allowed?

## Approach ladder

| Step | Idea |
|------|------|
| Brute | Unbounded list + busy spin |
| Correct | `Condition` variables + mutex |
| Staff+ | Discuss disruption, poison-pill shutdown, metrics |

## Reference solution (Python)

```python
from __future__ import annotations
from collections import deque
from threading import Condition
from typing import Deque, Generic, TypeVar

T = TypeVar("T")

class BoundedBlockingQueue(Generic[T]):
    def __init__(self, capacity: int) -> None:
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self._capacity = capacity
        self._q: Deque[T] = deque()
        self._cv = Condition()

    def put(self, item: T) -> None:
        with self._cv:
            while len(self._q) >= self._capacity:
                self._cv.wait()
            self._q.append(item)
            self._cv.notify_all()

    def take(self) -> T:
        with self._cv:
            while not self._q:
                self._cv.wait()
            item = self._q.popleft()
            self._cv.notify_all()
            return item

    def size(self) -> int:
        with self._cv:
            return len(self._q)
```

**Complexity:** O(1) put/take amortized; blocking as required.

## Verbal tests to narrate

1. capacity=1: put blocks second producer until take
2. take on empty blocks until put
3. Multi producer/consumer smoke (narrate race freedom via monitor)

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| `while` not `if` | Spurious wakeup / multi-waiter correctness |
| notify vs notify_all | notify_all simpler; notify needs careful pairing |
| Shutdown | Poison pill or separate closed flag |
| Backpressure | Bounded queue *is* backpressure |

## What not to discuss

- Lock-free Michael-Scott queue unless interviewer asks
- Equating this with Kafka (different problem)

## What's expected at each level

- **Mid-level:** Mutex + queue; may miss wait conditions.
- **Senior:** Correct blocking with conditions.
- **Staff+:** Explains while-loops, shutdown, backpressure.
- **Principal:** Ties to real pipeline backpressure and overload control.

## Related

- [../general-system-design/04-distributed-job-scheduler-task-queue.md](../general-system-design/04-distributed-job-scheduler-task-queue.md)
- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
