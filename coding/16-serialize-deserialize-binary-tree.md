# Serialize and deserialize a binary tree (Staff+ schema extension)


<!-- question-variants:v1 -->

## Expected question

"Serialize a binary tree to a string and deserialize the string back to the same tree."

## Variant forms

Interviewers often ask the same structure with different framing or Staff+ extensions — recognize the archetype:

- "Serialize and deserialize a binary tree using preorder traversal."
- "Use level-order encoding instead — what changes?"
- "How do you prove null children are represented unambiguously?"
- "Stream a very large tree without materializing its full serialized form."
- "Add a schema version so the format can evolve safely."
- "Reject malformed or truncated input rather than silently accepting it."
- "What if callers pass a graph with cycles instead of a tree?"
- "How would you make the wire format compact and language-independent?"

## The question, as it might actually be asked

Implement `serialize(root) -> str` and `deserialize(data) -> TreeNode | None` for a binary tree. The reconstructed tree must have the same values and shape, including missing children.

## The framework

Clarify value types, empty-tree marker, format stability, and malformed-input behavior → choose a traversal with explicit nulls → make encode/decode symmetric → add Staff+ concerns around schema versions, streaming records, and cycle rejection without confusing a tree codec with a general graph codec.

## Where this actually gets asked

Frequent in backend and infrastructure interviews because it tests recursive invariants, parser discipline, and wire-format trade-offs. Staff follow-ups expose whether you treat serialized data as an API: versioned, validated, observable, and bounded.

## Problem

Serialize a binary tree into a deterministic string and deserialize it into an equivalent tree. Values are integers for the reference implementation.

## Clarifying questions you should ask first

1. Are node values integers, strings with escaping needs, or arbitrary objects?
2. Must the output be deterministic and backward compatible?
3. Which malformed inputs should be rejected?
4. Can the input be very deep or large enough to require iterative/streaming traversal?
5. Is the input guaranteed to be a tree, or must we detect shared nodes/cycles?

## Approach ladder

| Step | Idea |
|------|------|
| Brute | Store object references — works only in-process and does not serialize |
| Correct | Preorder traversal with explicit null markers; consume tokens in the same order |
| Staff+ | Prefix a versioned schema, validate exact consumption, stream tokens, and reject cycles before recursion |

## Reference solution (Python)

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterator


@dataclass
class TreeNode:
    value: int
    left: "TreeNode | None" = None
    right: "TreeNode | None" = None


class Codec:
    _VERSION = "v1"
    _NULL = "#"

    def serialize(self, root: TreeNode | None) -> str:
        seen: set[int] = set()

        def encode(node: TreeNode | None) -> Iterator[str]:
            if node is None:
                yield self._NULL
                return
            identity = id(node)
            if identity in seen:
                raise ValueError("input contains a cycle or shared node")
            seen.add(identity)
            yield str(node.value)
            yield from encode(node.left)
            yield from encode(node.right)

        return ",".join([self._VERSION, *encode(root)])

    def deserialize(self, data: str) -> TreeNode | None:
        tokens = iter(data.split(","))
        if next(tokens, None) != self._VERSION:
            raise ValueError("unsupported or missing schema version")

        def decode() -> TreeNode | None:
            try:
                token = next(tokens)
            except StopIteration as error:
                raise ValueError("truncated tree payload") from error
            if token == self._NULL:
                return None
            try:
                value = int(token)
            except ValueError as error:
                raise ValueError(f"invalid node value: {token!r}") from error
            return TreeNode(value, decode(), decode())

        root = decode()
        if next(tokens, None) is not None:
            raise ValueError("payload contains trailing tokens")
        return root
```

**Complexity:** serialization and deserialization are O(n) time and O(n) output/auxiliary space; recursive call-stack depth is O(height).

## Tests / edge cases

1. Empty tree serializes to `v1,#` and deserializes to `None`.
2. A node with only one child preserves which side is absent.
3. Negative and multi-digit values round trip correctly.
4. Truncated, trailing, invalid-value, and unknown-version payloads fail explicitly.
5. A cyclic or shared-node object graph is rejected instead of causing nontermination or ambiguous tree output.

## Staff+ deep dive

| Topic | Talking point |
|-------|----------------|
| Schema evolution | Version each payload and maintain compatibility readers before changing field encoding |
| Streaming | Yield tokens to an output stream and parse incrementally to cap peak memory |
| Safety | Set max depth/bytes/nodes for untrusted payloads; recursion alone can become a denial-of-service vector |
| Cycles | Trees do not permit shared/cyclic nodes; use IDs and a graph codec if that is the real domain |

## What's expected at each level

- **Mid-level:** Includes null markers and reconstructs shape correctly.
- **Senior:** Produces symmetric traversal code and tests asymmetric trees.
- **Staff+:** Defines a stable wire contract, validation behavior, and limits for untrusted or large input.
- **Principal:** Connects schema ownership to migration rollout, cross-language compatibility, and operational observability.

## Follow-up questions to expect

- "Use BFS." — Include nulls in level order and trim only by a documented rule.
- "Values are strings." — Use length-prefix encoding or an escaping grammar; comma splitting is no longer sufficient.
- "The tree is huge." — Use iterative traversal and streaming I/O with explicit size and depth limits.

## Related

- [07-graph-clone-and-cycle-safe.md](07-graph-clone-and-cycle-safe.md)
- [06-merge-k-sorted-iterators.md](06-merge-k-sorted-iterators.md)
- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
