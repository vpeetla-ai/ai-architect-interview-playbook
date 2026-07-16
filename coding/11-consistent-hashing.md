# Implement consistent hashing with virtual nodes


<!-- question-variants:v1 -->

## Expected question

"Implement a consistent-hash ring that maps keys to nodes. Support add_node, remove_node, and get_node(key). Use virtual nodes."

## Variant forms

Interviewers often ask the same structure with different framing or Staff+ extensions — recognize the archetype:

- "Implement consistent hashing with virtual nodes."
- "How many virtual nodes per physical node — how do you choose?"
- "What happens to keys when a node is removed?"
- "Add weighted nodes (bigger machines get more of the ring)."
- "How do you avoid hotspots with a bad hash function?"
- "Rendezvous hashing vs consistent hashing — when?"
- "Make the ring concurrent for reads while rebalancing."
- "Connect this to memcached/CDN shard placement — keep it brief."

## The question, as it might actually be asked

Implement a consistent-hash ring that maps keys to nodes. Support `add_node`, `remove_node`, and `get_node(key)`. Use virtual nodes so load is roughly balanced when the cluster is small.

## The framework

Clarify constraints → correct end-to-end solution → narrate complexity and tests → offer a Staff+ extension (replication, weighted nodes, or migration) without turning coding into full distributed design.

## Where this actually gets asked

Staff+ coding / LLD bridge for caches, shard routers, and crawlers. Often follows "design a distributed cache" as an implementation slice.

## Problem

Build `ConsistentHashRing` with virtual nodes: each physical node is placed `v` times on a hash ring (e.g. SHA-1 or MD5 of `node_id#i`). `get_node(key)` finds the first clockwise virtual node.

## Clarifying questions you should ask first

1. Hash function? (any cryptographic or murmur — say it)
2. How many virtual nodes per physical?
3. Stable ordering on ties?
4. Replication factor (get N successors)? — Staff follow-up
5. Thread-safety?

## Approach ladder

| Step | Idea |
|------|------|
| Brute | `hash % N` — reshuffles almost all keys on membership change |
| Correct | Sorted ring of virtual nodes + bisect |
| Staff+ | Replicas = next K distinct physical nodes; weighted vnodes |

## Reference solution (Python)

```python
from __future__ import annotations
import hashlib
from bisect import bisect_right
from threading import RLock

def _h(s: str) -> int:
    return int(hashlib.sha1(s.encode()).hexdigest(), 16)

class ConsistentHashRing:
    def __init__(self, virtual_nodes: int = 100) -> None:
        if virtual_nodes < 1:
            raise ValueError("virtual_nodes must be >= 1")
        self.virtual_nodes = virtual_nodes
        self._lock = RLock()
        self._ring: list[int] = []          # sorted hashes
        self._hash_to_node: dict[int, str] = {}
        self._nodes: set[str] = set()

    def add_node(self, node: str) -> None:
        with self._lock:
            if node in self._nodes:
                return
            self._nodes.add(node)
            for i in range(self.virtual_nodes):
                hv = _h(f"{node}#{i}")
                if hv in self._hash_to_node:
                    continue  # extremely unlikely; skip duplicate slot
                self._hash_to_node[hv] = node
                idx = bisect_right(self._ring, hv)
                self._ring.insert(idx, hv)

    def remove_node(self, node: str) -> None:
        with self._lock:
            if node not in self._nodes:
                return
            self._nodes.remove(node)
            survivors: list[int] = []
            for hv in self._ring:
                if self._hash_to_node.get(hv) == node:
                    del self._hash_to_node[hv]
                else:
                    survivors.append(hv)
            self._ring = survivors

    def get_node(self, key: str) -> str | None:
        with self._lock:
            if not self._ring:
                return None
            hv = _h(key)
            idx = bisect_right(self._ring, hv) % len(self._ring)
            return self._hash_to_node[self._ring[idx]]
```

**Complexity:** get O(log V); add/remove O(v log V) with list insert — mention TreeMap / sorted dict for large v.

## Verbal tests to narrate

1. Empty ring → get returns None
2. One node → all keys map to it
3. Add second node → only a fraction of keys move (not ~all)
4. Remove a node → keys on that node remapped; others mostly stable

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| Why vnodes | Smooth load with few physical nodes |
| Migration | On add, only keys in affected arcs move |
| Replication | Walk ring for K distinct physical owners |
| Hot keys | Separate issue — vnode balance ≠ hot-key balance |

## What not to discuss

- Full Dynamo paper before the ring works
- Claiming zero key movement on membership change

## What's expected at each level

- **Mid-level:** hash % N.
- **Senior:** ring + virtual nodes + tests.
- **Staff+:** concurrency, migration intuition, replica placement.
- **Principal:** ties to cache/shard operational cost of rebalancing.

## Follow-up questions to expect

- "How do you weight a bigger node?" — more virtual nodes proportional to capacity.

## Related

- [../general-system-design/07-distributed-cache-cdn-layer.md](../general-system-design/07-distributed-cache-cdn-layer.md)
- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
