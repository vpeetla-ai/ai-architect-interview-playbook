# AI Architect Interview Playbook

[![check-links](https://github.com/vpeetla-ai/ai-architect-interview-playbook/actions/workflows/check-links.yml/badge.svg)](https://github.com/vpeetla-ai/ai-architect-interview-playbook/actions/workflows/check-links.yml)
[![Org](https://img.shields.io/badge/GitHub-vpeetla--ai-blue)](https://github.com/vpeetla-ai)
[![Live Study UI](https://img.shields.io/badge/demo-live-brightgreen)](https://ai-architect-interview-playbook.vercel.app)

**Live study notebook:** [ai-architect-interview-playbook.vercel.app](https://ai-architect-interview-playbook.vercel.app) · Graded practice: [Practice Arena](https://ai-architect-practice-arena.vercel.app)

Most interview-prep content is generic: "here's how you'd design a RAG system" as a thought
experiment. This repo is different in two ways. First, the `ai-system-design/` questions follow
[hellointerview.com](https://www.hellointerview.com)'s six-step answer structure —
**Requirements → Core entities → API / interface → Data Flow → High-level design → Deep dives** —
where high-level design maps back to functional requirements and deep dives target non-functional
ones, plus real trade-off tables, concrete numbers, and an explicit "what's expected at
Mid/Senior/Staff+/Principal" breakdown — rather than a shallow Q&A. **Every graded entry**
(design, behavioral, coding, trade-off frameworks, and Staff+ craft) opens with an **Expected
question** and **Variant forms** block — the same archetype phrased different ways in real loops
(multi-tenant / SLA / 100× scale for design; competency rephrases for STAR; Staff+ extensions for
coding; decision-frame twists for trade-offs). Second, every entry either points at a system that's actually
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
one of those two specifically. A final end-to-end pass reviewed every entry against a genuine
Staff+/Principal bar (not a rubber-stamp check) and reworked the ones that read as thinner than
their neighbors — most notably `ai-system-design/06`, which had no real grounding and a generic
Principal-level claim, now rebuilt with concrete ANN-index numbers and a named position-bias
correction mechanism — plus two new entries the gap analysis found genuinely missing:
`ai-system-design/12` (training-data provenance/IP risk) and `/13` (durable long-running agent
execution).

**Companion repo:** [ai-architecture-portfolio](https://github.com/vpeetla-ai/ai-architecture-portfolio)
holds the ADRs and case studies this content is grounded in. This repo is the interview-format
layer on top of that — same real decisions, framed as "how would you explain this out loud."
Product repos link back here via `## Interview map` sections; the org matrix lives at
[REPO_INTERVIEW_MAP.md](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/docs/REPO_INTERVIEW_MAP.md).

## Who this serves

| Persona | Job-to-be-done |
|---------|----------------|
| Me, before an interview | Rehearse real trade-offs I've actually made, not improvise from scratch |
| Hiring panel / interviewer | See how a candidate reasons about trade-offs *and* verify the claims against real, running systems |
| Another engineer prepping for AI architect interviews | Borrow the structure — requirements → entities → API → data flow → HLD → deep dives → level expectations |

## Structure

```text
ai-system-design/                  — 21 AI/ML system design questions, hellointerview-style depth
general-system-design/             — 17 classic distributed-systems questions, non-AI-specific, same depth
cloud-architecture/                — 8 AI-infra cloud/network/security questions, same depth
behavioral/                        — 9 STAR-method write-ups for real, cited outcomes
scalability-governance-tradeoffs/  — 4 reasoning frameworks: cost vs latency vs safety, etc.
coding/                            — 19 Staff+ coding entries (bar + 18 problems)
staff-plus-interview-craft/        — 3 guides: signals, questions to ask, what not to waste time on
ui/                                — Study notebook (tables + reader) — Vercel static export
```

**81 graded study entries** — markdown is source of truth; live study UI: [ai-architect-interview-playbook.vercel.app](https://ai-architect-interview-playbook.vercel.app). Practice Arena syncs rubrics when the submodule is bumped.

Every entry in every folder, not just `ai-system-design/`, now ends with the same
"what's expected at Mid/Senior/Staff+/Principal" breakdown — added to `behavioral/` and
`scalability-governance-tradeoffs/` specifically so both categories are real, gradeable rubrics,
not just narrative content. `behavioral/` entries also open with a generic, reusable interview
question (distinct from the real case study that follows it) — a STAR write-up is one person's
specific real story, so answering it yourself means answering the same generic question with your
own experience, not reciting Lucid Motors' or Volvo's.

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
| [ai-system-design/06](ai-system-design/06-multimodal-search-recommendation-system.md) — Multimodal search / recommendation system | 🟡 General framework; partial real analog via enterprise_rag_platform's hybrid retrieval core; reworked with concrete ANN-index and position-bias mechanisms |
| [ai-system-design/07](ai-system-design/07-llm-evaluation-observability-platform.md) — LLM evaluation & observability platform | ✅ [golden-eval-registry](https://github.com/vpeetla-ai/golden-eval-registry), ADR-014 — found a real fixture bug on first execution |
| [ai-system-design/08](ai-system-design/08-finetuning-rlhf-training-pipeline-at-scale.md) — Fine-tuning/RLHF training pipeline at scale | 🟡 General framework; real callbacks to agent-finops (cost) and golden-eval-registry (eval-gating) disciplines |
| [ai-system-design/09](ai-system-design/09-multi-tenant-ai-platform-architecture.md) — Multi-tenant AI platform architecture | 🟡 Real Azure/Vertex AI docs for the industry pattern; org callback via agent-finops |
| [ai-system-design/10](ai-system-design/10-ai-agent-sandboxing-and-code-execution-security.md) — AI agent sandboxing & code-execution security | ✅ Real Anthropic Claude Code sandboxing docs + aegisai's real `McpGovernanceProxy` as the same principle one layer up |
| [ai-system-design/11](ai-system-design/11-on-device-edge-ai-inference-architecture.md) — On-device/edge AI inference architecture | 🟡 Real Apple PCC/Google AICore/Meta Ray-Ban docs; no org-system analog at this scale |
| [ai-system-design/12](ai-system-design/12-training-data-provenance-and-ip-risk-architecture.md) — Training-data provenance & IP-risk architecture | 🟡 Real public litigation (NYT v. OpenAI, Getty v. Stability); org callback via enterprise_rag_platform's real lineage-fix bug |
| [ai-system-design/13](ai-system-design/13-durable-long-running-agent-execution.md) — Durable long-running agent execution | 🟡 General framework (durable-execution pattern); real callback via ai-content-factory's shipped `interrupt_before` + Redis checkpointer |
| [ai-system-design/14](ai-system-design/14-chatgpt-style-conversational-service.md) — ChatGPT-style conversational service | 🟡 High-frequency product archetype; composes org patterns from serving/chat/safety/multi-tenant entries |
| [ai-system-design/15](ai-system-design/15-ai-coding-assistant.md) — AI coding assistant (Copilot-style) | 🟡 High-frequency GenAI product archetype (FIM/latency/index); adjacent to sandboxing + on-device entries |
| [ai-system-design/16](ai-system-design/16-llm-customer-support-assistant.md) — LLM customer-support assistant | 🟡 High-frequency product archetype; composes RAG + gateway + escalation |
| [ai-system-design/17](ai-system-design/17-llm-application-security-prompt-injection.md) — LLM application security / prompt injection | 🟡 High-frequency Staff+ app-sec archetype (OWASP LLM / tool exfil); composes gateway + sandbox entries |
| [ai-system-design/18](ai-system-design/18-ai-data-flywheel-and-human-feedback-platform.md) — AI data flywheel & human feedback | 🟡 ML-platform archetype; pairs with eval (07) and RLHF pipeline (08) |
| [ai-system-design/19](ai-system-design/19-model-release-canary-and-rollback.md) — Model release, canary & rollback | 🟡 Progressive-delivery archetype for models/prompts/tools |
| [ai-system-design/20](ai-system-design/20-persistent-ai-memory-and-personalization.md) — Persistent AI memory & personalization | 🟡 Consumer/enterprise memory archetype; write-policy + isolation focus |
| [ai-system-design/21](ai-system-design/21-realtime-voice-ai-assistant.md) — Real-time voice AI assistant | 🟡 High-frequency realtime product archetype (ASR/LLM/TTS + barge-in) |
| [general-system-design/01](general-system-design/01-distributed-rate-limiter.md) — Distributed rate limiter | 🟡 General archetype; real Google Cloud Armor grounding, no confirmed company attribution |
| [general-system-design/02](general-system-design/02-realtime-chat-messaging-at-scale.md) — Real-time chat/messaging at scale | ✅ Real WhatsApp/Meta engineering-blog sourcing (Erlang scaling talks, Messenger's "Iris" architecture) |
| [general-system-design/03](general-system-design/03-news-feed-ranking-system.md) — News feed / ranking system | ✅ Real Meta engineering-blog sourcing (Multifeed architecture, ML ranking pipeline) |
| [general-system-design/04](general-system-design/04-distributed-job-scheduler-task-queue.md) — Distributed job scheduler / task queue | ✅ Real Google SRE Book chapter on its distributed cron service + the Borg paper |
| [general-system-design/05](general-system-design/05-distributed-unique-id-generator.md) — Distributed unique ID generator | 🟡 General archetype; honestly discloses Snowflake is a Twitter system, not one of the six companies |
| [general-system-design/06](general-system-design/06-collaborative-document-editing.md) — Collaborative document editing | 🟡 Real Google Wave OT whitepaper grounding; corrects a mislabeled Netflix→Google attribution found during research |
| [general-system-design/07](general-system-design/07-distributed-cache-cdn-layer.md) — Distributed cache / CDN layer | ✅ Real Meta "Scaling Memcache at Facebook" NSDI paper; corrects a mislabeled Amazon→generic attribution found during research |
| [general-system-design/08](general-system-design/08-notification-system.md) — Notification system | 🟡 Top classic archetype (multi-channel fan-out); no single-company primary attribution claimed |
| [general-system-design/09](general-system-design/09-url-shortener.md) — URL shortener | 🟡 Canonical warm-up archetype (Bitly-style) |
| [general-system-design/10](general-system-design/10-video-streaming-platform.md) — Video streaming platform | 🟡 Classic hard archetype (YouTube/Netflix-style ABR + CDN) |
| [general-system-design/11](general-system-design/11-web-crawler.md) — Web crawler | 🟡 Classic polite-crawler archetype; ties to training-data provenance when used for corpora |
| [general-system-design/12](general-system-design/12-search-autocomplete-typeahead.md) — Search autocomplete / typeahead | 🟡 Canonical high-frequency classic (prefix index + privacy thresholds) |
| [general-system-design/13](general-system-design/13-ride-sharing-service.md) — Ride-sharing (Uber-style) | 🟡 Top classic marketplace/geo archetype (Hello Interview / FAANG lists) |
| [general-system-design/14](general-system-design/14-payment-processing-system.md) — Payment processing | 🟡 Top hard classic (idempotency, ledger, saga) |
| [general-system-design/15](general-system-design/15-distributed-file-storage.md) — Distributed file storage (Dropbox/Drive) | 🟡 Hello Interview recommended top-10 classic |
| [general-system-design/16](general-system-design/16-distributed-key-value-store.md) — Distributed key-value store | 🟡 Infrastructure classic (hashing, quorum, CAP) — distinct from cache/CDN |
| [general-system-design/17](general-system-design/17-metrics-monitoring-system.md) — Metrics & monitoring | 🟡 Observability classic (ingestion, TSDB, alerts, cardinality) |
| [cloud-architecture/01](cloud-architecture/01-gpu-capacity-planning-and-procurement.md) — GPU capacity planning & procurement | 🟡 Real OpenAI/Meta engineering-blog evidence for the industry problem; org callback via agent-finops |
| [cloud-architecture/02](cloud-architecture/02-multi-region-strategy-training-vs-serving.md) — Multi-region strategy: training vs. serving | 🟡 General framework; weakest company-specific sourcing in this repo, disclosed as such |
| [cloud-architecture/03](cloud-architecture/03-disaster-recovery-for-model-serving.md) — Disaster recovery for model serving | 🟡 General framework; also documents a fabricated source caught and rejected during research |
| [cloud-architecture/04](cloud-architecture/04-network-architecture-for-distributed-training.md) — Network architecture for distributed training | ✅ Real Meta/OpenAI engineering-blog sourcing (RoCE, MRC) + real AWS VPC/security-group work (Phase C) |
| [cloud-architecture/05](cloud-architecture/05-security-and-compliance-architecture-for-ai-systems.md) — Security & compliance architecture for AI systems | ✅ Anthropic RSP, Meta Llama-weights leak, Apple PCC blog + real placeholder-API-key bug found and fixed |
| [cloud-architecture/06](cloud-architecture/06-container-orchestration-and-cost-optimization-at-scale.md) — Container orchestration & cost optimization at scale | ✅ Both ECS Fargate and Cloud Run actually deployed, verified, and torn down (Phase C) |
| [cloud-architecture/07](cloud-architecture/07-llm-gateway-semantic-cache-model-router.md) — Enterprise LLM gateway + semantic cache (gateway vs sidecar; cache-as-service) | ✅ Grounded on [aegis-llm-gateway](https://github.com/vpeetla-ai/aegis-llm-gateway) + [aegis-semantic-cache](https://github.com/vpeetla-ai/aegis-semantic-cache) (ADR-028) |
| [cloud-architecture/08](cloud-architecture/08-foundation-model-pretraining-cluster.md) — Foundation-model pretraining cluster | 🟡 Frontier training-infra archetype (parallelism, checkpoint, fabric, stragglers) |
| [behavioral/01](behavioral/01-staffing-reduction-10-to-2.md) — Staffing reduction (10→2) | ✅ Lucid Motors case study |
| [behavioral/02](behavioral/02-finops-audit-and-fix.md) — FinOps audit and fix | ✅ Substack essay → self-audit → agent-finops |
| [behavioral/03](behavioral/03-org-wide-security-hardening.md) — Org-wide security hardening | ✅ 6-repo auth-gate pass, 2026-07-03/04 |
| [behavioral/04](behavioral/04-payments-and-edi-modernization.md) — Payments & EDI modernization | ✅ Volvo Cars gulf-payments + supply-chain-EDI case studies |
| [behavioral/05](behavioral/05-leading-a-0-to-1-ai-product-build.md) — Leading a 0-to-1 AI product build | ✅ ai-content-factory case study, ADR-008 |
| [behavioral/06](behavioral/06-influence-without-authority.md) — Influence without authority | ✅ Cross-repo gateway/skills standardization across vpeetla-ai |
| [behavioral/07](behavioral/07-technical-bet-that-failed.md) — Technical bet that failed | ✅ Playbook sourcing reverse (fabricated attributions rejected) + disclosed product scope |
| [behavioral/08](behavioral/08-disagreement-and-conflict-with-peers.md) — Disagreement & conflict with peers | ✅ Org governance-vs-demo-speed conflict; disagree-and-commit mechanism |
| [behavioral/09](behavioral/09-mentoring-and-growing-engineers.md) — Mentoring & growing engineers | ✅ Org bar-raising / sponsorship multiplier signal |
| [scalability-governance-tradeoffs/01](scalability-governance-tradeoffs/01-cost-vs-latency-vs-safety.md) — Cost vs. latency vs. safety | 🟡 General framework, illustrated with real examples from this org |
| [scalability-governance-tradeoffs/02](scalability-governance-tradeoffs/02-build-vs-buy-shared-services.md) — Build vs. buy for shared services | ✅ agent-finops's "own repo vs. embed" decision (ADR-011) as the worked example |
| [scalability-governance-tradeoffs/03](scalability-governance-tradeoffs/03-centralize-vs-federate-governance.md) — Centralize vs. federate governance | ✅ VAP/AegisAI orchestration-vs-governance split (ADR-001) as the worked example |
| [scalability-governance-tradeoffs/04](scalability-governance-tradeoffs/04-build-vs-train-vs-finetune-foundation-model-strategy.md) — Build vs. train vs. fine-tune: foundation model strategy | 🟡 Real Meta/Anthropic/Apple strategy sourcing; org callback via vllm-architecture-lab's scope decision |
| [coding/00](coding/00-staff-plus-coding-bar.md) — Staff+ coding bar | 🟡 Interview-craft / grading guide for the coding round |
| [coding/01](coding/01-lru-cache-with-concurrency.md) — LRU cache + concurrency | 🟡 High-signal archetype (HashMap+DLL); Staff extension = locking/sharding |
| [coding/02](coding/02-rate-limiter-token-bucket.md) — Token-bucket rate limiter | 🟡 Coding sibling of general-system-design/01 |
| [coding/03](coding/03-time-based-kv-store.md) — Time-based KV store | 🟡 Common FAANG-style medium; Staff = API + memory bounds |
| [coding/04](coding/04-concurrent-bounded-queue.md) — Concurrent bounded queue | 🟡 Producer/consumer classic |
| [coding/05](coding/05-top-k-frequent-stream.md) — Top-K frequent (stream-aware) | 🟡 Heap + Staff streaming/sketch follow-up |
| [coding/06](coding/06-merge-k-sorted-iterators.md) — Merge K sorted iterators | 🟡 K-way merge / external sort narrative |
| [coding/07](coding/07-graph-clone-and-cycle-safe.md) — Clone graph (cycle-safe) | 🟡 Graph medium with memoization |
| [coding/08](coding/08-debug-broken-cache-eviction.md) — Debug broken cache eviction | 🟡 Debug/extend style (2025–2026 loop trend) |
| [coding/09](coding/09-design-inmemory-pubsub.md) — In-memory pub/sub LLD | 🟡 API + concurrency + backpressure |
| [coding/10](coding/10-prefix-sum-subarray-patterns.md) — Prefix-sum subarray patterns | 🟡 Pattern family with Staff follow-ups |
| [coding/11](coding/11-consistent-hashing.md) — Consistent hashing + virtual nodes | 🟡 Staff coding/LLD bridge for caches and shard routers |
| [coding/12](coding/12-elevator-system-lld.md) — Elevator system LLD | 🟡 High-frequency machine-coding / state-machine classic |
| [coding/13](coding/13-parking-lot-lld.md) — Parking lot LLD | 🟡 High-frequency OOP + Strategy + concurrency classic |
| [coding/14](coding/14-implement-trie-prefix-tree.md) — Implement Trie (prefix tree) | 🟡 LC 208 / autocomplete building block; Staff = concurrency + top-k |
| [coding/15](coding/15-median-from-data-stream.md) — Median from data stream | 🟡 LC 295 two-heaps classic; Staff = concurrency / approx at scale |
| [coding/16](coding/16-serialize-deserialize-binary-tree.md) — Serialize / deserialize binary tree | 🟡 LC 297 senior+ staple; Staff = schema / streaming |
| [coding/17](coding/17-design-hit-counter.md) — Design hit counter | 🟡 LC 362 time-window design; Staff = concurrent + distributed merge |
| [coding/18](coding/18-circuit-breaker.md) — Circuit breaker | 🟡 Resilience state machine; Staff = metrics + bulkhead boundary |
| [staff-plus-interview-craft/01](staff-plus-interview-craft/01-what-staff-plus-actually-signals.md) — What Staff+ signals | 🟡 Meta guide for Staff+/Principal loops |
| [staff-plus-interview-craft/02](staff-plus-interview-craft/02-questions-you-should-ask.md) — Questions you should ask | 🟡 Clarifying + HM questions |
| [staff-plus-interview-craft/03](staff-plus-interview-craft/03-what-not-to-waste-time-on.md) — What not to waste time on | 🟡 Timebox + anti-patterns |


## How to use this

Each `ai-system-design/`, `general-system-design/`, and `cloud-architecture/` entry follows the
Hello Interview six-step shape:

1. **Requirements** — functional + non-functional
2. **Core entities** — main data objects / components
3. **API / interface** — how clients interact
4. **Data Flow** — sequence of how data moves (bridge between interface and architecture)
5. **High-level design** — component architecture that satisfies **functional** requirements
6. **Deep dives** — latency, scale, failure, cost, security that satisfy **non-functional** requirements

Then: what's expected at each level → common follow-up questions.
If you're prepping for a system design interview, read the question, try answering it yourself
first — including the level breakdown, aim for the Staff+/Principal bar, not just "a working
answer" — then compare against this one.

The other folders follow lighter shapes:

- `behavioral/` / `scalability-governance-tradeoffs/` — question, decision, follow-up
- `coding/` — clarifying questions → approach ladder → Python reference → Staff+ deep dive → what not to discuss
- `staff-plus-interview-craft/` — tables for signals, questions to ask, and timebox anti-patterns

**Study UI:** from `ui/` run `npm install && npm run build` (runs `scripts/build_catalog.py`).

**Vercel deploy (canonical):** [ai-architect-interview-playbook.vercel.app](https://ai-architect-interview-playbook.vercel.app)

- Preferred: project **Root Directory** = `ui`, Framework **Other**, Output = `out`, Install/Build = `npm install` / `npm run build`.
- Repo-root deploys are also supported via root [`vercel.json`](vercel.json) (builds `ui/` → `ui/out`). A second Git-linked project that deploys root **without** that config produces an empty **404** site — delete or fix that duplicate rather than using it as the live URL.
