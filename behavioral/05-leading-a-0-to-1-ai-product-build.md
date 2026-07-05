# Leading a 0-to-1 AI product build under real ambiguity

## Situation

Every other behavioral entry in this repo is "found a real gap in an existing system and fixed
it." [ai-content-factory](https://github.com/vpeetla-ai/ai-content-factory) is the different
case: building a governed, multi-agent content pipeline from nothing, where the ambiguity wasn't
"what's broken" but "what should this even do, and how much of it should ship for real vs. as a
demo" — the harder, less scripted version of the same judgment.

## Task

Ship a real product — one topic in, multiple platforms out, with human approval before anything
public gets posted — without the two easy failure modes: overbuilding (a fully autonomous
publisher nobody asked for and would create real compliance risk) or underbuilding (a demo that
looks impressive but where "publish" is fake).

## Action

The core architectural bet was made early and held: every irreversible step (posting content
publicly) gates behind a human, enforced with LangGraph's `interrupt_before=["hitl"]` and
AegisAI's `authorize_publish()` gateway check before any OAuth adapter fires — not a
configuration option, a structural property of the graph.

The harder judgment calls came from scope, not architecture. Real publish-API access exists for
LinkedIn and X; Medium, Substack, and Instagram don't offer a comparably real, stable posting API
for this kind of pipeline. The honest call — documented in
[ADR-008](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-008-real-publish-scope-and-invite-gating.md) —
was to build real OAuth+PKCE publish only for the two platforms where it was genuinely real, and
ship the other three as copy-draft export, disclosed as such in the product itself, rather than
fake an "auto-publish" for platforms where the pipeline would have had to work around API
limitations in ways that would break silently later. A real bug surfaced during this build, not
a hypothetical one: a LinkedIn URN formatting error in `publisher.py` that only showed up when
actually posting through the real API — fixed once real usage, not just unit tests against a
mocked client, exercised the actual integration.

Launch-readiness decisions followed the same discipline: invite-gated signup instead of open
signup with no usage data to inform pricing yet; a fail-open gateway in dev (for local velocity)
that's explicitly required to flip to fail-closed in production, not left ambiguous; Terms and
Privacy Policy pages shipped before real users, not retrofitted after.

## Result

A real, running product with real OAuth publish to two platforms, honest scope disclosure on the
other three, and a governance gate that's structural rather than optional. The invite-gating and
"ship billing later" decisions were made explicitly to avoid building speculative
infrastructure (a billing system) before there was real usage data to design it against —
deferred, not skipped.

## The follow-up question you should expect

**"How did you decide which platforms got real publish vs. copy-draft export, and how would you
defend that to a stakeholder who wanted all five platforms auto-publishing on day one?"** The
honest answer: faking auto-publish for a platform without a real, stable API creates a worse
failure mode than disclosing the limitation — a pipeline that silently breaks (or worse, posts
malformed content) on three of five platforms is a bigger trust and compliance risk than a
product that's honest about doing three things well and three things as a manual-friendly
export. Scoping down to what's real, and disclosing the gap rather than hiding it, was the
correct call even under pressure to look more complete on paper.

## Related

- [ADR-008: Real publish scope and invite-gating](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-008-real-publish-scope-and-invite-gating.md)
- [ai-content-factory case study](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/case-studies/ai-content-factory.md)
- [behavioral/02: FinOps audit and fix](02-finops-audit-and-fix.md) — the other real "changed the plan mid-build when a requirement surfaced" story in this repo
