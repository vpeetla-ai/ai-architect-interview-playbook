# Build vs. train-from-scratch vs. fine-tune: foundation model strategy

## The question, as it might actually be asked

"Your product needs an LLM. Do you train a foundation model from scratch, fine-tune an
open-weight model, or call a vendor API? How do you decide, and how do real companies actually
answer this?"

## On sourcing: real strategy, not a leaked interview prompt

This isn't confirmed as a formal interview question anywhere — it's inferred from genuinely
public company strategy, which is legitimate substance for an architecture discussion but should
be presented as strategy analysis, not a leaked prompt. **Meta**: well-documented via
[Meta AI Research](https://ai.meta.com/research/publications/llama-open-and-efficient-foundation-language-models/)
and the [Llama 4 blog](https://ai.meta.com/blog/llama-4-multimodal-intelligence/) — weights
released openly (though not fully open-source by OSI's definition; training data and full
methodology aren't disclosed), now on a mixture-of-experts architecture. The business rationale
(ads revenue rather than API revenue, benefiting from a crowdsourced fine-tuning/tooling
ecosystem around an open-weight model) is reasonable analyst inference, not a Meta-published
statement. **Anthropic**: well-documented via Dario Amodei's own on-record statements (the
[Dwarkesh interview](https://www.dwarkesh.com/p/dario-amodei), a [Time interview](https://time.com/6990386/anthropic-dario-amodei-interview/))
confirming an API-revenue-first, closed-weight, safety-driven strategy, explicitly contrasted
with a more open approach. **OpenAI**: commonly inferred from its product/business structure
(closed models, API + ChatGPT subscription revenue) — I did not find an OpenAI-published
strategy statement as direct as Amodei's interviews. **Apple**: the most dynamic and best
multi-sourced of the four — its own [ML Research blog](https://machinelearning.apple.com/research/introducing-apple-foundation-models)
confirms in-house on-device + server foundation models, *plus* a reported 2026 partnership
with Google (per [CNBC](https://www.cnbc.com/2026/01/12/apple-google-ai-siri-gemini.html)/
[TechCrunch](https://techcrunch.com/2026/01/12/googles-gemini-to-power-apples-ai-features-like-siri/))
to power some Siri/Apple Intelligence features with Gemini, alongside retained OpenAI/ChatGPT
integration for peripheral queries — a real, confirmed vendor-mix strategy, though the specific
reported ~$1B/year figure traces only to unconfirmed Bloomberg reporting and a circulating
"1.2 trillion parameter" claim wasn't corroborated by primary reporting — cite both as
"reported," never as fact. Microsoft and Google are largely vendors/infra providers in this
frame rather than subjects of it.

## The framework

Three real options, with different economics and different failure modes:

1. **Train from scratch.** Highest cost (data, compute, research talent) and highest control —
   you own the full training data/architecture decisions and aren't dependent on any external
   model's release cadence or licensing terms. Only justified when the differentiation you need
   genuinely can't be achieved by fine-tuning an existing model, or when owning the full model is
   itself the strategic asset (Anthropic's and OpenAI's real, confirmed position).
2. **Fine-tune an open-weight model.** Much lower cost than training from scratch, real control
   over the specific behavior you're tuning for, but inherits the base model's capability
   ceiling and any of its licensing constraints. Meta's real strategy is built around *being*
   the open-weight base others fine-tune, monetizing the surrounding ecosystem and ad revenue
   rather than the model access itself — a genuinely different business model from a
   closed-API vendor.
3. **Call a vendor API (or a mix of vendors).** Lowest upfront cost, fastest to ship, but you
   inherit the vendor's roadmap, pricing changes, and availability — and you may need more than
   one vendor if no single model covers your full capability and cost surface. Apple's real,
   reported multi-vendor mix (in-house on-device models, PCC's own server models, plus Google
   Gemini and OpenAI for specific capabilities) is the clearest real evidence that even a
   company with deep in-house model capability still finds a pure single-vendor-or-nothing
   framing too rigid for a real product surface.

## The worked example, not hypothetical

This org's own real decision is a direct, honest instance of option 3, not a strained analogy to
it: every real service in this org that calls an LLM at all —
[agent-finops](https://github.com/vpeetla-ai/agent-finops), [aegisai](https://github.com/vpeetla-ai/aegisai-enterprise-agent-platform),
[aegisloop](https://github.com/vpeetla-ai/aegisloop-agentops-workbench),
[enterprise_rag_platform](https://github.com/vpeetla-ai/enterprise_rag_platform),
[venkat-ai-platform](https://github.com/vpeetla-ai/venkat-ai-platform) — calls a vendor API
(OpenAI/Anthropic-compatible), never a model trained or fine-tuned in-house. That's a deliberate,
disclosed choice for the same reason the framework names as the real driver of option 3: the
differentiation this org's real work needs to demonstrate is in governance, orchestration, cost
metering, and eval-gating architecture — the layers *around* a model call — not in model
capability itself, and training/fine-tuning a model requires data and compute resources
genuinely out of scope for what those layers actually need to prove.

A related, smaller-scope decision worth naming honestly rather than over-claiming as the same
thing: [vllm-architecture-lab](https://github.com/vpeetla-ai/vllm-architecture-lab) builds a
real simulator of the *serving* layer (PagedAttention, continuous batching) specifically to
demonstrate inference-architecture understanding without needing real model weights or training
infrastructure to do it — a scope decision about how to prove serving-layer knowledge cheaply,
distinct from (though motivated by the same resource-constraint logic as) the vendor-API decision
above.

## The interview-ready summary

Ask what's actually being optimized for: differentiation that only full model ownership can
provide (train from scratch — the real position of Anthropic, OpenAI, and increasingly Meta's
research arm), an ecosystem/distribution strategy where being the open base has more value than
guarding it (Meta's real, confirmed approach), or speed-to-market across a capability surface no
single model covers well (Apple's real, reported multi-vendor mix). None of these is universally
"correct" — the real skill an interviewer is testing is whether a candidate can map a company's
actual business model and constraints to the right point on this spectrum, rather than
defaulting to "train your own" as if it were always the more sophisticated answer.

## What's expected at each level

- **Mid-level:** names the three options (train from scratch / fine-tune / vendor API) without a
  clear rule for choosing between them.
- **Senior:** correctly maps a given company's business model to the right option, with a stated
  reason tied to that company's actual economics.
- **Staff+:** can argue for a genuinely mixed, multi-vendor strategy when a single model doesn't
  cover the full capability surface, naming the real trade-offs of that mix.
- **Principal:** identifies what's actually being optimized for — differentiation, ecosystem, or
  speed-to-market — as the deciding factor, rather than defaulting to "train your own" as if it
  were inherently the more sophisticated answer.

## Related

- [scalability-governance-tradeoffs/02: Build vs. buy for shared services](02-build-vs-buy-shared-services.md) — the same build/buy tension one layer down, for infrastructure rather than models
- [system-design/08: Fine-tuning/RLHF training pipeline at scale](../ai-system-design/08-finetuning-rlhf-training-pipeline-at-scale.md)
- [system-design/11: On-device/edge AI inference architecture](../ai-system-design/11-on-device-edge-ai-inference-architecture.md) — Apple's real multi-vendor mix, in architectural context
