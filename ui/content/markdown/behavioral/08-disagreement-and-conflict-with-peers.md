# Navigating deep technical disagreement with peers


<!-- question-variants:v1 -->

## Expected question

"Tell me about a time you strongly disagreed with a peer or partner team on a technical approach. How did you handle the conflict, and what was the outcome?"

## Variant forms

Interviewers often probe the same competency with different framing — recognize the archetype and answer with *your* story:

- "Tell me about a time you had a conflict with a coworker."
- "Describe disagreeing with an architect or tech lead on a design — what did you do?"
- "Tell me about a time you were wrong in a technical debate."
- "How do you handle it when two Senior/Staff engineers dig in on opposite solutions?"
- "Describe escalating a disagreement — when is it right vs political failure?"
- "Tell me about disagree-and-commit: you lost the argument but still executed."
- "Walk through a design review that got heated — how did you reset it?"
- "Tell me about conflict across org boundaries (platform vs product)."

## The question, as it might actually be asked

"Tell me about a time you strongly disagreed with a peer on a technical decision." Staff+ loops use
this to test **conflict under ambiguity**: evidence over ego, written decision records, and whether
you can disagree-and-commit without passive sabotage. Answer with your own story — the case study
below is one real example of the competency, not a script to memorize.

## Situation

In the vpeetla-ai portfolio, a product demo path wanted to call publish/notify side effects directly
from an agent graph for "speed in the demo," while platform guidance (and AegisAI-shaped patterns)
required gateway or HITL before irreversible actions. Both sides were acting in good faith: one
optimizing narrative polish for a deadline, the other optimizing a governance invariant that shows
up in interviews and real incident risk.

## Task

Resolve the disagreement without either (a) silently bypassing governance "just this once," or
(b) blocking the demo with a purist rewrite that missed the date. Leave a durable decision, not a
hallway truce.

## Action

1. **Restated the shared goal** in writing: ship a credible demo *and* keep side effects auditable —
   conflict was about sequence, not values.
2. **Made the risk concrete** with a one-page decision note: direct publish from the graph teaches
   the wrong pattern and creates a copy-paste hazard across repos; gateway/HITL is the org invariant.
3. **Proposed a narrow compromise**: keep the demo UX, but route the irreversible step through the
   existing interrupt/HITL path already shipped in ai-content-factory — no new platform, no bypass.
4. **Time-boxed the debate** (async RFC-style comment window) and explicitly offered
   disagree-and-commit if a named owner chose the bypass — with the risk logged in an ADR-style note.
5. **Avoided status games**: argued from incident class ("untracked side effect") rather than
   seniority.

## Result

The demo shipped on the governed path; the bypass was not taken. The decision note became reusable
language in org agent instructions (side effects require gateway or HITL). Honest limit: not every
disagreement ends this cleanly — the Staff+ signal is the mechanism (evidence, written options,
time-box, commit), not winning every argument.

## The follow-up question you should expect

**"What if they still refused?"** Answer: escalate on **risk and ownership**, not personality —
ask who accepts the incident class if the bypass ships; if leadership accepts, disagree-and-commit
and execute cleanly; if not, help implement the safer path. Never half-implement to "prove them
wrong."

## What's expected at each level

- **Mid-level:** describes a disagreement; may focus on emotions or "I convinced them."
- **Senior:** uses data/prototype; reaches a decision with the team.
- **Staff+:** writes options/trade-offs, time-boxes, names disagree-and-commit, preserves relationships
  and execution quality after losing or winning.
- **Principal:** turns the conflict into an org-level invariant or ADR so the debate does not recur
  every quarter; escalates on risk ownership, not ego.

## Related

- [06 Influence without authority](06-influence-without-authority.md)
- [07 Technical bet that failed](07-technical-bet-that-failed.md)
- [staff-plus-interview-craft/01 What Staff+ actually signals](../staff-plus-interview-craft/01-what-staff-plus-actually-signals.md)
