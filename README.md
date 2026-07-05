# AI Architect Interview Playbook

[![check-links](https://github.com/vpeetla-ai/ai-architect-interview-playbook/actions/workflows/check-links.yml/badge.svg)](https://github.com/vpeetla-ai/ai-architect-interview-playbook/actions/workflows/check-links.yml)
[![Org](https://img.shields.io/badge/GitHub-vpeetla--ai-blue)](https://github.com/vpeetla-ai)

Most interview-prep content is generic: "here's how you'd design a RAG system" as a thought
experiment. This repo is different — every entry either answers a real interview-style question
by pointing at a system that's actually shipped and running (with a real ADR, a real trade-off,
a real bug found in production), or is clearly marked as general framework content that hasn't
been exercised against a specific shipped decision yet.

**Companion repo:** [ai-architecture-portfolio](https://github.com/vpeetla-ai/ai-architecture-portfolio)
holds the ADRs and case studies this content is grounded in. This repo is the interview-format
layer on top of that — same real decisions, framed as "how would you explain this out loud."

## Who this serves

| Persona | Job-to-be-done |
|---------|----------------|
| Me, before an interview | Rehearse real trade-offs I've actually made, not improvise from scratch |
| Hiring panel / interviewer | See how a candidate reasons about trade-offs *and* verify the claims against real, running systems |
| Another engineer prepping for AI architect interviews | Borrow the structure — question → real system → diagram → trade-offs → why we decided |

## Structure

```text
system-design/                     — "design a governed RAG platform" style questions
cloud-architecture/                — VPC design, container orchestration, PaaS vs IaC
behavioral/                        — STAR-method write-ups for real, cited outcomes
scalability-governance-tradeoffs/  — reasoning frameworks: cost vs latency vs safety, etc.
```

## Status — what's grounded in a real shipped system vs. general framework content

| Entry | Grounded in a real system? |
|-------|------------------------------|
| [system-design/01](system-design/01-design-a-governed-rag-platform.md) — Design a governed RAG platform | ✅ [enterprise_rag_platform](https://github.com/vpeetla-ai/enterprise_rag_platform), ADR-002, ADR-0004, ADR-0005 |
| [system-design/02](system-design/02-design-a-multi-agent-orchestrator.md) — Design a multi-agent orchestrator | ✅ [venkat-ai-platform](https://github.com/vpeetla-ai/venkat-ai-platform), ADR-001, ADR-013 |
| [system-design/03](system-design/03-design-an-agent-governance-control-plane.md) — Design an agent governance control plane | ✅ [aegisai-enterprise-agent-platform](https://github.com/vpeetla-ai/aegisai-enterprise-agent-platform), ADR-004, ADR-0003, ADR-0005 (in-repo) |
| [system-design/04](system-design/04-design-a-cost-governance-service.md) — Design a cost-governance service | ✅ [agent-finops](https://github.com/vpeetla-ai/agent-finops), ADR-011, ADR-012 |
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

Each entry follows the same shape: the question as it might actually be asked → a real
architecture diagram → the trade-offs actually considered → why the real decision was made →
what it cost, in code or money or both → what would be different if a constraint changed. If
you're prepping for a system-design interview, read the question, try answering it yourself
first, then compare against the real decision — the gap between your answer and the real one is
usually more useful than either alone.
