# Prefix-sum subarray patterns (Staff+ follow-ups)

## The question, as it might actually be asked

Given `nums` and `k`, return the number of contiguous subarrays whose sum equals `k`.

## The framework

Clarify constraints → correct end-to-end solution → narrate complexity and tests → offer a Staff+ extension (concurrency, API contract, or failure mode) without turning a coding round into distributed system design. See Approach ladder and Staff+ deep dive below.

## Where this actually gets asked

Meta/Google-style medium family: subarray sum equals K, etc. Staff+ is graded on **pattern recognition** and stating which variant they are solving — not memorizing 10 solutions blindly.

## Problem (primary)

Given `nums` and `k`, return the number of contiguous subarrays whose sum equals `k`.

## Clarifying questions you should ask first

1. Negatives allowed? (yes → can't use simple sliding window)
2. Empty subarray count?
3. Integer overflow concerns?
4. Follow-up variants expected?

## Approach ladder

| Step | Idea |
|------|------|
| Brute | All i..j sums — O(n²) |
| Correct | Prefix sums + hash map of counts — O(n) |
| Staff+ | Name sibling patterns and when window applies |

## Reference solution (Python)

```python
from __future__ import annotations
from collections import defaultdict

def subarray_sum_equals_k(nums: list[int], k: int) -> int:
    pref = 0
    seen: dict[int, int] = defaultdict(int)
    seen[0] = 1
    ans = 0
    for x in nums:
        pref += x
        ans += seen[pref - k]
        seen[pref] += 1
    return ans
```

**Complexity:** O(n) time; O(n) space.

## Verbal tests to narrate

1. [1,1,1], k=2 → 2
2. [1,2,3], k=3 → 2 ([1,2], [3])
3. Zeros / negatives if in prompt

## Pattern table (Staff+ talking track)

| Variant | Tool |
|---------|------|
| Sum equals k (with negatives) | Prefix + hashmap |
| Binary array / at most K zeros | Sliding window |
| Shortest subarray sum ≥ K (positives) | Window or deque on prefixes |
| Subarray sum divisible by k | Prefix mod k map |

## What not to discuss

- Jumping to segment trees for this medium
- Using sliding window when negatives are allowed (wrong)

## What's expected at each level

- **Mid-level:** O(n²) works.
- **Senior:** Prefix + map; explains why.
- **Staff+:** Chooses correct pattern family; states when window fails.
- **Principal:** Relates to real analytics / billing aggregation correctness.

## Follow-up questions to expect

- "What if all nums are positive?" — Answer: window may apply for some variants; still map for exact count equals k.

## Related

- [00-staff-plus-coding-bar.md](00-staff-plus-coding-bar.md)
- [../staff-plus-interview-craft/01-what-staff-plus-actually-signals.md](../staff-plus-interview-craft/01-what-staff-plus-actually-signals.md)
