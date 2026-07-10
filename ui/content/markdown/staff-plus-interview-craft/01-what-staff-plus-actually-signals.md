# What Staff+ actually signals in interviews

## The question, as it might actually be asked

"How is a Staff / Principal interview different from Senior — and what are interviewers listening for?"

## The framework

Staff+ loops still include coding, system design, and behavioral rounds. The **weight and signal** change:

| Round | Senior signal | Staff+ / Principal signal |
|-------|---------------|---------------------------|
| Coding | Correct medium problem, clean code | End-to-end solution + complexity aloud + tests narrated + **when to stop optimizing** |
| System design | Components that work | Trade-offs with numbers, failure modes, **org/multi-team blast radius** |
| Behavioral | "I shipped X" | "I changed how the org ships" — leverage, not heroics |
| Cross-cutting | Depth in one area | Judgment under ambiguity; questions you ask before answering |

At Staff+, interviewers are hiring someone who **reduces ambiguity for others**. Speed-coding and buzzword architecture without constraints are downlevel signals.

## What to talk about (high leverage)

| Topic | Why it lands |
|-------|----------------|
| Constraints first (SLA, cost, tenancy, compliance) | Shows you design under reality |
| Explicit trade-offs with a chosen default | Staff+ owns the decision, not a menu |
| Failure modes and operability | Production ownership |
| How you'd roll out / measure success | Execution, not slides |
| What you'd defer and why | Scope control |

## What is unnecessary (or harmful)

| Anti-pattern | Why it hurts |
|--------------|--------------|
| Jumping to Kafka/K8s before requirements | Looks like pattern matching, not thinking |
| Optimizing Big-O before a correct solution | Senior trap; Staff+ still needs working code first |
| Claiming "we always use X at FAANG" without context | Unverifiable and brittle |
| Designing a distributed system in a 45-min coding round | Wrong round; wastes the clock |
| Reciting STAR stories with no metrics or risk | Behavioral without evidence |

## Interview-ready summary

Staff+ is judged on **judgment under constraints**. Show the decision, the discarded alternatives, and how you'd know you were wrong.

## What's expected at each level

- **Mid-level:** Completes the asked task; needs prompting for trade-offs.
- **Senior:** Solid design/code; trade-offs when asked; owns a service-sized scope.
- **Staff+:** Unprompted constraints, blast radius, and "what we won't do"; multi-team impact.
- **Principal:** Sets reusable principles others can apply; ties technical choices to org strategy and risk.

## Related

- [02-questions-you-should-ask.md](02-questions-you-should-ask.md)
- [03-what-not-to-waste-time-on.md](03-what-not-to-waste-time-on.md)
- [../coding/00-staff-plus-coding-bar.md](../coding/00-staff-plus-coding-bar.md)
