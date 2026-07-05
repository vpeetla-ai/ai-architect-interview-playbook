# AI Architect Interview Playbook

[![check-links](https://github.com/vpeetla-ai/ai-architect-interview-playbook/actions/workflows/check-links.yml/badge.svg)](https://github.com/vpeetla-ai/ai-architect-interview-playbook/actions/workflows/check-links.yml)
[![Org](https://img.shields.io/badge/GitHub-vpeetla--ai-blue)](https://github.com/vpeetla-ai)

Most interview-prep content is generic: "here's how you'd design a RAG system" as a thought
experiment. This repo is different in two ways. First, the `system-design/` questions follow
[hellointerview.com](https://www.hellointerview.com)'s answer structure — requirements, core
entities, API design, a high-level architecture, deep dives with real trade-off tables and
concrete numbers, and an explicit "what's expected at Mid/Senior/Staff+/Principal" breakdown —
rather than a shallow Q&A. Second, every entry either points at a system that's actually
shipped and running (with a real ADR, a real trade-off, a real bug found in production), or is
clearly marked as general framework content that hasn't been exercised against a specific
shipped decision yet.

**On sourcing**: the `system-design/` questions are grounded in real research into what's
publicly reported at OpenAI, Anthropic, Meta, Google/DeepMind, Microsoft, and Apple for AI
infrastructure roles — and that research came back honest, not flattering: verbatim,
company-attributed system design questions are genuinely scarce in public sources for these
specific roles. Each question's "Where this actually gets asked" section says plainly whether
it's backed by a real, sourced report or is a well-established archetype without one — the same
grounded-or-labeled discipline applied to sourcing as to the org-system callbacks.

**Companion repo:** [ai-architecture-portfolio](https://github.com/vpeetla-ai/ai-architecture-portfolio)
holds the ADRs and case studies this content is grounded in. This repo is the interview-format
layer on top of that — same real decisions, framed as "how would you explain this out loud."

## Who this serves

| Persona | Job-to-be-done |
|---------|----------------|
| Me, before an interview | Rehearse real trade-offs I've actually made, not improvise from scratch |
| Hiring panel / interviewer | See how a candidate reasons about trade-offs *and* verify the claims against real, running systems |
| Another engineer prepping for AI architect interviews | Borrow the structure — requirements → entities → design → deep dives → level expectations |

## Structure

```text
system-design/                     — 8 AI-infra system design questions, hellointerview-style depth
cloud-architecture/                — VPC design, container orchestration, PaaS vs IaC
behavioral/                        — STAR-method write-ups for real, cited outcomes
scalability-governance-tradeoffs/  — reasoning frameworks: cost vs latency vs safety, etc.
```

## Status — what's grounded in a real shipped system vs. general framework content

| Entry | Grounded in a real system? |
|-------|------------------------------|
| [system-design/01](system-design/01-llm-inference-serving-at-scale.md) — LLM inference serving at scale | ✅ [vllm-architecture-lab](https://github.com/vpeetla-ai/vllm-architecture-lab)'s real PagedAttention/scheduler simulator, [agent-finops](https://github.com/vpeetla-ai/agent-finops) for cost |
| [system-design/02](system-design/02-rag-platform-at-scale.md) — RAG platform at scale | ✅ [enterprise_rag_platform](https://github.com/vpeetla-ai/enterprise_rag_platform), ADR-002, ADR-0004, ADR-0005/016 |
| [system-design/03](system-design/03-agent-tool-use-orchestration-platform.md) — Agent/tool-use orchestration platform | ✅ [venkat-ai-platform](https://github.com/vpeetla-ai/venkat-ai-platform) + [aegisai-enterprise-agent-platform](https://github.com/vpeetla-ai/aegisai-enterprise-agent-platform), ADR-001, ADR-0005, ADR-013 |
| [system-design/04](system-design/04-feature-store-finetuning-data-pipeline.md) — Feature store / fine-tuning data pipeline | 🟡 General framework; real lineage-discipline callback to enterprise_rag_platform ADR-0005/016 |
| [system-design/05](system-design/05-content-moderation-safety-system.md) — Content moderation & safety system | ✅ enterprise_rag_platform's real `GuardrailService` (input redaction + output grounding checks) |
| [system-design/06](system-design/06-multimodal-search-recommendation-system.md) — Multimodal search / recommendation system | 🟡 General framework; partial real analog via enterprise_rag_platform's hybrid retrieval core |
| [system-design/07](system-design/07-llm-evaluation-observability-platform.md) — LLM evaluation & observability platform | ✅ [golden-eval-registry](https://github.com/vpeetla-ai/golden-eval-registry), ADR-014 — found a real fixture bug on first execution |
| [system-design/08](system-design/08-finetuning-rlhf-training-pipeline-at-scale.md) — Fine-tuning/RLHF training pipeline at scale | 🟡 General framework; real callbacks to agent-finops (cost) and golden-eval-registry (eval-gating) disciplines |
| [cloud-architecture/01](cloud-architecture/01-paas-vs-self-hosted-infra-tradeoffs.md) — PaaS vs. self-hosted infra | ✅ ADR-005, ADR-015, agent-finops ADR-0002, aegisai ADR-0006 |
| [cloud-architecture/02](cloud-architecture/02-vpc-and-network-boundary-design.md) — VPC & network boundary design | ✅ Real Terraform in `aegisai-enterprise-agent-platform/deploy/terraform/aws/` |
| [cloud-architecture/03](cloud-architecture/03-container-orchestration-choices.md) — Container orchestration choices | ✅ Both ECS Fargate and Cloud Run actually deployed, verified, and torn down (Phase C) |
| [behavioral/01](behavioral/01-staffing-reduction-10-to-2.md) — Staffing reduction (10→2) | ✅ Lucid Motors case study |
| [behavioral/02](behavioral/02-finops-audit-and-fix.md) — FinOps audit and fix | ✅ Substack essay → self-audit → agent-finops |
| [behavioral/03](behavioral/03-org-wide-security-hardening.md) — Org-wide security hardening | ✅ 6-repo auth-gate pass, 2026-07-03/04 |
| [behavioral/04](behavioral/04-payments-and-edi-modernization.md) — Payments & EDI modernization | ✅ Volvo Cars gulf-payments + supply-chain-EDI case studies |
| [scalability-governance-tradeoffs/01](scalability-governance-tradeoffs/01-cost-vs-latency-vs-safety.md) — Cost vs. latency vs. safety | 🟡 General framework, illustrated with real examples from this org |
| [scalability-governance-tradeoffs/02](scalability-governance-tradeoffs/02-build-vs-buy-shared-services.md) — Build vs. buy for shared services | ✅ agent-finops's "own repo vs. embed" decision (ADR-011) as the worked example |
| [scalability-governance-tradeoffs/03](scalability-governance-tradeoffs/03-centralize-vs-federate-governance.md) — Centralize vs. federate governance | ✅ VAP/AegisAI orchestration-vs-governance split (ADR-001) as the worked example |

## How to use this

Each `system-design/` entry follows: requirements (functional + non-functional) → core entities
→ API/interface → high-level design with a diagram → 2-3 deep dives with real trade-off tables
→ what's expected at each level → common follow-up questions. If you're prepping for a system
design interview, read the question, try answering it yourself first — including the level
breakdown, aim for the Staff+/Principal bar, not just "a working answer" — then compare against
this one.

The other three folders (`cloud-architecture/`, `behavioral/`, `scalability-governance-
tradeoffs/`) follow a lighter shape: the question, the real decision, why it was made, and the
follow-up an interviewer would likely ask next.
