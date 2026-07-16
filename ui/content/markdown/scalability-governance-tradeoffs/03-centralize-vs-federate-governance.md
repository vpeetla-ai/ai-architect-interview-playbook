# Centralize vs. federate governance


<!-- question-variants:v1 -->

## Expected question

"As an org scales its number of AI agents and teams, do you centralize governance (one team, one policy engine, one audit trail) or federate it (each team owns its own policy checks)? What breaks in each direction?"

## Variant forms

Interviewers often ask the same trade-off with different framing — recognize the archetype:

- "Centralize vs federate AI governance — which would you pick for 20 agent teams?"
- "How do you avoid a central policy team becoming a ticket queue bottleneck?"
- "What breaks when every team invents its own approval gates?"
- "Design a hub-and-spoke model: central policy, federated agent runtimes."
- "How do you keep one audit trail without forcing one deployment cadence?"
- "When does federated governance fail compliance reviews?"
- "Walk me through graduating from federated experiments to centralized enforcement."
- "How do you let product teams move fast while security still has a choke point on side effects?"

## The question, as it might actually be asked

"As an org scales its number of AI agents and teams, do you centralize governance (one team,
one policy engine, one audit trail) or federate it (each team owns its own policy checks)? What
breaks in each direction?"

## The framework

**Centralize the decision surface; federate the implementation detail.** This isn't a binary —
the real skill is drawing the line correctly, not picking a side.

**What should centralize:** the policy engine, the audit trail format, the definition of "what
counts as high-risk," and the human-approval mechanism. If every team implements its own
version of "should this action require approval," you get inconsistent risk tolerance across
the org and no way to answer "what did any agent do last month" without querying N different
systems with N different schemas.

**What should stay federated:** which specific actions a given team's agents are allowed to
take, and the domain-specific logic for detecting risk in that team's context. A payments team's
definition of "high-risk action" (large refund amounts, unusual customer patterns) is
legitimately different from a content team's (publishing to an external channel, PII exposure)
— centralizing *that* logic into one team's ownership doesn't scale and isn't the actual
governance need.

## The worked example, not hypothetical

**[ADR-001: orchestration vs. governance split](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-001-orchestration-vs-governance-split.md)**
is this exact decision, made concrete: [VAP](https://github.com/vpeetla-ai/venkat-ai-platform)
owns orchestration (routing, specialist delegation — which changes constantly as new agents and
intents get added) as a genuinely separate system from
[AegisAI](https://github.com/vpeetla-ai/aegisai-enterprise-agent-platform), which owns
governance (policy decisions, HITL approval, signed audit — which should change rarely and
auditably, since policy changes are compliance events).

The instinctive design merges these — one big framework that both routes work and enforces
policy — because it looks simpler at first. It breaks down exactly at the point this framework
predicts: orchestration logic needs to iterate fast (new LangGraph nodes, new specialist
agents), while governance logic needs stability and auditability. Coupling them means either
governance changes get rushed through at orchestration's iteration speed (bad), or orchestration
changes get slowed down by governance's review cadence (also bad, for a different reason).

## The failure mode on each side, concretely

- **Over-centralized:** every team's agent action routes through one shared policy team as a
  bottleneck — teams either wait on that team for every new agent capability, or route around
  governance entirely to ship faster, which is worse than no governance at all because it looks
  governed without being governed.
- **Over-federated:** N teams each build their own "is this safe" logic, with no consistent
  audit format — an incident response or compliance audit has no single place to look, and risk
  tolerance varies by which team happened to build the check, not by actual risk.

## What's expected at each level

- **Mid-level:** frames it as one binary choice — centralize or federate — without drawing a
  line within a single system.
- **Senior:** correctly identifies at least one specific thing that should centralize and one
  that should stay federated, for a given, stated scenario.
- **Staff+:** draws the line with a concrete, reusable rule ("centralize the decision surface,
  federate the implementation detail") rather than a fresh case-by-case judgment call every time.
- **Principal:** describes the concrete failure mode on both sides — over-centralized and
  over-federated — with a real or realistic example of each, not just the theoretical risk.

## Related

- [ADR-001: Orchestration vs governance split](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-001-orchestration-vs-governance-split.md)
- [system-design/03: Agent/tool-use orchestration platform](../ai-system-design/03-agent-tool-use-orchestration-platform.md)
