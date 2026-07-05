# Finding and fixing a real FinOps gap in my own org

## Situation

I'd written a Substack essay arguing that AI cost governance belongs in the architecture, not
bolted on as a dashboard after production traffic arrives — "AI cost is not a finance problem.
It is an architecture problem." That's an easy thesis to state and a much harder one to prove
you actually live by.

## Task

Audit my own portfolio's platforms against that exact thesis, rather than treating the essay as
a standalone piece of thought leadership disconnected from the systems I'd actually built.

## Action

Read the real LLM-client code in two platforms that both had a "FinOps" product module —
AegisAI and AegisLoop — not just their dashboards. Found that both were faking it in slightly
different ways: AegisAI's registry computed monthly cost from static seed data that never
updated after the initial seed. AegisLoop's cost estimate guessed token counts from *output
character length*, even in the code path making a real OpenAI-compatible call whose response
already contained the real `prompt_tokens`/`completion_tokens` — discarded, never read.

The first draft of the fix embedded corrected logic separately into each of the two repos. When
that felt wrong mid-plan (two repos independently computing "their own" cost can never produce
a real cross-tenant total), redirected to build a third, standalone service — a new repo,
`agent-finops`, matching how every other capability in this org is already its own
single-purpose service. Built it, verified it end-to-end against a live running instance (real
usage recorded, real budget set, real breach detected over real HTTP requests) before ever
wiring either original repo to it. Then wired both AegisAI (a real kill-switch trips on breach)
and AegisLoop (dispatch halts within the mission) as real consumers — replacing the fabricated
numbers with real per-call token metering end to end.

## Result

Both platforms now report real, metered cost instead of guessed numbers. The standalone service
also became the org's proof point for the thesis itself: the audit that found the gap is
itself the evidence the essay's argument was correct — a self-audit with a shipped fix, not
just an assertion.

## The follow-up question you should expect

**"Why didn't you just patch the two existing repos instead of building a third?"** Because the
actual capability needed — a real cross-repo budget total, not per-repo fragments — structurally
requires a shared ledger. Two repos each computing "their own" real cost still can't answer "what
is our total AI spend right now" without one canonical source underneath both. That's a
requirements insight that only became clear partway through planning, and the honest answer is
I changed the plan when I saw it, rather than defending the original approach because it was
already underway.

## Related

- [Substack: Enterprise AI FinOps Architecture](https://venkatapeetla.substack.com/p/enterprise-ai-finops-architecture)
- [ADR-011: AgentFinOps as a standalone service](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-011-agent-finops-standalone-service.md)
- [system-design/04: Design a cost-governance service](../system-design/04-design-a-cost-governance-service.md)
