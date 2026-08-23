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
