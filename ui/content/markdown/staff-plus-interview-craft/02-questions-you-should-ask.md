# Questions you should ask in a Staff+ interview


<!-- question-variants:v1 -->

## Expected question

"What should I ask the interviewer — and when — if I'm interviewing for Staff or Principal?"

## Variant forms

Interviewers (and reverse-interview moments) often ask the same meta-question differently — recognize the archetype:

- "What questions impress in a Staff+ reverse interview?"
- "What should I ask about team scope, on-call, and decision rights?"
- "How do I probe whether Staff means IC leverage or disguised management?"
- "What questions reveal whether the org has real platform ownership?"
- "When do I ask about failure modes of the hiring team's architecture?"
- "What should I ask a hiring manager vs a peer interviewer?"
- "How do I ask about promotion criteria without sounding entitled?"
- "What questions help me decide to decline an offer?"

## The question, as it might actually be asked

"What should I ask the interviewer — and when — if I'm interviewing for Staff or Principal?"

## The framework

Asking sharp questions is itself a Staff+ signal. Weak questions waste the last five minutes; strong ones show how you'd operate on day one.

### During a coding round (first 2–3 minutes)

| Ask | Why |
|-----|-----|
| Input size / expected scale? | Chooses algorithm class |
| Single-threaded or concurrent? | Avoids wrong API |
| Mutability / in-place allowed? | Clarifies constraints |
| Exact vs approximate OK? | Unlocks streaming / sampling approaches |
| What should happen on invalid input? | API contract thinking |

### During system design (first 5 minutes)

| Ask | Why |
|-----|-----|
| Who is the primary user / tenant model? | Multi-tenant vs single |
| Read/write ratio and latency SLO? | Cache vs consistency |
| Cost ceiling or GPU budget? | FinOps as a first-class constraint |
| Compliance / data residency? | Architecture-shaping, not a footnote |
| What already exists in the org? | Avoid greenfield fantasy |

### With the hiring manager / bar raiser

| Ask | Why |
|-----|-----|
| Where does this org need Staff+ leverage most in the next 12–24 months? | Role fit |
| How is technical strategy set across teams? | Principal operating model |
| What does success look like in 6 months for this seat? | Scope clarity |
| How do you handle disagreement between Staff ICs and product? | Influence without authority |
| What recently went wrong in production that changed how you build? | Culture of learning |

## Weak questions (skip these)

| Question | Problem |
|----------|---------|
| "What tech stack do you use?" (alone) | Too generic; ask about constraints instead |
| "How many hours do people work?" | Fine later; not a Staff signal |
| "Did I do well?" | Puts interviewer in an awkward spot |

## Interview-ready summary

Budget questions like design decisions: **clarify constraints early, probe org leverage late**.

## What's expected at each level

- **Mid-level:** Asks clarifying questions when stuck.
- **Senior:** Clarifies requirements before coding/designing.
- **Staff+:** Asks questions that change the design; probes blast radius and org context.
- **Principal:** Asks about strategy, incentives, and how decisions stick across teams.

## Related

- [01-what-staff-plus-actually-signals.md](01-what-staff-plus-actually-signals.md)
- [03-what-not-to-waste-time-on.md](03-what-not-to-waste-time-on.md)
