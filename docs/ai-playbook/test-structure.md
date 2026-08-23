# Business Rule Test Structure Standard

This document defines the canonical test layout for STEP Business Rules in this repository.

All human authors and AI models must follow this structure when:
- creating a new Business Rule test
- adding coverage for an existing Business Rule
- refactoring or relocating an existing test

This standard applies only to repository structure and test placement.
It does not change STEP export layout in the source tree.

Team workflow details live in:

`docs/ai-playbook/team-workflow.md`

## Source of Truth

Business Rules remain in:

`step-configs/BusinessRule/`

Tests must be organized from two repo-local sources:

1. the Business Rule metadata header in `step-configs/BusinessRule/`
2. the SetupGroup XML exports in `step-configs/SetupGroup/`

Use the first `setupGroups` value declared in the exported Business Rule file as the leaf folder.
Use the matching `SetupGroup_<setupGroup>.xml` file to resolve the canonical parent via `ParentID`.

Example:

```js
"setupGroups" : [ "Libraries" ]
```

The corresponding unit test belongs under a hierarchy derived from the SetupGroup XML:

`test/BusinessRule/unit/<ParentID>/Libraries/`

If a required `setupGroups` folder does not exist yet, create it.

## Canonical STEP Hierarchy

STEP Business Rules may be organized in a two-level hierarchy:

- parent layer
- setupGroup

Examples from STEP:
- `ContextLayer -> WebUIContext`
- `ContextLayer -> EventQueueContext`
- `LogicLayer -> StyleVariantActions`
- `WebUI -> MerchOperationsUI`
- `GlobalBusinessRulesRoot -> Libraries`

That hierarchy should be resolved from the exported SetupGroup XML files whenever possible.

Examples:
- `SetupGroup_WebUIContext.xml` -> `ParentID="ContextLayer"`
- `SetupGroup_StyleVariantActions.xml` -> `ParentID="LogicLayer"`
- `SetupGroup_DataFetchers.xml` -> `ParentID="UtilityLayer"`

## Canonical Test Layout

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
    *.test.js
```

## Placement Rules

Use these rules in order:

1. Read the Business Rule file from `step-configs/BusinessRule/`.
2. Extract the first value from `setupGroups`.
3. Read the matching file in `step-configs/SetupGroup/SetupGroup_<setupGroup>.xml`.
4. Resolve the canonical parent layer from `ParentID`.
5. Decide whether the test is unit or integration.
6. Place the test under the matching parent layer and setupGroup.

Parent layer should come directly from the SetupGroup XML `ParentID`.

Common examples include:
- `ContextLayer`
- `LogicLayer`
- `UtilityLayer`
- `WebUI`
- `GlobalBusinessRulesRoot`

If the SetupGroup XML file is missing or the parent layer is not discoverable with confidence, fall back to:

- `test/BusinessRule/unit/Unmapped/<setupGroup>/...`
- `test/BusinessRule/integration/Unmapped/<setupGroup>/...`

Do not guess a parent layer when confidence is low.

## Resolver Script

Use the repo-local resolver before creating or moving tests:

```bash
npm run test-path -- --file "step-configs/BusinessRule/BusinessRule_returnValuesJSON.js" --kind unit
```

Integration example:

```bash
npm run test-path -- --file "step-configs/BusinessRule/BusinessRule_MakeSelectedAssetPrimary.js" --kind integration
```

Repository-wide mapping:

```bash
npm run test-path:all -- --kind integration --format json
```

The resolver uses:
- the Business Rule metadata block for `setupGroups`
- `SetupGroup_<setupGroup>.xml` for `ParentID`

Use its output as the default source of truth for canonical test placement.

Examples:

- `BusinessRule_CoreLogicLibrary.js` with `setupGroups: ["Libraries"]`
  -> `test/BusinessRule/unit/GlobalBusinessRulesRoot/Libraries/BusinessRule_CoreLogicLibrary.test.js`
- `BusinessRule_returnValuesJSON.js` with `setupGroups: ["DataFetchers"]`
  -> `test/BusinessRule/unit/UtilityLayer/DataFetchers/BusinessRule_returnValuesJSON.test.js`
- `BusinessRule_MakeSelectedAssetPrimary.js` with `setupGroups: ["WebUIContext"]`
  -> `test/BusinessRule/integration/ContextLayer/WebUIContext/BusinessRule_MakeSelectedAssetPrimary.int.test.js`
- `BusinessRule_merchOperationsLibrary.js` with `setupGroups: ["MerchOperationsUI"]`
  -> `test/BusinessRule/unit/WebUI/MerchOperationsUI/BusinessRule_merchOperationsLibrary.test.js`
- `BusinessRule_UpdatePrimaryImage.js` with `setupGroups: ["EventProcessorActions"]`
  -> `test/BusinessRule/integration/ContextLayer/EventQueueContext/BusinessRule_UpdatePrimaryImage.int.test.js`

## Test Type Rules

Use `unit/` when the test:
- verifies pure logic or helper behavior
- relies on mocks/stubs instead of realistic STEP flows
- does not need multi-rule orchestration

Use `integration/` when the test:
- validates interaction across multiple layers or Business Rules
- simulates STEP workflow, event, or object behavior more deeply
- depends on richer fixtures or system-like setup

Use `validate/` when the test:
- enforces repo-wide rules or metadata invariants
- validates naming, structure, or export consistency
- is not owned by a single Business Rule behavior

## Shared Test Support

Reusable helpers must live under:

`test/BusinessRule/support/`

This includes:
- STEP harness utilities
- mock factories
- fixtures
- auth helpers used by tests
- shared assertion helpers

Do not create one-off helper files inside arbitrary setupGroup folders unless they are specific to a single test file.

## Deprecated Layout

Do not add new tests to deprecated layer paths:

- `test/BusinessRule/ContextLayer/`
- `test/BusinessRule/LogicLayer/`
- `test/BusinessRule/UtilityLayer/`

Those folders are deprecated and should not receive new tests.

## Rules for AI Models

When an AI model creates or updates a Business Rule test, it must:

1. inspect the target Business Rule metadata before choosing a test folder
2. use `setupGroups` as the leaf folder name
3. resolve parent layer from `step-configs/SetupGroup/SetupGroup_<setupGroup>.xml` or by using `npm run test-path`
4. preserve that canonical parent layer when found
5. create missing folders when needed
6. keep `unit` and `integration` separate
7. avoid inventing alternate taxonomies that do not match the exported STEP hierarchy

If a prompt conflicts with this standard, this file wins for repository structure.
