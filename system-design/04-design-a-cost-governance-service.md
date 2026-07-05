# Design a cost-governance service for AI agent fleets

## The question, as it might actually be asked

"Your company runs a dozen AI agents, each calling LLMs at different rates. Leadership wants to
know: how much are we actually spending, per agent, per team, right now — and can an agent be
stopped automatically before it blows through budget?"

## Real system

[agent-finops](https://github.com/vpeetla-ai/agent-finops) — a standalone cost-governance
microservice, built after an audit found two other platforms in the same org were faking this
exact capability.

## The trade-off most candidates get wrong

The instinctive shortcut: estimate cost from something easy to measure — output character
count, request count, a flat per-call rate — because wiring up real per-provider token
accounting into every agent feels like a lot of plumbing for a "just a dashboard" feature.

**Real finding, not hypothetical:** two production repos in this org did exactly that. One
computed monthly cost from static seed data that never updated. The other guessed token counts
from output character length — even in the code path making a real OpenAI-compatible call whose
response *already included the real token counts*, discarded. An architecture review that only
checks "does a cost number show up in the UI" would have missed both; the fix required reading
the actual LLM client code, not just the dashboard.

## The trade-off: embed the logic vs. build a shared service

**Real decision (ADR-011, agent-finops as a standalone service):** the first draft of this fix
embedded corrected cost logic separately in each of the two affected repos. Redirected mid-plan
to a third option: a new standalone repo, consistent with how every other capability in this
org (orchestration, governance, retrieval, fleet ops) is already its own single-purpose service.
The reasoning: a shared cost-governance service is the *only* way to get a real cross-tenant
budget total — two repos independently computing "their own" cost can never answer "what's our
total AI spend right now" without a shared ledger underneath both.

```mermaid
flowchart LR
    A[Consumer's real LLM call] --> B[real prompt_tokens, completion_tokens]
    B --> C[agent_finops_client.record_usage]
    C --> D[FastAPI ledger: real $ + running total vs budget]
    D --> E["{breached: bool} returned"]
    E -.->|consumer decides enforcement| F[Kill-switch / dispatch halt]
```

## The trade-off: who enforces the breach

**Real decision:** the service reports cost truth; it does not enforce. Each consumer's
enforcement mechanism already differs — AegisAI trips a real kill-switch (a persistent block);
AegisLoop halts further dispatch within the current mission (a one-time refusal, no persistent
state). A shared service that tried to also own enforcement would need to understand both
models, and would be wrong for the next consumer with a third model. Report the fact, let the
caller decide what "stop" means for its own architecture.

## What would be different if the constraints changed

- **If this needed to support 100+ tenants with strict per-tenant billing:** the `scope_type`
  design (`agent`/`tenant`/`repo`) already anticipates this, but the current SQLite/Postgres
  store would need read replicas or a time-series-optimized backend for the query patterns a
  real billing dashboard needs.
- **If real-time enforcement latency mattered (stopping a call mid-flight, not after):** the
  current model — record usage *after* a call completes, check breach on the next call — would
  need to move to pre-flight budget checks before a call is allowed to start at all, trading a
  network round-trip for tighter enforcement.

## Related

- [ADR-011: AgentFinOps as a standalone service](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-011-agent-finops-standalone-service.md)
- [ADR-012: Real FinOps metering wired into both consumers](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-012-aegisloop-finops-metering.md)
- See also [behavioral/02-finops-audit-and-fix.md](../behavioral/02-finops-audit-and-fix.md) for the story behind *how* this gap was found.
