# Staffing reduction from 10 to 2 in a supply chain workflow

## The question, as it might actually be asked

"Tell me about a time you significantly reduced manual or operational effort through automation,
while keeping risk and reversibility under control." This tests judgment under real operational
stakes, not just the ability to automate — anyone can automate the easy 80%; the real signal is
what you did about the ambiguous 20% and how you knew it was safe to scale down. Answer with your
own real experience — the case study below is one real example of this competency, not the
assignment.

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
  this whole portfolio as "evals as a system layer, not an afterthought." Concretely, that meant
  checking three distinct things per decision, not one blended "looks right" pass: **structural
  correctness** (did the routing/classification output conform to the schema downstream systems
  required, not just read as plausible text), **grounding** (was the decision traceable to
  specific retrieved context, not an unsupported model guess), and **risk-tier classification**
  (would a wrong decision here be cheaply reversible, or would it touch something like a
  financial commitment or an external-facing action) — and it was specifically the risk-tier
  signal, not the other two, that decided whether a case got the human-approval gate or ran
  fully automated.

## Result

Staffing intensity in these targeted repeatable flows went from 10 people to 2 — not by
replacing judgment wholesale, but by automating the repeatable 80% and routing the genuinely
ambiguous 20% to the 2 people who remained, with an audit trail and evaluation harness backing
every automated decision.

## The follow-up question you should expect

**"How did you know it was safe to reduce staffing that much?"** The evaluation harness and
human-approval gates weren't retrofitted after the staffing reduction — they were built *before*
scaling volume, specifically so the reduction decision could be made on evidence (eval pass
rates broken out per risk tier, not one blended pass rate, plus audit trail review of every
gated decision) rather than optimism. The staffing number itself followed the eval evidence, not
the other way around — the automated share only grew as the structural-correctness and
grounding checks kept passing at volume; it wasn't a headcount target the automation was built
to justify after the fact. The org-wide practice this became — public,
open-source reference implementations of the same pattern
([VAP](https://github.com/vpeetla-ai/venkat-ai-platform),
[AegisAI](https://github.com/vpeetla-ai/aegisai-enterprise-agent-platform),
[AegisLoop](https://github.com/vpeetla-ai/aegisloop-agentops-workbench)) — is the generalized,
inspectable version of exactly this discipline.

## What's expected at each level

- **Mid-level:** describes what was automated and that headcount/effort went down; may not
  spontaneously mention how safety or quality was verified before scaling the automated share.
- **Senior:** quantifies the result with a real before/after number and names at least one
  concrete safeguard (a review gate, an eval check) unprompted, not just "we added monitoring."
- **Staff+:** explains why the split between fully-automated and human-gated paths was drawn
  where it was — tied to a specific risk signal (reversibility, financial exposure), not a
  blanket "human reviews everything risky" policy.
- **Principal:** connects the specific decision to a broader, reusable organizational principle
  (evals as a system layer, not an afterthought) and can defend the follow-up question — "how did
  you know it was safe" — with evidence (pass rates per risk tier, audit trail review), not
  confidence.

## Related

- [Full case study: Enterprise Agentic AI — Lucid Motors](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/case-studies/enterprise-agentic-ai-lucid.md)
- [system-design/03: Agent/tool-use orchestration platform](../ai-system-design/03-agent-tool-use-orchestration-platform.md)
