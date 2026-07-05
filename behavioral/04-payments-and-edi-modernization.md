# Payments and supply chain modernization at Volvo Cars

## Situation

Two related but distinct problems at Volvo Cars: (1) Gulf-region payment coverage needed better
gateway fit, reliability, and revenue enablement than the existing setup provided; (2) supply
chain EDI workflows ran on license-heavy SAP and TrueCommerce integrations that created
recurring cost and limited the team's ability to actually own or adapt the integration logic.

## Task

For payments: build regional payment capability that could scale with the business, not a
one-off gateway integration bolted on for a single market. For EDI: migrate critical workflows
off vendor-licensed, low-ownership infrastructure into something the team actually controlled.

## Action

**Payments:** platformized payments as a genuine capability — integrating Stripe and GIB behind
a common commerce-platform boundary, with market-specific behavior and observability built into
the transaction flow before scaling volume, not added after problems appeared. The trade-off
made explicitly: balance regional gateway fit against long-term vendor flexibility, rather than
optimizing purely for the fastest integration with the best short-term Gulf-market fit.

**EDI:** accepted real migration complexity as the cost of eliminating a recurring licensing
drag — moved critical EDI flows behind owned service boundaries instead of staying
vendor-coupled. Prioritized long-term adaptability for operations over short-term migration
speed, meaning the team took longer to migrate in exchange for owning the resulting integration
points completely afterward.

## Result

Multi-million-dollar annualized business impact from the payments modernization; multi-million-
dollar annualized savings from the EDI re-platforming — both while strengthening the underlying
platform foundation rather than treating either as a one-time project with no lasting
architectural benefit.

## The follow-up question you should expect

**"Both of these accepted more short-term complexity for a long-term payoff — how did you know
that trade-off was worth making, versus just shipping the faster path?"** In both cases the
faster path was vendor lock-in with a hard ceiling on adaptability — a Gulf-market-specific
gateway integration that couldn't extend to the next region without redoing the work, or an EDI
integration where the team owned no part of the actual logic and every future change routed
through a vendor's licensing and support cycle. The complexity accepted upfront was specifically
the kind that pays down over time (a platform capability, an owned service boundary) rather than
the kind that just accumulates (a one-off integration nobody wants to touch again).

## Related

- [Full case study: Gulf Payments Modernization](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/case-studies/gulf-payments-modernization.md)
- [Full case study: Supply Chain EDI Re-Platforming](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/case-studies/supply-chain-edi-replatforming.md)
