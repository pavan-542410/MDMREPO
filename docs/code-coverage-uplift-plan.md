# Code Coverage Uplift Plan to 80%

## Goal
Raise Jest global coverage for `step-configs/BusinessRule/**/*.js` to at least 80% for statements, branches, functions, and lines by adding real behavior-focused tests for individual Business Rules in their canonical test locations.

## Core Implementation Rule
- Do not increase coverage by adding generic execution logic to shared smoke helpers.
- Do not rely on synthetic catch-all mocks that invoke every export blindly.
- Increase coverage by analyzing each Business Rule, understanding its expected behavior, and adding dedicated assertions in the corresponding `BusinessRule_<Name>.test.js` or `BusinessRule_<Name>.int.test.js` file.
- Keep existing smoke suites only as bootstrap/syntax safety nets, not as the main coverage strategy.

## Development Plan
- Generate a fresh baseline coverage report on `fix/CodeCoverage` and rank Business Rules by uncovered lines and uncovered branches.
- Prioritize BRs with the highest uncovered LOC that are currently covered only by `BusinessRule_MissingCoverageSmoke` suites.
- For each prioritized BR, inspect its metadata, exported API, STEP dependencies, and current test location using `npm run test-path`.
- Add or extend tests in the canonical folder under `test/BusinessRule/unit/<ParentID>/<SetupGroup>/` for pure logic or mockable STEP-boundary behavior.
- Add or extend tests in `test/BusinessRule/integration/<ParentID>/<SetupGroup>/` only when the BR behavior depends on orchestration or STEP interactions that cannot be safely validated with local unit mocks.
- Prefer explicit fixtures, focused node/manager mocks, and assertions on returned values, side effects, log calls, workflow transitions, or generated HTML/JSON.
- After each BR batch, rerun coverage, re-rank remaining gaps, and continue with the next highest-impact files until all four global thresholds reach 80%.
- Once the target is met, keep `jest.config.js` global thresholds at 80 for branches/functions/lines/statements and run the full test suite.

## Test Implementation Standards
- Place each new test file in the canonical path resolved from BR metadata and SetupGroup XML.
- Match existing test style and use local BR-specific mock builders instead of a repository-wide generic invoker.
- Cover positive paths, negative paths, edge cases, fallback behavior, and error handling branches.
- For legacy Rhino-style BRs, do not refactor production code just to make tests easier unless a real parser/runtime defect blocks Jest and the source change is reviewed separately.
- Preserve STEP export metadata blocks in all Business Rule files.

## Suggested Execution Order
- Start with large pure-data or pure-logic libraries that can gain substantial coverage from direct output assertions, such as mapping libraries and utility libraries.
- Move next to HTML/JSON Business Functions with deterministic output and straightforward node mocks.
- Then cover Context Layer and workflow BRs with targeted mock-based unit tests.
- Add integration tests only for BRs whose behavior meaningfully depends on multi-rule orchestration or STEP workflow boundaries.

## Known Current Blockers
- `BusinessRule_returnAttributeLinkDetailsHTML.js` currently has a duplicate parameter name in `exports.operation0 = function (node,node)`, which causes Jest/Babel coverage instrumentation to fail for that file. That source defect should be handled as a separate explicit code fix with a dedicated test, not by hiding it in a generic coverage helper.
- With dedicated tests only, the current global coverage baseline is still far below 80%, so this should be executed as an iterative multi-batch test implementation effort.

## Validation Checklist
- Run targeted tests for each new or updated BR test file with `--coverage=false` first when global thresholds are not yet met.
- Run `npm run test:unit-validate -- --coverage --coverageDirectory=/tmp/cpc-coverage --coverageReporters=text-summary --runInBand` after each batch to measure progress.
- Run full `npm test -- --coverage` before declaring the 80% target complete.
- Review `coverage/lcov-report/index.html` or `/tmp/cpc-coverage/lcov.info` after each batch to confirm actual file-level improvements.
- Manually review diffs before promoting changes and validate in dev before preprod.

## Acceptance Criteria
- Every newly targeted Business Rule has behavior-oriented tests in its corresponding canonical test file.
- No generic shared helper is used to inflate coverage by auto-invoking all exports.
- Jest global thresholds remain at 80/80/80/80 and the full test suite passes with coverage enabled.
- The final coverage increase is explainable by concrete BR-specific tests and reviewed file-level improvements, not incidental helper execution.
