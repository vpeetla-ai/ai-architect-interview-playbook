# Implement an LRU cache (Staff+ concurrency extension)


<!-- question-variants:v1 -->

## Expected question

"Design a data structure that supports get(key) and put(key, value) in average O(1). When capacity is exceeded, evict the least recently used item."

## Variant forms

Interviewers often ask the same structure with different framing or Staff+ extensions — recognize the archetype:

- "Implement an LRU cache — then make get/put thread-safe."
- "Design LRU with TTL expiration in addition to capacity eviction."
- "How would you shard an LRU across threads without a global lock?"
- "Implement LFU instead — what's different from LRU?"
- "Add a get_or_load(key, loader) that prevents stampede under concurrency."
- "Design an LRU that reports hit rate metrics safely from multiple threads."
- "What breaks if you only use a HashMap without a doubly linked list?"
- "Extend to a distributed cache — where does the coding answer stop and system design begin?"

## The question, as it might actually be asked

Design a data structure that supports `get(key)` and `put(key, value)` in average O(1). When capacity is exceeded, evict the least recently used item. `get` and `put` both count as "use."

## The framework

Clarify constraints → correct end-to-end solution → narrate complexity and tests → offer a Staff+ extension (concurrency, API contract, or failure mode) without turning a coding round into distributed system design. See Approach ladder and Staff+ deep dive below.

## Where this actually gets asked

High-signal coding/design hybrid across FAANG-style loops (LRU is among the most cross-company tested structures). Staff angle is rarely "just HashMap + DLL" — interviewers push **thread safety**, sharding, or distributed cache boundaries. Keep distributed design brief unless they open that door; the coding round wants a correct concurrent API.

## Problem

Design a data structure that supports `get(key)` and `put(key, value)` in average O(1). When capacity is exceeded, evict the least recently used item. `get` and `put` both count as "use."

## Clarifying questions you should ask first

1. Capacity fixed at construction?
2. Single-threaded or concurrent callers?
3. Value overwrite on existing key — does it refresh recency? (yes)
4. Return sentinel vs exception on missing key?
5. Do we need `delete` / iteration? (usually no for MVP)

## Approach ladder

| Step | Idea |
|------|------|
| Brute | List scan for LRU — O(n) get/put |
| Correct | Hash map key→node + doubly linked list for recency — O(1) |
| Staff+ | Mutex around map+list; discuss sharded locks / lock-free as follow-up |

## Reference solution (Python)

```python
from __future__ import annotations
from dataclasses import dataclass
from threading import RLock
from typing import Generic, Hashable, Optional, TypeVar

K = TypeVar("K", bound=Hashable)
V = TypeVar("V")

@dataclass
class _Node(Generic[K, V]):
    key: K
    value: V
    prev: Optional["_Node[K, V]"] = None
    next: Optional["_Node[K, V]"] = None

class LRUCache(Generic[K, V]):
    """Thread-safe LRU with a single lock (correct, clear Staff+ baseline)."""

    def __init__(self, capacity: int) -> None:
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self.capacity = capacity
        self._map: dict[K, _Node[K, V]] = {}
        self._head: _Node[K, V] = _Node(None, None)  # type: ignore[arg-type]
        self._tail: _Node[K, V] = _Node(None, None)  # type: ignore[arg-type]
        self._head.next = self._tail
        self._tail.prev = self._head
        self._lock = RLock()

    def get(self, key: K) -> Optional[V]:
        with self._lock:
            node = self._map.get(key)
            if node is None:
                return None
            self._move_to_front(node)
            return node.value

    def put(self, key: K, value: V) -> None:
        with self._lock:
            node = self._map.get(key)
            if node is not None:
                node.value = value
                self._move_to_front(node)
                return
            node = _Node(key, value)
            self._map[key] = node
            self._add_front(node)
            if len(self._map) > self.capacity:
                lru = self._tail.prev
                assert lru is not None and lru is not self._head
                self._remove(lru)
                del self._map[lru.key]

    def _add_front(self, node: _Node[K, V]) -> None:
        nxt = self._head.next
        self._head.next = node
        node.prev = self._head
        node.next = nxt
        assert nxt is not None
        nxt.prev = node

    def _remove(self, node: _Node[K, V]) -> None:
        assert node.prev is not None and node.next is not None
        node.prev.next = node.next
        node.next.prev = node.prev
        node.prev = node.next = None

    def _move_to_front(self, node: _Node[K, V]) -> None:
        self._remove(node)
        self._add_front(node)
```

**Complexity:** get/put average O(1) time; O(capacity) space.

## Verbal tests to narrate

1. capacity=2; put(1,a), put(2,b), get(1)→a; put(3,c) evicts 2; get(2)→None
2. put same key twice refreshes order and updates value
3. Concurrent: two threads put different keys at capacity — no lost updates / corruption (lock)

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| Single lock | Correct and interview-friendly; throughput limited under contention |
| Sharding | N independent LRUs by `hash(key) % N` — weaker global LRU, higher throughput |
| Distributed cache | Different problem (network, consistency); don't derail unless asked |
| Metrics | Hit rate, eviction rate, lock wait time |

## What not to discuss

- Jumping straight to Redis Cluster before a correct local LRU
- Claiming lock-free without sketching the hard parts (ABA, memory order)
- Spending 20 minutes on ASCII art of the list

## What's expected at each level

- **Mid-level:** Working single-threaded LRU; may struggle with DLL edge cases.
- **Senior:** Clean O(1) LRU + complexity + tests.
- **Staff+:** Thread-safe API, clear lock scope, can discuss sharding trade-offs briefly.
- **Principal:** Connects to real cache ownership (hit-rate SLOs, stampede, multi-tenant isolation).

## Follow-up questions to expect

- "Make get/put lock-free" — Answer: hard; prefer sharded locks first.
- "LFU instead?" — Answer: different structure (freq lists / heap); clarify recency vs frequency product need.

## Related

- [../general-system-design/07-distributed-cache-cdn-layer.md](../general-system-design/07-distributed-cache-cdn-layer.md)
- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
