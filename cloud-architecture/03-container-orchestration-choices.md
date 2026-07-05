# Container orchestration choices: ECS Fargate vs. Cloud Run

## The question, as it might actually be asked

"You need to run a containerized API in production. Would you reach for Kubernetes, a managed
container service like ECS Fargate or Cloud Run, or something else? How do you choose between
AWS and GCP's managed options specifically?"

## Real comparison, not a feature-matrix guess

Both were actually built and deployed in the same work (Phase C): AegisAI's API on **AWS ECS
Fargate** (VPC + ALB + RDS + IAM roles), and agent-finops on **GCP Cloud Run** (+ Cloud SQL +
Secret Manager). Neither is a hypothetical comparison — both were `terraform apply`'d, verified
against live endpoints, and torn down.

## The real difference in operational shape

**ECS Fargate** requires you to design the whole surrounding stack explicitly: a VPC, subnets, a
load balancer, security groups, an ECS cluster and task definition, IAM execution and task
roles. It is the "classic enterprise AWS pattern" — more setup, but every piece is something you
directly control and can reason about independently.

**Cloud Run** is serverless-container: you give it an image, it handles the networking, scaling,
and HTTPS endpoint for you. `min_instance_count = 0` means true scale-to-zero — no idle compute
cost at all between requests, which ECS Fargate (a persistent running task, even at `desired_count
= 1`) doesn't give you without additional scale-to-zero tooling on top.

## The trade-off in real cost terms, not a rule of thumb

- **AWS (ECS Fargate + ALB + RDS):** the ALB alone costs roughly $16/month *whether or not it's
  serving traffic* — a fixed cost independent of usage. Combined with the Fargate task and RDS,
  roughly $20–30/month while running.
- **GCP (Cloud Run + Cloud SQL):** Cloud Run itself is close to $0 at low/demo traffic
  (pay-per-request, scale-to-zero). Cloud SQL's smallest tier is the real fixed cost, roughly
  $7–10/month while running.

For a service with genuinely intermittent traffic, Cloud Run's cost model is a clear win. For a
service that needs the classic VPC/IAM/ALB pattern specifically — because that's what the
target enterprise environment expects, or because network-boundary control matters more than
idle-cost optimization — ECS Fargate's heavier setup is the right trade to make.

## Real bugs only real deployment surfaced

Writing the Terraform and running `terraform plan` caught zero of these — only a real
`terraform apply` against a real container registry did:

- **agent-finops's Dockerfile ignored Cloud Run's injected `PORT` env var** — hardcoded to 8000
  instead of `${PORT:-8000}`. Cloud Run injects its own port (typically 8080); a container that
  doesn't listen on it never passes health checks.
- **aegisai's Dockerfile couldn't build at all** — `python:3.13-slim` has no `git`, and its
  `requirements.txt` depends on `agent-finops` via a `git+https` source. This container had
  apparently never been built for real since that dependency was added.
- **A guessable placeholder API key** — a Terraform default meant to signal "unset" was a
  non-empty string, which became the actual enforced password for a Cloud Run service whose IAM
  invoker is `allUsers`. Fixed to a real generated `random_password`.
- **Cloud Run doesn't roll a new revision just because a referenced secret's "latest" version
  changes** — required an explicit `terraform apply -replace` to pick up a rotated key, a real
  operational gotcha worth knowing before you hit it in an incident.
- **The AWS ECR repo needed `force_delete = true`** to tear down at all, since it still held
  the pushed image — `terraform destroy` failed on this the first time.

## What this proves in an interview

Not "I know the AWS and GCP container service names." It proves you've hit the actual
operational friction of running something for real — secret propagation delays, container base
image gaps, teardown ordering — which is exactly the kind of judgment a system-design interview
is trying to surface and a whiteboard-only answer can't demonstrate.

## Related

- [ADR-015: Genuine hands-on AWS + GCP infra](https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-015-real-aws-gcp-infra-phase-c.md)
- Real Terraform: `agent-finops/deploy/terraform/gcp/`, `aegisai-enterprise-agent-platform/deploy/terraform/aws/`
