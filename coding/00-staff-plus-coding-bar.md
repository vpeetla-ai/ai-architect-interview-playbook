# Staff+ coding bar — how this round is graded


<!-- question-variants:v1 -->

## Expected question

"We still do a coding round for Staff. What does a strong answer look like?"

## Variant forms

Interviewers often ask the same structure with different framing or Staff+ extensions — recognize the archetype:

- "How is Staff coding graded differently from mid-level?"
- "What do interviewers listen for if the problem is only medium difficulty?"
- "Should I offer concurrency and distributed design unprompted in a coding round?"
- "How much time should I spend clarifying vs coding vs testing aloud?"
- "What are downlevel signals in a Staff coding interview?"
- "How do I narrate complexity and tests without sounding scripted?"
- "When should I stop optimizing and declare the solution good enough?"
- "How do coding rounds differ at AI labs vs classic FAANG for Staff?"

## The question, as it might actually be asked

"We still do a coding round for Staff. What does a strong answer look like?"

## Where this actually gets asked

Coding remains in Staff / Principal loops at Meta, Google, Amazon, and many AI labs — often **one** round, medium difficulty, with heavier weight on communication and judgment than on puzzle novelty (public prep guides and coach reports, 2025–2026). Treat specific company attributions as archetypes unless you have a primary source.

## The framework

Staff+ coding is graded on judgment under constraints, not puzzle novelty.

## What interviewers listen for

| Signal | Strong | Weak |
|--------|--------|------|
| Clarifying questions | Scale, concurrency, API contract | Starts coding immediately |
| Solution | End-to-end correct | Partial clever fragment |
| Code quality | Readable names, clear invariants | Golfed one-liners |
| Complexity | Stated before/after coding | Never mentioned |
| Tests | Walks 2–3 cases aloud | "Looks right" |
| Staff extension | Concurrency / API / failure — when asked or briefly offered | Jumps to distributed systems unprompted |

## Clarifying questions you should ask first

See the pattern in every `coding/0N-*.md` entry. Default set:

1. Constraints on N / QPS / memory?
2. Single-threaded vs multi-threaded callers?
3. Exact semantics on ties, duplicates, nulls?
4. Mutate input or return new structures?

## What not to discuss in a coding round

- Full multi-region architecture (wrong round — point to system design)
- Rewriting the language runtime
- Claiming O(1) without an invariant
- Silence after writing code (always narrate tests)

## How to use this folder

1. Read the problem; timebox 5 minutes of clarifying + approach on paper
2. Implement without looking at the reference
3. Compare: approach ladder, Staff+ deep dive, "what not to discuss"
4. Practice saying complexity and two tests out loud

## What's expected at each level

- **Mid-level:** Working solution for the happy path; needs help on edges.
- **Senior:** Clean medium solution + complexity + basic tests.
- **Staff+:** Above, plus API clarity and a credible concurrency/production extension without derailing the clock.
- **Principal:** Teaches the interviewer the invariant; connects the structure to a real system they've owned.

## Related

- [../staff-plus-interview-craft/01-what-staff-plus-actually-signals.md](../staff-plus-interview-craft/01-what-staff-plus-actually-signals.md)
- [01-lru-cache-with-concurrency.md](01-lru-cache-with-concurrency.md)
