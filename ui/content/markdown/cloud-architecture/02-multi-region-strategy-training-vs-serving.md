# Design a multi-region strategy for training vs. serving

## Where this actually gets asked

The weakest-sourced entry in this section, disclosed plainly: no company-specific interview
account was found for any of the six companies distinguishing training-region strategy from
serving-region strategy. What does exist is solid *architecture documentation*, not interview
evidence — Google Cloud's own guidance on multi-region GKE and Cloud SQL replicas, and
Microsoft's documented Azure OpenAI deployment model (Regional, Global, and "Data Zone" tiers,
each with different data-residency and latency guarantees, per Microsoft Learn). Treat this as
the generic "multi-region system design" archetype asked broadly across big tech, adapted to an
AI-specific wrinkle — training and serving have almost opposite region requirements, and a
candidate who treats them identically is missing the actual point of the question.

## Requirements

**Functional**
- Training jobs need to run wherever GPU capacity exists, without user-facing latency
  constraints.
- Serving/inference needs to run close to users, with regional failover if a region degrades.
- Some workloads (regulated industries, EU customers) require data to stay within a specific
  jurisdiction end-to-end — for training data, fine-tuning data, and inference logs alike.

**Non-functional**
- Serving latency budgets (often sub-second) make cross-region round-trips for every request a
  non-starter — regional replicas of the serving stack are required, not optional.
- Training has no comparable latency constraint, but does have a data-gravity constraint — moving
  petabyte-scale training data across regions is slow and expensive, so training tends to run
  wherever the data and GPU capacity co-locate, not wherever is "closest."
- Data residency requirements (GDPR, and sector-specific rules like HIPAA) can force training
  data to never leave a region — which then constrains where a compliant model can even be
  trained, independent of GPU availability.

## Core entities

- **Region**: a deployment location with a GPU capacity profile, a data-residency
  classification, and a set of services deployed there.
- **Training job**: bound to whichever region has both sufficient GPU capacity and residency
  clearance for its input data — not necessarily the region closest to any user.
- **Serving replica**: a full regional deployment of the inference stack, load-balanced by
  proximity, with a defined failover target if its region degrades.
- **Data residency policy**: a per-dataset/per-customer rule constraining which regions are
  legally allowed to process or store that data.

## API / interface
Auth: platform operators; traffic shifts are change-managed.

```http
GET /v1/regions
→ {"regions":[{"id":"us-east","roles":["serving","training"]},{"id":"eu-west","roles":["serving"]}]}

PUT /v1/serving/traffic-policy
{"model":"chat-v4","weights":{"us-east":0.7,"eu-west":0.3},"sticky":"user_id"}
→ 200 {"version":12,"status":"applied"}

POST /v1/serving/failover
{"from":"us-east","to":"eu-west","reason":"region_outage","ticket":"INC-..."}
→ 202 {"change_id":"chg_..."}

POST /v1/training/placements
{"job_id":"tj_...","prefer":["us-east"],"allow_preempt":false}
→ 200 {"region":"us-east","cluster":"train-a"}

GET /v1/replication/status?dataset=corpus_v5
→ {"regions":{"us-east":"complete","eu-west":"lagging","lag_minutes":18}}
```

Staff+ callout: serving traffic policy and training placement are different APIs — do not share one “multi-region” knob.


## Data Flow


Serving traffic weights shift independently from training placement; replication lag is observed, not assumed zero.

```mermaid
sequenceDiagram
  participant Op as Operator
  participant TP as Traffic policy
  participant US as US serving
  participant EU as EU serving
  participant Tr as Training placement
  Op->>TP: PUT weights
  TP->>US: 70%
  TP->>EU: 30%
  Op->>Tr: place training job
  Tr-->>Op: region=us-east
```

## High-level design

Maps to **functional** requirements from step 1 — the component architecture that makes the API and data flow real.

```mermaid
graph TB
  subgraph global [Global control]
    Traffic[Traffic policy API]
    Place[Training placement]
    Repl[Data replication control]
  end
  subgraph us [Region US]
    ServeUS[Serving cluster]
    TrainUS[Training cluster]
    DataUS[(Regional data)]
  end
  subgraph eu [Region EU]
    ServeEU[Serving cluster]
    DataEU[(Regional data)]
  end
  Traffic --> ServeUS
  Traffic --> ServeEU
  Place --> TrainUS
  Repl --> DataUS
  Repl --> DataEU
  DataUS --> ServeUS
  DataEU --> ServeEU
  DataUS --> TrainUS
```

The key design split: training region selection is driven by **data gravity and residency**,
serving region selection is driven by **user proximity and failover** — and the trained model
artifact itself is the boundary between them, since a model (unlike raw training data) is
usually not subject to the same residency constraints once training is complete, unless
regulation specifically extends to model weights (an emerging, not yet settled, area).

Deep dives below target **non-functional** requirements (latency, scale, failure, cost, security).

## Deep dive 1: why training and serving region strategy are not the same problem

A common weak answer proposes one multi-region strategy and applies it uniformly. The actual
constraints point in different directions:

| Dimension | Training | Serving |
|---|---|---|
| Primary driver | GPU capacity availability + data residency | User latency + regional failover |
| Data movement pattern | One-time or periodic bulk transfer (or none, if compute moves to data) | Continuous, per-request, small payloads |
| Failure tolerance | High — a delayed training run is costly but rarely user-facing | Low — a serving outage is immediately user-visible |
| Region count driver | As few as necessary (fewer regions = simpler compliance surface) | As many as needed to keep users within an acceptable latency radius |

## Deep dive 2: data residency as a hard constraint, not a preference

Azure OpenAI's documented "Data Zone" deployment tier — a middle ground between fully regional
and fully global processing — is a real, useful pattern here: it commits to keeping data within
a defined geography (e.g., "EU Data Zone") while still allowing some cross-region routing for
availability, rather than forcing an all-or-nothing choice between "fully regional" (expensive,
fragments capacity) and "fully global" (fails compliance outright for regulated customers).
**Common mistake at the mid/senior level:** proposing "just replicate everywhere" without
addressing that some datasets legally cannot be replicated everywhere — the model this data
trains also inherits some of that constraint if the model can be shown to memorize or leak
training data.

## Deep dive 3: does a trained model actually inherit its training data's residency constraint?

This is the question that separates a Staff+ answer (name the boundary) from a Principal one
(say how you'd actually test it). A model doesn't automatically inherit a dataset's residency
restriction just because it was trained on that data — the real, testable question is whether
the model **memorizes and can be made to emit** specific training examples verbatim or
near-verbatim. The concrete mechanism for testing this is a **membership inference attack**: given
a candidate input, determine (via the model's confidence/loss on that input relative to unseen
data) whether it was part of the training set — if an attacker (or an auditor) can reliably
answer "was this specific person's data in the training set," the model itself is leaking
residency-relevant information, independent of where it's deployed. The architectural mitigation
is **differential privacy during training** (e.g., DP-SGD, clipping and noising per-example
gradients) which provides a mathematical bound on how much any single training example can
influence the final model — at a real, non-free cost: a smaller privacy-loss budget (a lower
epsilon) gives a stronger guarantee but measurably degrades model utility, so this is a genuine
accuracy-vs-compliance trade-off with a number attached, not a free architectural choice.

| Approach | Residency inheritance risk | Utility cost | When it's the right call |
|---|---|---|---|
| No mitigation, standard training | Real — membership inference against sensitive training data is a demonstrated, published attack class | None | Only acceptable when training data has no residency/privacy sensitivity to begin with |
| Post-hoc testing (membership inference audit before deployment) | Detects the risk, doesn't prevent it | Low — an audit step, not a training-time change | A reasonable minimum bar — know whether the risk exists before deciding whether it's acceptable |
| DP-SGD during training | Provides a mathematical bound on inheritance risk | Real, measurable accuracy degradation, worse at stronger privacy budgets | When regulation or contractual terms require a provable guarantee, not just an audit result |

## What's expected at each level

- **Mid-level:** proposes regional serving replicas with a global load balancer; may not
  address training's region strategy as a separate question at all.
- **Senior:** explicitly separates training-region selection (capacity + residency driven) from
  serving-region selection (latency + failover driven).
- **Staff+:** designs the residency-tagging mechanism explicitly — how a dataset's allowed
  regions propagate through training scheduling — and identifies the model-artifact boundary as
  the point where residency constraints may or may not carry forward.
- **Principal:** additionally can state whether a trained model actually inherits its training
  data's residency constraint — via a concrete test (membership inference auditing) rather than
  an assumption — and names differential privacy (DP-SGD) as the architectural mitigation with
  its real accuracy-vs-privacy-budget cost, not just "the model probably doesn't leak the data";
  and reasons about the compliance-surface cost of adding a region as a real operating cost that
  trades off against latency/capacity benefits.

## Follow-up questions to expect

- "A regulator says a customer's data can never leave their home region — but you only have GPU
  capacity for fine-tuning in a different region. What do you do?" (Answer: this is a real
  constraint, not a negotiable one — either provision capacity in the compliant region even at
  higher cost, or don't offer that fine-tuning capability to that customer segment; there's no
  clever routing trick around a legal data-residency boundary.)
- "How do you fail over serving traffic when a region goes down mid-request?" (Answer: in-flight
  requests to the failed region are lost — the load balancer needs health-check-driven failover
  fast enough that new requests route around it, and the client/application layer needs to
  retry, not assume exactly-once delivery across a regional failure.)

## Related

- [cloud-architecture/03: Disaster recovery for model serving](03-disaster-recovery-for-model-serving.md)
- [cloud-architecture/05: Security & compliance architecture for AI systems](05-security-and-compliance-architecture-for-ai-systems.md)
- [ADR-015: Genuine hands-on AWS + GCP infra](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-015-real-aws-gcp-infra-phase-c.md)
