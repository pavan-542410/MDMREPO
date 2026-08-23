# Stibo (PCH) Solution & Design Standards

This document indexes the Solution Decision Records (SDRs) and references
that govern STEP Business Rule development and related components.

AI-assisted implementations must follow adopted SDRs.
If a change conflicts with an SDR, it must be explicitly called out.

---

# 1. Core Principles (Always Apply)

When generating or modifying Business Rules:

- Minimize STEP API calls.
- Ensure bulk-safe execution.
- Avoid unnecessary attribute reads/writes.
- Preserve metadata blocks.
- Follow naming standards.
- Respect workflow gating and attribute mandatoriness.
- Ensure UTC handling for timestamps.
- Avoid Web UI configuration overrides when native capabilities exist.

---

# 2. Adopted SDRs (Must Follow)

These are active and binding:

- **Stibo Data Model**
  https://CTC.atlassian.net/wiki/spaces/UDP/pages/4957306889/PCH+Data+Model+Design

- **Stibo Solution Principles & Pragmatic Engineering**
  https://CTC.atlassian.net/wiki/spaces/UDP/pages/5886115841/Stibo+Solution+Principles+and+Pragmatic+Engineering

- **Business Rule Organization Strategy**
  https://CTC.atlassian.net/wiki/spaces/UDP/pages/5914755122/Business+Rule+Organization+Strategy

- **Component Naming & ID Standards**
  https://CTC.atlassian.net/wiki/spaces/UDP/pages/5999755269/Stibo+Component+Naming+and+IDing+Standards

- **Unified Permissions via Native Action Sets**
  https://CTC.atlassian.net/wiki/spaces/UDP/pages/5886050305/Unified+Permissions+via+Stibo+s+Native+Action+Sets+Not+Web+UI+Configurations

---

# 3. Draft SDRs (Consult Before Major Changes)

These may influence implementation decisions:

- Usage of Calculated Attributes for Simple Reference Retrieval
- Attribute Groups as Data Quality Gating
- Single-Level Attribute Inheritance & Validity
- STEP Global Parameters
- Revision Management
- Workflow Event Framework
- All Timestamps in UTC
- Attribute Mandatoriness & Workflow Gating

(See Confluence for full documents.)

---

# 4. Superseded SDRs (Do Not Follow)

- Attribute Group Naming / IDing Standards
- Workflow Naming / IDing Standards
- Merch Web UI related SDR

---

# 5. Additional Technical References

- Stibo Event Handling Orchestration
- Approval Business Action Routing Optimization
- SKU Contract Validation in Bridge Service

These may affect:

- Event processors
- Workflow transitions
- Integration payload handling
- Bridge outbound validation

---

# Usage in AI Prompts

When using AI:

- If the change relates to workflow → consider Workflow Event Framework SDR.
- If related to attribute gating → consider Attribute Mandatoriness SDR.
- If related to naming → follow Naming Standards.
- If related to permissions → use Native Action Sets guidance.
- If related to performance → apply Solution Principles (minimize API calls).

AI must not assume behavior that contradicts adopted SDRs.
If conflict is suspected, it must call it out.

---

# 6. BR Test & Review Checklist (Immediate Enforcement)

Apply this checklist to all Business Rule changes (new or modified), especially
Bridge-impacting parsing/post-processing flows.

## Automated Test Minimums

- Every code change must include both unit and integration tests.
- Unit tests must be fast, isolated, repeatable, self-checking, and readable.
- Use clear test names with scenario + expected outcome.
- Prefer Arrange / Act / Assert structure.
- Prefer one behavior per test; use parameterized tests for input variations.
- Do not treat line coverage percentage as a sufficient quality gate by itself.

## Unit Test Outcomes (Required)

- Cover core logic and edge cases for each touched field/transformation.
- Add explicit tests for `null`, missing, and empty-string inputs.
- Validate object-type guard/no-op behavior for non-target objects.
- Keep BR code and tests compatible with Rhino + supported STEP public APIs.

## Integration Test Outcomes (Required)

- Add at least one integration test per BR (except pure transformer functions that do not read/write STEP).
- Cover primary happy path for each touched field/transformation.
- Cover at least one meaningful guardrail/failure path.
- Use realistic execution context/data for the scenario.
- Validate final outcomes, not only intermediate function calls.

## Bridge-Impacting Changes (Required Validation Before Promotion)

- Deploy to preprod and run representative payloads through changed paths.
- Inspect Bridge logs and validation outputs.
- Verify known records end-to-end in STEP and Bridge.
- Confirm critical fields are populated correctly.
- Confirm no fields were unexpectedly cleared.
- Explicitly confirm literal `"null"` was not propagated.
- Explicitly verify boolean fields where `false` is valid.

## PR Review Gate

A PR is not ready until reviewers can answer:

- What behavior changed?
- Which tests prove expected behavior?
- Which tests prove failure handling?
- Which tests prove final persisted values for custom/high-risk mappings?
