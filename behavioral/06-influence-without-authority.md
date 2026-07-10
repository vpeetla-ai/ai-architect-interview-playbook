# Influencing a technical decision without authority

## The question, as it might actually be asked

"Tell me about a time you influenced a technical decision when you did not own the teams involved
and could not escalate your way to a mandate." This is a core Staff+ behavioral signal: durable
cross-team alignment via artifacts and incentives, not title. Answer with your own real experience —
the case study below is one real example of this competency, not the assignment.

## Situation

Across the vpeetla-ai org, multiple demos and platforms were independently inventing adjacent
patterns for governance of side effects (publish, notify, tool calls) and for agent skills
install — each repo slightly different, each "working," none shared. No single team owned
"platform standards," and nobody reported to anyone else across those repos.

## Task

Get independent repo owners to adopt a **shared** approach (AegisAI-style gateway before
irreversible actions; shared skills install from `vpeetla-ai-skills`) without a mandate from
above and without blocking anyone's launch calendar.

## Action

I treated influence as making the right path easier than the wrong one:

1. **Wrote the constraint down** in org agent instructions (`AGENTS.md` / skills): side effects
   require gateway or HITL; skills install is one scripted path — so new work defaulted to the
   shared pattern instead of inventing a fourth variant.
2. **Shipped reference implementations** in repos people already cared about (content-factory
   publish HITL, practice-arena/playbook as graded artifacts) rather than a slide deck asking for
   adoption.
3. **Cross-linked ADRs and interview playbook entries** so the "why" lived next to running code —
   reviewers could cite a real decision, not a preference.
4. **Avoided forcing rewrites mid-launch** — new work adopted the standard; migrations were
   opportunistic. That kept owners from experiencing the standard as a tax on their deadline.

The mechanism was artifacts + defaults + proof in production-shaped demos, not persuasion meetings.

## Result

New agent work in the org consistently routes irreversible actions through gateway/HITL patterns,
and skills bootstrap is a single documented install path. Divergence still exists in older corners
(honest: influence was partial), but the default for net-new systems stopped fragmenting.

## The follow-up question you should expect

**"What did you do when a team still refused?"** Answer: I narrowed the ask to the next greenfield
surface instead of demanding a rewrite, offered to pair on the first gateway integration, and
documented the risk of divergence in the ADR so the cost was visible if they revisited later.
Forcing a political win that reverts after the meeting is not influence.

## What's expected at each level

- **Mid-level:** describes convincing teammates on their own squad.
- **Senior:** cross-team agreement with a concrete proposal.
- **Staff+:** names the mechanism (RFC/defaults/reference impl) and durable adoption without authority.
- **Principal:** org-level standard with honest limits of influence and how dissent was handled.

## Related

- [03 Org-wide security hardening](03-org-wide-security-hardening.md) — related influence shape
- [05 Leading a 0-to-1 AI product](05-leading-a-0-to-1-ai-product-build.md)
