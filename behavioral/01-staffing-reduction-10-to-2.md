# Staffing reduction from 10 to 2 in a supply chain workflow

## Situation

At Lucid Motors, supply chain and operations teams were carrying high manual intensity in
repeatable workflows — intake, validation, exception handling, and routing. These weren't
one-off tasks; they were the same decision pattern repeated at volume, done by people because
no existing automation handled the judgment calls involved (ambiguous exceptions, routing
decisions that depended on context, not just fixed rules).

## Task

Design and ship agentic automation for these flows that could handle the actual judgment
involved — not just the mechanical parts — while keeping the failure modes visible and
recoverable, since this was operational work with real downstream consequences.

## Action

Built a multi-agent, multi-LLM architecture with retrieval, task routing, evaluation
checkpoints, human review paths, and production monitoring — not a single do-everything agent.
Three specific architectural choices mattered most:

- **Separated orchestration from retrieval**, so the model layer and the tool/data layer could
  evolve independently — a prompt change didn't require touching the RAG pipeline and vice
  versa.
- **Added human approval gates for high-risk actions** instead of full autonomy — the system
  handled the repeatable judgment calls but stopped and asked a human for anything above a risk
  threshold, rather than optimizing for zero human involvement.
- **Invested in evaluation harnesses early**, before scaling volume, rather than relying on
  anecdotal spot-checks of output quality — this is the same principle later generalized across
  this whole portfolio as "evals as a system layer, not an afterthought."

## Result

Staffing intensity in these targeted repeatable flows went from 10 people to 2 — not by
replacing judgment wholesale, but by automating the repeatable 80% and routing the genuinely
ambiguous 20% to the 2 people who remained, with an audit trail and evaluation harness backing
every automated decision.

## The follow-up question you should expect

**"How did you know it was safe to reduce staffing that much?"** The evaluation harness and
human-approval gates weren't retrofitted after the staffing reduction — they were built *before*
scaling volume, specifically so the reduction decision could be made on evidence (eval pass
rates, audit trail review) rather than optimism. The org-wide practice this became — public,
open-source reference implementations of the same pattern
([VAP](https://github.com/vpeetla-ai/venkat-ai-platform),
[AegisAI](https://github.com/vpeetla-ai/aegisai-enterprise-agent-platform),
[AegisLoop](https://github.com/vpeetla-ai/aegisloop-agentops-workbench)) — is the generalized,
inspectable version of exactly this discipline.

## Related

- [Full case study: Enterprise Agentic AI — Lucid Motors](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/case-studies/enterprise-agentic-ai-lucid.md)
- [system-design/03: Design an agent governance control plane](../system-design/03-design-an-agent-governance-control-plane.md)
