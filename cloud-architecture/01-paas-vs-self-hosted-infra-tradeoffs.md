# PaaS vs. self-hosted infrastructure trade-offs

## The question, as it might actually be asked

"You're deploying a new service. Do you reach for Render/Vercel/Heroku, or provision real cloud
infrastructure yourself — VPC, container orchestration, managed databases? How do you decide?"

## The honest answer most candidates skip

Most system-design answers default to "it depends on scale," which is true but not useful — it
doesn't say *what* to check to know which side you're on. The real decision criteria are about
who owns operational complexity, not raw traffic numbers.

**Real decision (org-wide, ADR-005 "reference stack on free tier"):** every reference platform
in this org's portfolio defaults to Render (API) + Vercel (frontend) — chosen explicitly for
iteration speed and near-zero ops overhead on a solo-maintained portfolio. This is not a
compromise; it is the correct choice for that context.

**Real decision (Phase C, ADR-015 "genuine hands-on AWS + GCP infra"):** two of those same
services were *also* deployed for real to AWS (ECS Fargate + RDS + ALB) and GCP (Cloud Run +
Cloud SQL) — not to replace the PaaS deployment, but to demonstrate genuine infrastructure
ownership capability. Both were verified against live endpoints, then torn down.

## When PaaS is the right call

- Fast iteration matters more than infra control.
- No dedicated ops capacity — nobody is paged at 2am for this service.
- Traffic low enough that free/starter tiers cover it.
- The team doesn't need direct control over network boundaries or IAM.

## When real IaC (Terraform + managed cloud services) earns its complexity

- Direct control over IAM is required — least-privilege service accounts/roles scoped per
  resource, not a shared platform identity every service inherits.
- Network boundaries matter — VPC peering, private connectivity to other cloud resources that
  a PaaS's black-box networking can't express.
- Provider-specific managed services PaaS doesn't expose — Secret Manager rotation policies,
  Cloud SQL IAM auth, VPC Service Controls, cross-region failover.

None of those were operationally *needed* for either service redeployed in Phase C — this was
built specifically to demonstrate the capability, and the ADRs say so explicitly rather than
retrofitting a operational justification that wasn't the real reason.

## The trap: writing Terraform nobody ever runs

The single most common gap in a candidate's "I have cloud infrastructure experience" claim:
Terraform files that exist in a repo but were never actually applied. **Real verification, not
a diagram exercise:** `terraform apply` created 19 real GCP resources and 26 real AWS resources;
each service was hit over its real live endpoint (a real budget breach detected against a real
Cloud SQL-backed ledger; a real orchestrator run completed against real RDS-backed persistence);
`terraform destroy` cleanly removed everything, confirmed empty via each provider's own CLI
afterward.

Real deployment found 4 real bugs neither code review nor local testing had caught — see
[03-container-orchestration-choices.md](03-container-orchestration-choices.md) for the specific
bugs and what they revealed about the gap between "code that should work" and "code that was
actually deployed."

## Related

- [ADR-005: Reference stack on free tier](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-005-reference-stack-free-tier.md)
- [ADR-015: Genuine hands-on AWS + GCP infra](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-015-real-aws-gcp-infra-phase-c.md)
- [agent-finops ADR-0002](https://github.com/vpeetla-ai/agent-finops/blob/main/docs/adr/0002-paas-vs-iac-deploy-tradeoffs.md), [aegisai ADR-0006](https://github.com/vpeetla-ai/aegisai-enterprise-agent-platform/blob/main/adr/0006-paas-vs-iac-deploy-tradeoffs.md)
