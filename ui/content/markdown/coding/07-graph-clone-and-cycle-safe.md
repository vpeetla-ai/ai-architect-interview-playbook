# Clone a graph (cycle-safe)


<!-- question-variants:v1 -->

## Expected question

"Given a reference to a node in a connected undirected graph, return a deep copy. The graph may contain cycles."

## Variant forms

Interviewers often ask the same structure with different framing or Staff+ extensions — recognize the archetype:

- "Clone an undirected graph — handle cycles."
- "Clone a directed graph with possible cycles."
- "BFS vs DFS for cloning — which and why?"
- "What if node values are not unique?"
- "Clone only the connected component reachable from the start."
- "Serialize/deserialize the graph instead of cloning in memory."
- "How do you prove you didn't share neighbor references with the original?"
- "Extend to cloning with per-node metadata maps."

## The question, as it might actually be asked

Given a reference to a node in a connected undirected graph where each node has `val` and `neighbors`, return a deep copy. Graph may contain cycles.

## The framework

Clarify constraints → correct end-to-end solution → narrate complexity and tests → offer a Staff+ extension (concurrency, API contract, or failure mode) without turning a coding round into distributed system design. See Approach ladder and Staff+ deep dive below.

## Where this actually gets asked

Graph medium with cycles. Staff+ signal: **map of visited**, clear BFS vs DFS, and API for undirected vs directed.

## Problem

Given a reference to a node in a connected undirected graph where each node has `val` and `neighbors`, return a deep copy. Graph may contain cycles.

## Clarifying questions you should ask first

1. Undirected? Connected? Disconnected components?
2. Node vals unique? (often yes — don't assume for identity)
3. Mutate original allowed? (no)

## Approach ladder

| Step | Idea |
|------|------|
| Brute | Recurse without memo — infinite loop on cycles |
| Correct | HashMap old→new; DFS or BFS |
| Staff+ | Iterative BFS for stack safety; multi-component entrypoint |

## Reference solution (Python)

```python
from __future__ import annotations
from collections import deque
from dataclasses import dataclass, field

@dataclass
class Node:
    val: int
    neighbors: list["Node"] = field(default_factory=list)

def clone_graph(node: Node | None) -> Node | None:
    if node is None:
        return None
    mapping: dict[Node, Node] = {node: Node(node.val)}
    q: deque[Node] = deque([node])
    while q:
        cur = q.popleft()
        for nb in cur.neighbors:
            if nb not in mapping:
                mapping[nb] = Node(nb.val)
                q.append(nb)
            mapping[cur].neighbors.append(mapping[nb])
    return mapping[node]
```

**Complexity:** O(V+E) time and space.

## Verbal tests to narrate

1. Two nodes pointing at each other
2. Single node self-loop (if allowed) / no neighbors
3. Verify cloned neighbor identity ≠ original

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| Why map by object identity | Vals may collide in variants |
| DFS recursion depth | Prefer BFS/iterative for large graphs |
| Serialization | Clone vs serialize/deserialize trade-off |

## What not to discuss

- Distributed graph DBs
- Ignoring cycles

## What's expected at each level

- **Mid-level:** DFS clone; may miss cycles.
- **Senior:** Memoized BFS/DFS + tests.
- **Staff+:** Iterative, identity map, component discussion.
- **Principal:** Relates to real object-graph copy / config snapshot systems.

## Related

- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
