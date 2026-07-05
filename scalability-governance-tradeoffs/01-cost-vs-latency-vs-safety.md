# Cost vs. latency vs. safety — a reasoning framework

## The question, as it might actually be asked

"Every agent architecture decision seems to trade off cost, latency, and safety against each
other. How do you reason about which one wins in a given situation?"

## The framework

These three aren't a triangle where you permanently pick two — the right answer changes per
decision point in the same system, and a good architect can name which axis is non-negotiable
*for this specific call*, not just in general.

**Safety wins when the action is irreversible or customer-facing at scale.** A refund issuance,
a production config change, a message sent externally — these get human-in-the-loop gates
regardless of what it costs in latency or engineering time, because the cost of getting it wrong
is asymmetric: one bad autonomous refund is worse than the cumulative latency cost of every
refund needing approval.

**Latency wins when the user is waiting synchronously and the action is low-risk.** A RAG
answer, a classification, a routing decision — these should not wait on a policy engine that's
checking whether the *reply itself* needs approval when the actual risk is in a downstream tool
call, not the text generation.

**Cost wins when the other two are already satisfied and volume is the remaining variable.**
Once an action path is both safe (right gates in place) and fast enough (user isn't waiting on
something that should be async), the remaining optimization is genuinely about per-call cost —
this is where real token metering and budget enforcement (not guessed cost) actually matters,
because you're optimizing a number you can trust.

## Where this shows up for real, not hypothetically

- **Safety-first, accepted latency cost:** [AegisAI's gateway](https://github.com/vpeetla-ai/aegisai-enterprise-agent-platform)
  requires human approval for side-effecting tool calls above a risk threshold — the latency
  cost of waiting for a human is accepted because the action is irreversible.
- **Latency-first, accepted safety scope:** [enterprise_rag_platform](https://github.com/vpeetla-ai/enterprise_rag_platform)'s
  answer generation doesn't route through the full gateway HITL flow for every query — only
  high-risk-flagged answers (detected via guardrails) get an approval gate; most queries return
  synchronously.
- **Cost-first, once the other two were already handled:** [agent-finops](https://github.com/vpeetla-ai/agent-finops)
  exists specifically because cost optimization on guessed numbers is worthless — you can't
  make a real cost-vs-latency trade-off decision on a cost figure that was never real to begin
  with.

## The trap this framework avoids

Treating all three as always-on-in-tension leads to over-engineering every path with the
heaviest gate available "just in case." The actual skill is knowing, per decision point, which
axis is load-bearing right now — and being able to say so explicitly when asked, rather than
defaulting to "it depends" without naming what it depends *on*.

## Related

- [scalability-governance-tradeoffs/02: Build vs. buy for shared services](02-build-vs-buy-shared-services.md)
- [system-design/03: Agent/tool-use orchestration platform](../system-design/03-agent-tool-use-orchestration-platform.md)
