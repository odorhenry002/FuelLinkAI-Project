# FuelLink AI Roadmap

This roadmap sequences work from the current authentication-and-dashboard prototype to a secure, operable energy-marketplace platform. It is deliberately outcome-based: each phase should meet its exit criteria before the next phase begins.

## Phase 1 — MVP

### Objective

Deliver a safe, usable core marketplace workflow for authenticated organisations: onboarding, company membership, RFQs, quotations, orders, and delivery status.

### Platform foundations

- Replace startup table creation with Alembic migrations and establish versioned PostgreSQL schemas.
- Add environment validation that rejects placeholder secrets and insecure production settings at startup.
- Move to a production PostgreSQL configuration; retain SQLite only for local tests.
- Establish database constraints, indexes, foreign-key behaviour, UTC timestamps, and audit fields for all new entities.
- Add structured application logging, correlation/request IDs, and a real readiness check that verifies database connectivity.
- Add consistent API error envelopes and OpenAPI response models.

### Identity and access

- Prevent public registration of privileged roles; bootstrap the first administrator through a controlled operational process.
- Model organisation membership and permissions separately from a mutable user role string.
- Enforce active/suspended account status during authentication and authorization.
- Add access-token purpose/type claims, refresh-token rotation, revocation, expiry tracking, and logout.
- Move browser authentication to secure, HTTP-only, SameSite cookies or document and mitigate the equivalent token-storage model.
- Add password reset, email verification, login throttling, and security-event audit records.

### Marketplace workflow

- Implement companies, users, RFQs, quotations, orders, delivery jobs, and status-history models.
- Build versioned CRUD APIs with ownership and tenant-scope checks for each resource.
- Implement buyer, supplier, and transporter journeys in the frontend, backed by persistent data rather than placeholder dashboard responses.
- Add role-aware navigation, route guards, empty/loading/error states, and accessible form feedback.

### Quality gates / exit criteria

- Migration-based fresh deployment succeeds against PostgreSQL.
- Critical backend routes have integration tests for authentication, tenant isolation, and authorization.
- Frontend has component and end-to-end tests for registration, login, role routing, and the MVP marketplace journey.
- CI runs formatting, linting, typing, tests, dependency scanning, and production builds on every change.

## Phase 2 — Beta

### Objective

Validate the product with real pilot organisations and make the core workflow reliable, observable, and supportable.

### Product and operations

- Add order lifecycle rules, delivery assignment and tracking, notifications, document attachments, search, filters, and operational dashboards.
- Add organisation administration: invite flows, membership lifecycle, role assignment, and audit-log viewing.
- Introduce background jobs for not ifications, imports, scheduled reports, and long-running integrations.
- Add Redis for caching, rate limiting, queues, and carefully scoped idempotency handling.

### Reliability and security

- Deploy separate development, staging, and production environments with managed secrets and restricted network access.
- Add centralized logs, metrics, tracing, error reporting, dashboards, alerting, backups, and restore drills.
- Enforce security headers, CORS allowlists per environment, request-size limits, rate limits, and dependency/SAST scanning.
- Perform threat modelling and an external security review before pilot expansion.

### AI readiness

- Define concrete, human-reviewable AI use cases (for example RFQ summarization, quote comparison, and support assistance).
- Create an AI service boundary with prompt templates, provider abstraction, audit logs, usage quotas, redaction, and evaluation datasets.
- Keep AI suggestions non-authoritative; require user approval before they change commercial or operational records.

### Quality gates / exit criteria

- Pilot SLIs/SLOs, incident response, and support runbooks are operating.
- Load tests confirm expected pilot concurrency and endpoint latency targets.
- Automated deployment to staging is repeatable; production releases have rollback procedures.
- Data retention, privacy, and audit requirements are documented for pilot customers.

## Phase 3 — Production

### Objective

Operate FuelLink AI as a secure, compliant multi-tenant platform with defined service reliability and commercial controls.

### Platform scale and resilience

- Run stateless API workers behind a load balancer with managed PostgreSQL, Redis, object storage, and a durable job queue.
- Implement tenant-aware database access, row/tenant isolation policies, pagination, query budgets, connection pooling, caching, and read-model reporting where warranted.
- Add high-availability design, encrypted backups, disaster-recovery targets, capacity planning, and regular failover/restore exercises.
- Version public APIs, publish a compatibility policy, and provide API keys/service accounts for approved integrations.

### Governance and compliance

- Implement immutable audit trails for sensitive account, commercial, and operational events.
- Complete privacy, retention, deletion, consent, and data-export controls relevant to operating regions and customers.
- Establish vulnerability management, incident response, access reviews, key rotation, and penetration-testing cadence.
- Add financial/commercial controls where payments, pricing, or settlement are introduced.

### AI in production

- Add model/provider fallback, cost controls, evaluation monitoring, prompt/version tracking, safety filters, and human escalation.
- Limit data sent to providers, protect sensitive commercial information, and expose clear user disclosures for AI-assisted functions.

### Quality gates / exit criteria

- Production SLOs, on-call ownership, release management, DR objectives, and security controls are documented and exercised.
- Load, resilience, and penetration tests meet approved targets.
- Core workflows have end-to-end observability and auditable tenant isolation.

## Phase 4 — Enterprise

### Objective

Support large, regulated organisations, complex supply chains, and strategic integrations without weakening tenant isolation or operability.

### Enterprise capabilities

- Add SSO (SAML/OIDC), SCIM provisioning, granular permission policies, delegated administration, and enterprise audit exports.
- Support multi-entity organisations, regional data residency, configurable retention, legal holds, and customer-managed encryption where required.
- Build integration APIs, webhooks, ERP/accounting connectors, fleet/telematics connectors, and partner sandbox environments.
- Add advanced analytics, scheduled exports, custom reporting, forecasting, and governed data-warehouse pipelines.

### Enterprise AI and reliability

- Offer tenant-configurable AI policies, private retrieval/data boundaries, approval workflows, and comprehensive model governance.
- Introduce multi-region resilience where justified by contractual SLOs and data-residency requirements.
- Maintain formal compliance evidence, vendor risk management, customer security documentation, and regular third-party assessments.

### Quality gates / exit criteria

- Enterprise security, compliance, integration, support, and availability commitments are contractually measurable and operationally proven.
- Tenant-level observability, billing/usage reporting, and governance controls scale without cross-tenant exposure.
