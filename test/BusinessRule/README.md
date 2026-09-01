# Business Rule Test Organization

The canonical test structure is defined in:

- `docs/ai-playbook/test-structure.md`
- `docs/ai-playbook/team-workflow.md`

All new or updated Business Rule tests must follow that document.

## Canonical Layout

```text
test/BusinessRule/
  unit/
    <parentLayer>/
      <setupGroup>/
        BusinessRule_<Name>.test.js
  integration/
    <parentLayer>/
      <setupGroup>/
        BusinessRule_<Name>.int.test.js
  support/
    fixtures/
    mocks/
    step/
    factories/
    utils/
  validate/
```

## Placement Rule

Tests are placed by canonical STEP hierarchy:
- parent layer from `SetupGroup_<setupGroup>.xml`
- `setupGroups` from the Business Rule metadata

Example:

- `BusinessRule_CoreLogicLibrary.js` with `setupGroups: ["Libraries"]`
  belongs under `test/BusinessRule/unit/GlobalBusinessRulesRoot/Libraries/`

If the matching SetupGroup XML file is missing or the parent layer is unclear, use `Unmapped/<setupGroup>/` temporarily.
If the target folder does not exist, create it.

Before creating or moving a test, use the resolver:

```bash
npm run test-path -- --file "step-configs/BusinessRule/BusinessRule_returnValuesJSON.js" --kind unit
```

That command prints the expected canonical folder for the Business Rule.

## Shared Test Support

Shared test helpers belong under `test/BusinessRule/support/`.

Legacy helpers in `test/BusinessRule/config/` can move into `support/` gradually.

Repo-wide structural validation belongs under `test/BusinessRule/validate/`.

## Deprecated Folders

Do not add new tests to these legacy locations:

- `test/BusinessRule/ContextLayer/`
- `test/BusinessRule/LogicLayer/`
- `test/BusinessRule/UtilityLayer/`

The old layer folders are deprecated and should no longer receive tests.

## Running Tests

Examples using the new structure:

```bash
# Run all tests
npm test

# Run all unit tests in a setupGroup
npm test -- test/BusinessRule/unit/GlobalBusinessRulesRoot/Libraries/

# Run all integration tests in a setupGroup
npm test -- test/BusinessRule/integration/ContextLayer/EventQueueContext/

# Run a specific test file
npm test -- test/BusinessRule/unit/GlobalBusinessRulesRoot/Libraries/BusinessRule_CoreLogicLibrary.test.js

# Resolve the canonical path for a Business Rule test
npm run test-path -- --file "step-configs/BusinessRule/BusinessRule_returnValuesJSON.js" --kind unit
```

## Running Tests With Coverage (HTML Report)

Jest is already configured with `coverageReporters: ['text', 'lcov', 'clover', 'html']`, so `--coverage` generates an HTML report.

```bash
# Run all projects with coverage
npm test -- --coverage

# Run unit + validate with coverage (faster local loop)
npm run test:unit-validate -- --coverage

# Run integration only with coverage
npm test -- --selectProjects integration --coverage

# Run one test file with coverage
npm test -- test/BusinessRule/unit/GlobalBusinessRulesRoot/Libraries/BusinessRule_CoreLogicLibrary.test.js --coverage
```

Coverage output is written to:

- `coverage/lcov.info` (machine-readable)
- `coverage/lcov-report/index.html` (open this in a browser for the HTML report)
