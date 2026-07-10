# Debug: broken cache eviction

## The question, as it might actually be asked

A teammate's LRU-like cache sometimes returns stale values and occasionally grows past capacity. Here is a simplified buggy sketch: ```python class BuggyCache: def __init__(self, capacity: int): self.capacity = capacity self.data = {} # key -> value self.order = [] # keys, oldest at index 0 def get(self, key): if key not in self.data: return None # BUG 1: refreshes by append without removing old index self.order.append(key) return self.data[key] def put(self, key, value): self.data[key] = value self.order.append(key) # BUG 2: evicts using order[0] even if that key was refreshed while len(self.data) > self.capacity: old = self.order.pop(0) if old in self.data: del self.data[old] ``` Find the bugs, explain failure modes, and provide a correct fix (or point to the proper LRU structure).

## The framework

Clarify constraints → correct end-to-end solution → narrate complexity and tests → offer a Staff+ extension (concurrency, API contract, or failure mode) without turning a coding round into distributed system design. See Approach ladder and Staff+ deep dive below.

## Where this actually gets asked

2025–2026 loops increasingly use **debug/extend** instead of greenfield puzzles. You are given plausible code with a subtle bug; Staff+ narrates a hypothesis → test → fix loop.

## Problem

A teammate's LRU-like cache sometimes returns stale values and occasionally grows past capacity. Here is a simplified buggy sketch:

```python
class BuggyCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.data = {}          # key -> value
        self.order = []         # keys, oldest at index 0

    def get(self, key):
        if key not in self.data:
            return None
        # BUG 1: refreshes by append without removing old index
        self.order.append(key)
        return self.data[key]

    def put(self, key, value):
        self.data[key] = value
        self.order.append(key)
        # BUG 2: evicts using order[0] even if that key was refreshed
        while len(self.data) > self.capacity:
            old = self.order.pop(0)
            if old in self.data:
                del self.data[old]
```

Find the bugs, explain failure modes, and provide a correct fix (or point to the proper LRU structure).

## Clarifying questions you should ask first

1. Is this intended to be LRU or FIFO?
2. Are keys hashable / comparable?
3. Single-threaded?
4. Do we need O(1) or is O(n) acceptable for the fix in-interview?

## Approach ladder

| Step | Idea |
|------|------|
| Reproduce | Trace get/put sequence that exceeds capacity or evicts wrong key |
| Root cause | `order` allows duplicates; eviction pops stale indices |
| Fix | Remove previous key occurrences on refresh **or** use DLL+map |

## Reference fix (clear O(n) acceptable mid-interview; then note O(1))

```python
class FixedCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.data: dict = {}
        self.order: list = []

    def get(self, key):
        if key not in self.data:
            return None
        self.order.remove(key)  # O(n)
        self.order.append(key)
        return self.data[key]

    def put(self, key, value):
        if key in self.data:
            self.order.remove(key)
        self.data[key] = value
        self.order.append(key)
        while len(self.data) > self.capacity:
            old = self.order.pop(0)
            del self.data[old]
```

Staff+ then says: "For O(1), switch to HashMap + doubly linked list — see coding/01."

## Verbal tests to narrate

1. capacity=2; put 1, put 2, get 1, put 3 — buggy may delete wrong key / grow
2. After fix: 2 evicted, 1 and 3 remain

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| Debug narrative | Hypothesis → minimal repro → fix → complexity cost |
| Production | Metrics on size vs capacity; invariant asserts in tests |
| Why bugs survive | Missing property tests for eviction |

## What not to discuss

- Rewriting the whole service mesh
- Silent "I'd just use Redis" without explaining the local bug

## What's expected at each level

- **Mid-level:** Finds one bug with hints.
- **Senior:** Finds both; provides working fix.
- **Staff+:** Explains invariant, complexity trade-off, better structure.
- **Principal:** Connects to review culture / invariant testing in real caches.

## Related

- [01-lru-cache-with-concurrency.md](01-lru-cache-with-concurrency.md)
- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
