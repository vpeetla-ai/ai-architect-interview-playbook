# Design a multimodal search / recommendation system

## Where this actually gets asked

Meta has the best-attributed evidence in this entire set for a recommendation-flavored
question: Blind threads ("Meta ML System Design," "Meta MLE E6 ML System Design Interview")
plus Meta's own published prep guide describe recurring prompts like "design a personalized
news ranking system" and "design a product recommendation system." These are classic
recsys/ranking questions, not multimodal-specific — I found no company-attributed evidence of
a *multimodal* (text+image+video) version of this question for any of the six companies in
scope. Answer the recsys core well; treat the multimodal extension as a natural follow-up
direction an interviewer might push toward, not the headline framing.

**Honest note on grounding**: unlike the other entries in this playbook, I don't have a full
shipped recommendation system of my own to point to — the closest real overlap is
[enterprise_rag_platform](https://github.com/vpeetla-ai/enterprise_rag_platform)'s retrieval +
reranking core, which shares real architecture with recsys candidate generation and ranking.
Where I reference it below, it's a genuine partial analog, not a claim that I've built a full
recommendation system.

## Requirements

**Functional**
- Given a user (or a query), return a ranked list of relevant items (posts, products, videos)
  drawn from a catalog of hundreds of millions to billions of items.
- Support multiple content modalities in the catalog (text, image, video) with a unified
  relevance signal.
- Personalize ranking based on user history/context, not just query-item relevance alone.

**Non-functional**
- End-to-end latency budget in the tens of milliseconds at serving time, against a catalog far
  too large to score exhaustively per request.
- Freshness: new items (especially time-sensitive ones like news or trending content) need to
  enter the candidate pool within minutes.
- Diversity and fairness constraints — pure relevance-maximization can produce a feed that's
  technically "relevant" but narrow or harmful at the margins.

## Core entities

- **Item**: content with one or more modality-specific embeddings (text, image, video) plus
  metadata (recency, engagement stats).
- **User profile**: historical interactions, embeddings derived from behavior.
- **Candidate set**: a small (hundreds to low thousands) subset of the catalog selected for
  full ranking.
- **Ranking score**: the model's predicted relevance/engagement probability for a
  (user, item) pair.

## API / interface

```text
GET /recommendations?user_id=&surface=feed&limit=20
→ { items: [{ item_id, score, modality_signals }] }
```

## High-level design

```mermaid
flowchart LR
    U[User request] --> RETRIEVE[Candidate generation<br/>multiple retrieval sources]
    RETRIEVE --> MERGE[Candidate merge + dedup]
    MERGE --> RANK[Ranking model<br/>full feature set]
    RANK --> DIVERSITY[Diversity / business-rule pass]
    DIVERSITY --> OUT[Final ranked list]
```

The standard two-stage pattern — cheap, high-recall candidate generation followed by an
expensive, high-precision ranking model over a small candidate set — is the same shape as
RAG's retrieve-then-rerank pattern (see [system-design/02](02-rag-platform-at-scale.md)). This
is worth saying out loud in the interview: the underlying trade-off (you cannot afford to run
your most expensive model over your entire catalog per request) is identical whether the
"catalog" is documents or products or videos.

## Deep dive 1: multiple candidate-generation sources, not one

A single retrieval method (e.g., pure collaborative filtering, or pure embedding similarity)
systematically misses whole categories of relevant content — collaborative filtering struggles
with new items (cold start), embedding similarity alone misses exact-match or trending signals.
Real systems merge candidates from several independent sources (collaborative filtering,
content-based embedding similarity, trending/recency-boosted, explicit graph signals like
"followed by people you follow") before ranking — the same principle as hybrid lexical +
semantic retrieval in RAG, generalized to more sources because the personalization surface is
richer.

| Candidate source | Strength | Blind spot |
|---|---|---|
| Collaborative filtering | Strong for popular, well-engaged items | Cold start — new items/users have no signal |
| Content/embedding similarity | Works for new items with no engagement history | Can over-recommend near-duplicates of what's already been seen |
| Trending/recency boost | Surfaces genuinely new, time-sensitive content | Can dominate the feed if not capped |

## Deep dive 2: multimodal representation — fusion vs. separate signals

For a multimodal catalog, the question becomes: do you learn one joint embedding space across
text/image/video, or keep modality-specific embeddings and combine their scores? Joint
embeddings (e.g., trained via contrastive learning across modalities) let a single
similarity computation capture cross-modal relevance ("this image matches this text query"),
but they're expensive to train well and can degrade if one modality's data is much sparser than
another's. Keeping modality-specific signals and combining them at the ranking stage (as
separate features into the ranking model) is cheaper to build incrementally and easier to debug
per-modality, at the cost of not capturing genuinely cross-modal relevance as directly.

**Real, partial analog**: enterprise_rag_platform's retrieval layer already makes an analogous
choice at a smaller scope — hybrid lexical + semantic scoring are combined explicitly at the
retrieval stage rather than trained into one joint representation, specifically because it's
debuggable (you can see which signal contributed) and doesn't require joint training data that
doesn't exist for every corpus. The same reasoning applies at recsys scale: start with
combined-at-ranking-time signals, and only invest in joint embeddings once you have clear
evidence that cross-modal relevance is the actual bottleneck, not a starting assumption.

## Deep dive 3: diversity and feedback loops

Pure engagement-maximizing ranking creates a feedback loop: items that get engagement get
recommended more, get more engagement, and crowd out everything else — including content that
would have been relevant but never got an initial chance to be shown. A real design needs an
explicit diversity/exploration mechanism (e.g., reserving some fraction of the candidate slots
for exploration, or an explicit diversity penalty in the final ranking pass), named as a
deliberate design choice, not left as an emergent property of "the ranking model is good."

## What's expected at each level

- **Mid-level:** proposes a single retrieval + ranking pipeline; may not raise cold start or
  feedback loops unprompted.
- **Senior:** proposes multiple candidate-generation sources; identifies cold start as a named
  problem.
- **Staff+:** explicitly designs for the engagement feedback loop (diversity/exploration as a
  deliberate mechanism, not an afterthought), and can reason about fusion vs. separate-signal
  trade-offs for multimodal content with a concrete recommendation.
- **Principal:** additionally connects this design to the same retrieve-then-rank pattern that
  shows up in RAG and other high-cardinality retrieval problems, showing the underlying
  principle generalizes rather than treating this as a bespoke recsys-only problem.

## Follow-up questions to expect

- "How do you handle a brand-new user with no interaction history?" (Answer: fall back to
  content-based/trending candidates and coarse demographic signals until enough behavioral
  signal accumulates — a real cold-start strategy, not "just show popular items forever.")
- "How would you A/B test a ranking model change safely?" (Answer: hold-out traffic
  segmentation with a real statistical significance bar, and a rollback path if the new model
  regresses a guardrail metric even while improving the primary one.)
- "What's different if this needs to run on-device (e.g., a phone) instead of a data center?"
  (Answer: candidate generation and ranking both need to shrink dramatically — smaller
  embeddings, quantized models, a much smaller candidate pool — trading some ranking quality
  for latency and privacy.)

## Related

- [system-design/02: RAG platform at scale](02-rag-platform-at-scale.md) — the same retrieve-then-rank pattern, different domain
