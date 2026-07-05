# AI Architect Interview Playbook

[![check-links](https://github.com/vpeetla-ai/ai-architect-interview-playbook/actions/workflows/check-links.yml/badge.svg)](https://github.com/vpeetla-ai/ai-architect-interview-playbook/actions/workflows/check-links.yml)
[![Org](https://img.shields.io/badge/GitHub-vpeetla--ai-blue)](https://github.com/vpeetla-ai)

Most interview-prep content is generic: "here's how you'd design a RAG system" as a thought
experiment. This repo is different in two ways. First, the `ai-system-design/` questions follow
[hellointerview.com](https://www.hellointerview.com)'s answer structure — requirements, core
entities, API design, a high-level architecture, deep dives with real trade-off tables and
concrete numbers, and an explicit "what's expected at Mid/Senior/Staff+/Principal" breakdown —
rather than a shallow Q&A. Second, every entry either points at a system that's actually
shipped and running (with a real ADR, a real trade-off, a real bug found in production), or is
clearly marked as general framework content that hasn't been exercised against a specific
shipped decision yet.

**On sourcing**: both `ai-system-design/` and `cloud-architecture/` are grounded in real research
into what's publicly reported at OpenAI, Anthropic, Meta, Google/DeepMind, Microsoft, and Apple
for AI infrastructure roles — and that research came back honest, not flattering: verbatim,
company-attributed interview questions are genuinely scarce in public sources for these specific
roles. Each question's "Where this actually gets asked" section says plainly whether it's backed
by a real, sourced report (an engineering blog, a public policy document, a documented incident)
or is a well-established archetype without one — the same grounded-or-labeled discipline applied
to sourcing as to the org-system callbacks. One research pass for `cloud-architecture/` also
caught and explicitly flagged a fabricated-looking, company-attributed cost figure circulating
on SEO content — see [cloud-architecture/03](cloud-architecture/03-disaster-recovery-for-model-serving.md)
for why it's excluded rather than quietly dropped. A later gap-analysis pass (adding
`ai-system-design/09-11` and `scalability-governance-tradeoffs/04`) caught two more of the same
pattern — an unsourced "Vertex AI incident" anecdote and an unattributed "Anthropic interview
stage" characterization, both traced to blog posts with no real citation and excluded — plus a
reported-but-unconfirmed Apple/Google dollar figure and model-size claim, both cited as
"reported," never as fact. Research for `general-system-design/` (the classic, non-AI-specific
round) found the opposite sourcing shape: this space is heavily documented publicly, but two
specific attributions turned out to be wrong on verification — one "Design Google Docs" citation
traced to a Netflix interview question, not Google's, and one "Design a distributed cache"
citation traced to Amazon, not any of this repo's six companies — both corrected in their
entries rather than repeated. The research also found OpenAI and Anthropic are the weakest-
sourced of the six for this classic round specifically: their public interview content is
described (by prep aggregators, not primary sources) as staying AI-infra-framed even in what
would otherwise be the "regular" round at other companies — worth knowing if you're prepping for
one of those two specifically.

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
ai-system-design/                  — 11 AI/ML system design questions, hellointerview-style depth
general-system-design/             — 7 classic distributed-systems questions, non-AI-specific, same depth
cloud-architecture/                — 6 AI-infra cloud/network/security questions, same depth
behavioral/                        — STAR-method write-ups for real, cited outcomes
scalability-governance-tradeoffs/  — reasoning frameworks: cost vs latency vs safety, etc.
```

Two different interview rounds, kept as two different folders rather than one blended list:
`ai-system-design/` is the AI/ML-specific round (LLM serving, RAG, agent orchestration, model
training/eval); `general-system-design/` is the classic "regular" distributed-systems round
these same six companies also run — rate limiters, chat systems, news feeds, job schedulers —
which doesn't require any AI-specific knowledge to answer well.

## Status — what's grounded in a real shipped system vs. general framework content

| Entry | Grounded in a real system? |
|-------|------------------------------|
| [ai-system-design/01](ai-system-design/01-llm-inference-serving-at-scale.md) — LLM inference serving at scale | ✅ [vllm-architecture-lab](https://github.com/vpeetla-ai/vllm-architecture-lab)'s real PagedAttention/scheduler simulator, [agent-finops](https://github.com/vpeetla-ai/agent-finops) for cost |
| [ai-system-design/02](ai-system-design/02-rag-platform-at-scale.md) — RAG platform at scale | ✅ [enterprise_rag_platform](https://github.com/vpeetla-ai/enterprise_rag_platform), ADR-002, ADR-0004, ADR-0005/016 |
| [ai-system-design/03](ai-system-design/03-agent-tool-use-orchestration-platform.md) — Agent/tool-use orchestration platform | ✅ [venkat-ai-platform](https://github.com/vpeetla-ai/venkat-ai-platform) + [aegisai-enterprise-agent-platform](https://github.com/vpeetla-ai/aegisai-enterprise-agent-platform), ADR-001, ADR-0005, ADR-013 |
| [ai-system-design/04](ai-system-design/04-feature-store-finetuning-data-pipeline.md) — Feature store / fine-tuning data pipeline | 🟡 General framework; real lineage-discipline callback to enterprise_rag_platform ADR-0005/016 |
| [ai-system-design/05](ai-system-design/05-content-moderation-safety-system.md) — Content moderation & safety system | ✅ enterprise_rag_platform's real `GuardrailService` (input redaction + output grounding checks) |
| [ai-system-design/06](ai-system-design/06-multimodal-search-recommendation-system.md) — Multimodal search / recommendation system | 🟡 General framework; partial real analog via enterprise_rag_platform's hybrid retrieval core |
| [ai-system-design/07](ai-system-design/07-llm-evaluation-observability-platform.md) — LLM evaluation & observability platform | ✅ [golden-eval-registry](https://github.com/vpeetla-ai/golden-eval-registry), ADR-014 — found a real fixture bug on first execution |
| [ai-system-design/08](ai-system-design/08-finetuning-rlhf-training-pipeline-at-scale.md) — Fine-tuning/RLHF training pipeline at scale | 🟡 General framework; real callbacks to agent-finops (cost) and golden-eval-registry (eval-gating) disciplines |
| [ai-system-design/09](ai-system-design/09-multi-tenant-ai-platform-architecture.md) — Multi-tenant AI platform architecture | 🟡 Real Azure/Vertex AI docs for the industry pattern; org callback via agent-finops |
| [ai-system-design/10](ai-system-design/10-ai-agent-sandboxing-and-code-execution-security.md) — AI agent sandboxing & code-execution security | ✅ Real Anthropic Claude Code sandboxing docs + aegisai's real `McpGovernanceProxy` as the same principle one layer up |
| [ai-system-design/11](ai-system-design/11-on-device-edge-ai-inference-architecture.md) — On-device/edge AI inference architecture | 🟡 Real Apple PCC/Google AICore/Meta Ray-Ban docs; no org-system analog at this scale |
| [general-system-design/01](general-system-design/01-distributed-rate-limiter.md) — Distributed rate limiter | 🟡 General archetype; real Google Cloud Armor grounding, no confirmed company attribution |
| [general-system-design/02](general-system-design/02-realtime-chat-messaging-at-scale.md) — Real-time chat/messaging at scale | ✅ Real WhatsApp/Meta engineering-blog sourcing (Erlang scaling talks, Messenger's "Iris" architecture) |
| [general-system-design/03](general-system-design/03-news-feed-ranking-system.md) — News feed / ranking system | ✅ Real Meta engineering-blog sourcing (Multifeed architecture, ML ranking pipeline) |
| [general-system-design/04](general-system-design/04-distributed-job-scheduler-task-queue.md) — Distributed job scheduler / task queue | ✅ Real Google SRE Book chapter on its distributed cron service + the Borg paper |
| [general-system-design/05](general-system-design/05-distributed-unique-id-generator.md) — Distributed unique ID generator | 🟡 General archetype; honestly discloses Snowflake is a Twitter system, not one of the six companies |
| [general-system-design/06](general-system-design/06-collaborative-document-editing.md) — Collaborative document editing | 🟡 Real Google Wave OT whitepaper grounding; corrects a mislabeled Netflix→Google attribution found during research |
| [general-system-design/07](general-system-design/07-distributed-cache-cdn-layer.md) — Distributed cache / CDN layer | ✅ Real Meta "Scaling Memcache at Facebook" NSDI paper; corrects a mislabeled Amazon→generic attribution found during research |
| [cloud-architecture/01](cloud-architecture/01-gpu-capacity-planning-and-procurement.md) — GPU capacity planning & procurement | 🟡 Real OpenAI/Meta engineering-blog evidence for the industry problem; org callback via agent-finops |
| [cloud-architecture/02](cloud-architecture/02-multi-region-strategy-training-vs-serving.md) — Multi-region strategy: training vs. serving | 🟡 General framework; weakest company-specific sourcing in this repo, disclosed as such |
| [cloud-architecture/03](cloud-architecture/03-disaster-recovery-for-model-serving.md) — Disaster recovery for model serving | 🟡 General framework; also documents a fabricated source caught and rejected during research |
| [cloud-architecture/04](cloud-architecture/04-network-architecture-for-distributed-training.md) — Network architecture for distributed training | ✅ Real Meta/OpenAI engineering-blog sourcing (RoCE, MRC) + real AWS VPC/security-group work (Phase C) |
| [cloud-architecture/05](cloud-architecture/05-security-and-compliance-architecture-for-ai-systems.md) — Security & compliance architecture for AI systems | ✅ Anthropic RSP, Meta Llama-weights leak, Apple PCC blog + real placeholder-API-key bug found and fixed |
| [cloud-architecture/06](cloud-architecture/06-container-orchestration-and-cost-optimization-at-scale.md) — Container orchestration & cost optimization at scale | ✅ Both ECS Fargate and Cloud Run actually deployed, verified, and torn down (Phase C) |
| [behavioral/01](behavioral/01-staffing-reduction-10-to-2.md) — Staffing reduction (10→2) | ✅ Lucid Motors case study |
| [behavioral/02](behavioral/02-finops-audit-and-fix.md) — FinOps audit and fix | ✅ Substack essay → self-audit → agent-finops |
| [behavioral/03](behavioral/03-org-wide-security-hardening.md) — Org-wide security hardening | ✅ 6-repo auth-gate pass, 2026-07-03/04 |
| [behavioral/04](behavioral/04-payments-and-edi-modernization.md) — Payments & EDI modernization | ✅ Volvo Cars gulf-payments + supply-chain-EDI case studies |
| [behavioral/05](behavioral/05-leading-a-0-to-1-ai-product-build.md) — Leading a 0-to-1 AI product build | ✅ ai-content-factory case study, ADR-008 |
| [scalability-governance-tradeoffs/01](scalability-governance-tradeoffs/01-cost-vs-latency-vs-safety.md) — Cost vs. latency vs. safety | 🟡 General framework, illustrated with real examples from this org |
| [scalability-governance-tradeoffs/02](scalability-governance-tradeoffs/02-build-vs-buy-shared-services.md) — Build vs. buy for shared services | ✅ agent-finops's "own repo vs. embed" decision (ADR-011) as the worked example |
| [scalability-governance-tradeoffs/03](scalability-governance-tradeoffs/03-centralize-vs-federate-governance.md) — Centralize vs. federate governance | ✅ VAP/AegisAI orchestration-vs-governance split (ADR-001) as the worked example |
| [scalability-governance-tradeoffs/04](scalability-governance-tradeoffs/04-build-vs-train-vs-finetune-foundation-model-strategy.md) — Build vs. train vs. fine-tune: foundation model strategy | 🟡 Real Meta/Anthropic/Apple strategy sourcing; org callback via vllm-architecture-lab's scope decision |

## How to use this

Each `ai-system-design/`, `general-system-design/`, and `cloud-architecture/` entry follows: requirements (functional +
non-functional) → core entities → API/interface → high-level design with a diagram → 2-4 deep
dives with real trade-off tables → what's expected at each level → common follow-up questions.
If you're prepping for a system design interview, read the question, try answering it yourself
first — including the level breakdown, aim for the Staff+/Principal bar, not just "a working
answer" — then compare against this one.

The other two folders (`behavioral/`, `scalability-governance-tradeoffs/`) follow a lighter
shape: the question, the real decision, why it was made, and the follow-up an interviewer would
likely ask next.
