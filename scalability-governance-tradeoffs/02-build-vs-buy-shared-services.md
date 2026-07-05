# Build vs. buy (or embed) for shared services

## The question, as it might actually be asked

"You've identified a capability two or more teams/services need — say, cost tracking, or
notification delivery. Do you build it as a shared service, embed the logic in each consumer,
or buy a vendor solution? Walk me through how you'd decide."

## The framework

Three real options, each with a real cost:

1. **Embed the logic in each consumer.** Fastest to ship for the first consumer. Gets
   progressively worse with each additional consumer — N copies of the same logic drift apart,
   and there's no way to answer a cross-consumer question (a total, a comparison) without
   reconciling N independently-evolving implementations after the fact.
2. **Build a shared, standalone service.** Higher upfront cost (a new deployable, a new
   interface contract, consumers must integrate over a network call instead of a function call).
   Pays off specifically when a cross-consumer question is a real requirement, not just a nice-
   to-have — because only a shared source of truth can answer it correctly.
3. **Buy a vendor solution.** Right when the capability is genuinely commodity and undifferentiated
   — the org gains nothing from owning the implementation. Wrong when the capability needs deep
   integration with your own domain model (which "generic" vendor tools rarely fit cleanly), or
   when the vendor relationship itself becomes the new coupling problem (see
   [behavioral/04](../behavioral/04-payments-and-edi-modernization.md)'s EDI story — a licensed
   vendor integration that became the thing worth migrating *away* from).

## The worked example, not hypothetical

**[agent-finops](https://github.com/vpeetla-ai/agent-finops)** is the real decision, not a
thought experiment. Two platforms (AegisAI, AegisLoop) both needed real cost metering. The
first draft of the fix chose option 1 — embed corrected logic in each repo separately. Midway
through planning, the requirement that actually mattered surfaced: **a real cross-tenant budget
total is impossible with option 1.** Two repos independently computing "their own" cost can
never answer "what is our total AI spend right now" without a shared ledger underneath both.
That single requirement — which wasn't explicit in the original ask, but became obvious once
actually reasoning through what "real cost governance" should mean — flipped the decision to
option 2: a standalone repo, `agent-finops`, matching how every other capability in this org is
already its own single-purpose service (see [ADR-011](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-011-agent-finops-standalone-service.md)).

Option 3 (buy) was never seriously on the table here — cost metering needs to understand each
consumer's specific LLM providers and per-model pricing deeply enough that a generic vendor
FinOps tool wouldn't fit without as much integration work as building it, while giving up
control over exactly how budget breach enforcement connects to each consumer's own kill-switch/
dispatch-halt mechanism (see [system-design/01](../system-design/01-llm-inference-serving-at-scale.md)
for why that enforcement design needed to stay consumer-owned).

## The interview-ready summary

Ask what cross-consumer question, if any, this capability needs to answer. If there is one and
it's real, build a shared service — embedding will structurally never answer it. If there isn't
one, embedding is fine and a shared service is premature complexity. Buy only when the
capability is genuinely undifferentiated *and* doesn't need deep domain integration.

## Related

- [ADR-011: AgentFinOps as a standalone service](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-011-agent-finops-standalone-service.md)
- [behavioral/02: FinOps audit and fix](../behavioral/02-finops-audit-and-fix.md)
