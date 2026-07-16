# What not to waste time on in Staff+ interviews


<!-- question-variants:v1 -->

## Expected question

"What should I deliberately not spend time on in a Staff / Principal loop?"

## Variant forms

Interviewers (and reverse-interview moments) often ask the same meta-question differently — recognize the archetype:

- "What prep is low leverage for Staff+ interviews?"
- "Should I memorize 50 system design templates?"
- "Is leetcode Hard volume the right use of time for Staff coding?"
- "When is buzzword architecture a downlevel signal?"
- "What behavioral stories are too junior to bring to Staff?"
- "How much company-specific gossip should I study?"
- "Should I over-optimize resume keywords vs depth of 5–7 stories?"
- "What should I skip in the last 72 hours before the onsite?"

## The question, as it might actually be asked

"What should I deliberately *not* spend time on in a Staff / Principal loop?"

## The framework

Time is the scarce resource. Staff+ candidates lose offers by optimizing the wrong layer.

| Round | Do spend time | Do not spend time |
|-------|---------------|-------------------|
| Coding | Correctness, clarity, tests, complexity | Premature distributed design, micro-optimizations |
| System design | Requirements, 1–2 deep dives, failure modes | Drawing every microservice box |
| Behavioral | One story with metrics + risk | Five shallow stories |
| Closing | 2–3 high-signal questions | Comp negotiation in the technical round |

## Unnecessary discussion (common traps)

1. **Naming every AWS service** — Interviewers care about properties (consistency, durability), not logo bingo.
2. **LeetCode hard flex in a medium round** — If the problem is medium, ship medium well; then offer the Staff extension verbally.
3. **Rewriting company history** — Don't invent "at Google we always…" unless you can defend it.
4. **Perfect UML** — Prefer a clear data flow and API contract.
5. **Apologizing for not knowing a buzzword** — State the property you need and ask if a known tool is in play.

## Timebox cheat sheet (45–60 min)

| Phase | Coding | System design |
|-------|--------|---------------|
| Clarify | 3–5 min | 5–8 min |
| Approach | 5 min | 8–10 min (high-level) |
| Execute | 25–30 min | 20–25 min (1–2 deep dives) |
| Test / failure | 5 min | 5–8 min |
| Close / questions | 2–3 min | 2–3 min |

## Interview-ready summary

**Ship a clear decision under constraints.** Everything else is decoration.

## What's expected at each level

- **Mid-level:** Finishes something working; may run out of time on polish.
- **Senior:** Timeboxes; leaves tests/edge cases if needed but mentions them.
- **Staff+:** Protects the clock for the highest-signal deep dive; narrates what was deferred.
- **Principal:** Explicitly manages the interview agenda with the interviewer ("I'd like 10 minutes on failure modes").

## Related

- [01-what-staff-plus-actually-signals.md](01-what-staff-plus-actually-signals.md)
- [02-questions-you-should-ask.md](02-questions-you-should-ask.md)
- [../coding/00-staff-plus-coding-bar.md](../coding/00-staff-plus-coding-bar.md)
