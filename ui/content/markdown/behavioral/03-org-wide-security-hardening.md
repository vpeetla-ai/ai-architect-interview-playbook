# Finding and fixing unauthenticated endpoints across six repos

## The question, as it might actually be asked

"Tell me about a time you found the same class of problem repeated across multiple systems and
fixed it consistently, without breaking existing usage." This tests systemic thinking — the real
signal isn't fixing the one instance someone reported, it's going looking for every other place
the same pattern hides, and fixing them the same way rather than ad hoc per repo. Answer with
your own real experience — the case study below is one real example of this competency, not the
assignment.

## Situation

Running an eagle-view architecture review of a multi-repo AI agent portfolio, I went looking
for the gap between "this looks production-ready" and "this actually is." The recurring pattern
I was hunting for: expensive or side-effect-triggering endpoints (real LLM calls, real external
messages, real deploys) with zero caller authentication — the kind of gap that doesn't show up
in a demo, because the demo's own traffic is the only traffic anyone's ever sent it.

## Task

Find every instance of this pattern across the whole org and fix it consistently, without
breaking the "works with zero config" dev/demo experience every repo was built around.

## Action

Found the same anti-pattern independently in six repos: `loop-engine-agent-platform`'s
repo-fix endpoint, `sentinel-brief`'s `/runs` trigger, `aegisai-enterprise-agent-platform`'s
cron orchestrator routes, `venkat-ai-platform`'s chat/orchestrator/ingest/RAG/thread routes (the
widest blast radius — one unauthenticated route could send a real Slack/Telegram/WhatsApp
message), `enterprise_rag_platform`'s ingest/retrieve/answer routes, and
`aegisloop-agentops-workbench`'s mission-run routes in *both* its FastAPI backend and its
separate Netlify serverless function — the same gap, independently present in two different
runtimes for the same repo.

Fixed all six with the same pattern: an API-key header check, enforced **only when the key
environment variable is actually set**. Unset means open — the local dev/demo experience every
repo's README promises stays intact, but a real deployment gets real protection by configuring
one environment variable. No repo's default behavior changed; every repo's *deployable*
behavior did.

While fixing `enterprise_rag_platform` specifically, found and disclosed a second, adjacent
issue rather than treating the auth fix as complete: the API key gate closes "can anyone call
this API," but the `Principal` (tenant, groups, clearance) inside the request body remained
client-asserted — nothing verified the caller actually held the identity it claimed. Documented
this explicitly in the repo's own risk register rather than presenting the auth fix as a
complete guarantee it wasn't.

## Result

Six repos gained the same consistent, disclosed, opt-in auth gate. One additional real risk
(client-asserted Principal) was found and disclosed rather than silently left unaddressed
because it was adjacent to, but outside, the original fix's scope.

## The follow-up question you should expect

**"How did you make sure fixing this didn't just move the problem — e.g., someone forgets to
set the env var in production?"** Every repo's README status table and deploy docs were updated
alongside the code fix, explicitly calling out which env var to set on the real hosting
platform (Render) — the fix wasn't just code; it was disclosure, so the gap between "secure by
default in production" and "secure once you remember to configure it" is visible in the same
place someone would look before deploying, not buried in a commit message.

## What's expected at each level

- **Mid-level:** describes finding and fixing the issue in one or a few places; may not
  generalize to "how many other places does this exact pattern exist."
- **Senior:** describes actively searching for the same pattern elsewhere (not just fixing the
  one instance reported) and applying one consistent fix across every instance found.
- **Staff+:** explains a rollout design choice that let the fix ship without breaking existing
  usage (e.g., opt-in only when explicitly configured), and why that mattered more than shipping
  the "ideal" secure-by-default answer that would have broken the dev/demo experience.
- **Principal:** discloses a second, adjacent risk found during the fix that was outside the
  original scope, and explains why surfacing it — rather than presenting the original fix as a
  complete guarantee — was the right call.

## Related

- Case studies and ADRs for each fix: [ai-architecture-portfolio](https://github.com/vpeetla-ai/ai-architecture-portfolio) ADR-008, ADR-009, ADR-010, and each repo's own local ADR sequence
- [system-design/03: Agent/tool-use orchestration platform](../ai-system-design/03-agent-tool-use-orchestration-platform.md)
