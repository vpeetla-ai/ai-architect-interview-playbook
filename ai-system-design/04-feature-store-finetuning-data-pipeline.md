# Design a feature store / fine-tuning data pipeline

## Where this actually gets asked

This is the weakest-evidenced topic in this set for the six companies in scope — no
company-specific attributed question was confirmed for OpenAI, Anthropic, Meta, Google,
Microsoft, or Apple specifically. What exists publicly is mostly adjacent-company material
(e.g., Scale AI's own interview guides describe RLHF/fine-tuning data pipeline stages) or
generic MLOps system design content not pinned to a specific employer. Treat this as a
well-established *type* of question in ML infrastructure interviews broadly — feature stores
and training-data pipelines are a mature, widely-taught system design topic — rather than a
confirmed big-tech-specific prompt. Answer it on its technical merits.

## Requirements

**Functional**
- Data scientists should be able to define a feature once and use it consistently for both
  model training (offline, batch) and real-time inference (online, low-latency).
- Support point-in-time correct joins — a training example must only see feature values that
  were actually available *at the time* the label was generated, not values computed later.
- Fine-tuning/training jobs need a versioned, reproducible snapshot of the data they were
  trained on.

**Non-functional**
- Online feature lookup: single-digit-millisecond latency at inference time.
- Offline feature computation: can tolerate minutes-to-hours latency, optimized for throughput
  over a huge historical dataset.
- Training-serving skew must be structurally prevented, not just tested for after the fact.

## Core entities

- **Feature definition**: name, computation logic, data source, freshness SLA.
- **Feature value**: a computed value for one entity (user, document, session) at a point in
  time.
- **Dataset snapshot**: an immutable, versioned join of features + labels used for one training
  run.
- **Training/fine-tuning job**: references exactly one dataset snapshot, never a live, mutable
  query.

## API / interface

```text
GET  /features/online?entity_id=&feature_set=       (real-time inference path)
POST /features/offline/materialize { feature_set, time_range }  (batch training path)
POST /datasets/snapshot { feature_set, label_source, as_of_time }
→ { snapshot_id, row_count, schema_hash }
```

## High-level design

```mermaid
flowchart LR
    SRC[Raw data sources] --> COMP[Feature computation]
    COMP --> OFF[(Offline store<br/>batch, historical)]
    COMP --> ON[(Online store<br/>low-latency, current)]
    OFF --> SNAP[Dataset snapshot builder]
    SNAP --> TRAIN[Training / fine-tuning job]
    ON --> SERVE[Real-time inference]
```

The core architectural decision is the **dual-store pattern**: the same feature computation
logic writes to both an offline store (optimized for large historical range scans, used to
build training datasets) and an online store (optimized for point lookups by entity ID, used
at inference time). The alternative — compute features differently for training vs. serving —
is the single most common root cause of training-serving skew in real ML systems, and a strong
answer should name this explicitly as the failure mode being designed against.

## Deep dive 1: point-in-time correctness

The naive dataset-building approach joins the latest feature values to historical labels. This
leaks future information into training — a feature that reflects "user's total purchases,"
computed *today*, joined against a label from six months ago, tells the model something it
couldn't have known at prediction time. The correct join is `as_of_time`-aware: for each label,
fetch the feature value as it existed at that label's timestamp, not the current value.

| Approach | Leakage risk | Implementation cost |
|---|---|---|
| Join current feature values to historical labels | High — silent, doesn't show up until production accuracy diverges from offline eval | Low, tempting default |
| Point-in-time join against a versioned feature history | None (correct by construction) | Higher — requires storing feature value history, not just current state |

This is the deep-dive question a Staff+ candidate should raise unprompted, because it's the
kind of bug that produces a model that looks great in offline eval and silently underperforms
in production — exactly the failure mode a rigorous eval practice (see
[system-design/07](07-llm-evaluation-observability-platform.md)) is supposed to catch, but only
if the training data itself wasn't already contaminated.

## Deep dive 2: data lineage and reproducibility

A fine-tuning job that can't say exactly what data it was trained on is a compliance and
debugging liability — if a fine-tuned model produces a bad output, you need to trace it back to
what training data might be responsible, and re-run that exact snapshot to reproduce a bug.

**The adjacent real system I've actually built**, not a full feature store but the same
underlying discipline: [enterprise_rag_platform](https://github.com/vpeetla-ai/enterprise_rag_platform)'s
ingestion pipeline stamps every indexed chunk with a real content hash and ingestion timestamp
that survive every downstream transformation (ADR-0005/ADR-016) — the same "can you actually
answer *when was this data captured and has it changed since*" discipline a training-data
pipeline needs, applied to a retrieval index instead of a training set. The generalizable
principle: lineage metadata that's computed but not enforced (or not propagated through every
transformation) is not real lineage — a real audit found exactly this gap (three places in the
codebase reconstructed the data object explicitly and silently dropped the lineage fields to
their defaults) and it's the same class of bug that would let a training pipeline silently lose
track of what a dataset snapshot actually contains.

## Deep dive 3: freshness vs. compute cost trade-off

Recomputing every feature for every entity on every write is wasteful; recomputing only on a
schedule risks staleness. The standard answer: event-driven incremental computation for
features that change frequently (recent activity counts), scheduled batch recomputation for
features that are expensive and change slowly (aggregate historical statistics) — naming which
features belong in which bucket, with a concrete example, is what separates a Staff-level
answer from "we'll just recompute everything hourly."

## What's expected at each level

- **Mid-level:** proposes a single feature table used for both training and serving; may not
  spontaneously identify training-serving skew as a risk.
- **Senior:** proposes separate online/offline stores; identifies training-serving skew as a
  named risk to design against.
- **Staff+:** insists on point-in-time-correct joins unprompted, and can explain precisely why
  naive "join latest value" leaks future information.
- **Principal:** additionally treats dataset lineage/reproducibility as a first-class
  requirement (not just a nice-to-have), and can map freshness/cost trade-offs to specific
  feature categories with concrete reasoning, not a blanket policy.

## Follow-up questions to expect

- "How do you backfill a new feature into historical training data?" (Answer: this requires the
  feature's computation logic to be replayable against historical raw data, which is why raw
  source retention — not just computed feature retention — matters.)
- "How do you detect feature drift between training and production?" (Answer: monitor the
  statistical distribution of online-served feature values against the distribution in the
  training snapshot, alert on divergence.)
- "What's different about this for a fine-tuning pipeline specifically, versus a classic
  tabular ML feature store?" (Answer: the "features" become prompt/completion pairs or
  preference comparisons, but point-in-time correctness and lineage requirements are identical
  in spirit — you still need to know exactly what data a given fine-tuned checkpoint saw.)

## Related

- [enterprise_rag_platform ADR-0005/ADR-016: Ingestion data contract + lineage](https://github.com/vpeetla-ai/enterprise_rag_platform/blob/main/docs/adr/0005-ingestion-data-contract-and-lineage.md)
- [system-design/08: Fine-tuning/RLHF training pipeline at scale](08-finetuning-rlhf-training-pipeline-at-scale.md)
