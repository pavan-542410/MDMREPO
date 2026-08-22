# MIT

STEP (Stibo) configuration repository for MIT Core Product Catalog.  
This repo stores versioned configuration artifacts (primarily JavaScript Business Rules) and Jest-based tests used to validate rule behavior.

## What Is In This Repo

- `step-configs/`
  - Exported STEP configuration objects.
  - Most day-to-day logic lives under `step-configs/BusinessRule/`.
- `test/BusinessRule/`
  - Jest tests for Business Actions, Functions, Conditions, Libraries, and validation flows.
- `.github/workflows/`
  - CI and branch-sync automation.

## Prerequisites

- Node.js `22` (matches CI — use `.nvmrc` with `nvm use`)
- npm

## Setup

```bash
npm install
```

## Running Tests

Run all tests:

```bash
npm test
```

Run a subset (use canonical paths):

```bash
# Unit tests by setup group
npm test -- test/BusinessRule/unit/UtilityLayer/DataFetchers/
npm test -- test/BusinessRule/unit/GlobalBusinessRulesRoot/Libraries/

# Integration tests by setup group
npm test -- test/BusinessRule/integration/ContextLayer/EventQueueContext/
npm test -- test/BusinessRule/integration/GlobalBusinessRulesRoot/BulkUpdateActions/

# Resolve the canonical test path for a BR file
npm run test-path -- --file "step-configs/BusinessRule/BusinessRule_<Name>.js" --kind unit
```

Notes:
- Test helper config lives in `test/BusinessRule/config/`.
- `test/BusinessRule/validate/BusinessRulesValidator.test.js` is currently skipped (`describe.skip`).
- If you run integration-style STEP tests, verify and update `test/BusinessRule/config/stepConfig.json` for your environment and credentials.

## Task Runner (Makefile)

Common commands are available via `make`:

```bash
make validate-xml
make test-unit-validate
make ci-check
make deploy-dev FILES="step-configs/BusinessRule/BusinessRule_X.js"
make deploy-preprod FILES="step-configs/BusinessRule/BusinessRule_X.js"
```

Detailed local commands and troubleshooting:
- `docs/runbooks/local-dev-runbook.md`

## Working With Business Rules

Business rule files are under:

`step-configs/BusinessRule/`

Each file contains STEP export metadata blocks, for example:
- export metadata
- business rule definition
- plugin definition

Keep these blocks intact when editing or adding rules, since STEP import/export depends on them.


### OIEP Setup (Configurations Publisher)

An Outbound Integration Endpoint (OIEP) - Configurations Publisher must be configured before publishing STEP configurations to GitHub.

Prerequisites:

1. Create GitHub repository: `core-product-catalog`.
2. Update `sharedconfig.properties`:

```properties
GitDelivery.RemoteRepoUri.1=https://github.com/MIT/MDMREPO.git
GitDelivery.Branch.1=cp-sfx-dev
GitDelivery.AuthorName.1=UDP
GitDelivery.AuthorEmail.1=udp-pim@Test.com
GitDelivery.RemoteRepoUsername.1=udp-pim
```

3. Create a GitHub Personal Access Token (PAT) and use it as repository user password in the Git Delivery plugin/OIEP configuration.

OIEP configuration requirements:

1. Process engine: use STEP Exporter and invoke OIEP manually (not scheduled).
2. Event queue: enable event queue processing for the publisher endpoint.
3. Output template: publish sealed change package in Advanced STEPXML format.
4. Delivery method: use Change Package Git Delivery plugin with properties above and PAT as password.
5. Event triggering: generate and queue an event whenever a change package is sealed.

### Publish Flow (Dev to GitHub)

1. At the end of a development cycle, create a change package (for example: sprint package) with all relevant configuration changes and seal it.
2. Confirm readiness before invoking OIEP:
   - all completed changes are included in the sealed package
   - a promotion story exists
   - promotion update is shared in `#product-catalog-internal`
   - changes are discussed in standup or parking lot
   - story is updated with promotion notes/decisions
3. Invoke the Change Packages Publisher OIEP.
4. If changes are needed before publish:
   - discard queued event
   - reopen sealed package
   - update package content
   - reseal package
   - repeat readiness checks and invoke again
5. OIEP publish updates `cp-sfx-dev` in GitHub.
6. GitHub workflow `Sync cp-sfx-dev to sfx-dev` runs and syncs `cp-sfx-dev` into `sfx-dev`.

### Post-Publish Git Flow

1. Checkout `sfx-dev` locally.
2. Add/update test cases and verify tests pass.
3. Commit and push changes to `core-product-catalog`.
4. Open a PR from `sfx-dev` to `main` for UDP team review.
5. After approval, merge `sfx-dev` into `main`.
6. Verify the latest CircleCI build succeeds.

### Branch Lifecycle Reset

After `sfx-dev` is merged to `main`:

1. Delete `sfx-dev` and `cp-sfx-dev`.
2. Re-create both branches from `main` for the next deployment cycle.

### Related Step in udp-bridge-service

After publishing/updating repository state, create or update the `core-product-catalog` submodule in `udp-bridge-service` as part of downstream promotion readiness.

## CI

Primary CI config files:
- `.circleci/config.yml`
- `.github/workflows/ci-tests.yml`

CircleCI currently runs `npm install` and `npm test`.
