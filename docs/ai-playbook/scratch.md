PLANNING MODE — Do NOT modify any project files. Do NOT edit templates/standards docs.
Only analyze PCH-4234 and propose an approach.

# STEP Business Rule – Legacy Patch Template

---

## JIRA Reference

**JIRA ID:**

> The agent must:
> - Pull Jira Title, Description, and Acceptance Criteria.
> - Explicitly flag missing or unclear Acceptance Criteria before coding.
> - Confirm understanding of the change before implementation.

---

## Business Context (1–2 lines from engineer)

<One-line summary of why this patch is required>

Example:

- Adjust workflow transition logic after requirement update.
- Add null-safety for missing imagery metadata.
- Fix missed condition in sell-side enrichment.

---

## Engineer Guidance (Optional but Recommended)

### Target Business Rule(s) to Modify

If known, list explicitly:

- <path/to/BusinessRule.js>
- <path/to/AnotherRule.js>

If not provided, the agent must identify impacted BR(s) and confirm before coding.

---

### Intended Change (High-Level)

Describe what you expect to change.

Examples:

- Add null guard before accessing attribute X.
- Modify workflow transition condition to include attribute Y.
- Skip enrichment when Cloudinary payload is missing Z.

The agent must follow this intent unless it conflicts with Jira Acceptance Criteria.

---

## Architecture Mode: LEGACY_PATCH

### Implementation Rules (Non-Negotiable)

- DO NOT refactor into 3-tier architecture.
- DO NOT restructure or reorganize the file.
- DO NOT modify STEP metadata blocks or export headers.
- DO NOT redesign logic patterns.
- Apply minimal, surgical, localized changes only.
- Preserve backward compatibility.
- Avoid behavioral drift outside the requested change.

---

### Controlled Improvements (Allowed but Limited)

- You MAY introduce a small reusable helper function if clearly beneficial and low-risk.
- Prefer calling existing shared utilities if available.
- Do NOT restructure legacy BR around new abstractions.
- Do NOT extract layers.

---

## Standards & SDR Alignment

Apply relevant guidance from:

`docs/ai-playbook/standards.md`

Particularly:

- Minimize STEP API calls.
- Ensure bulk-safe execution.
- Follow naming standards.
- Respect workflow gating and mandatoriness.
- Use UTC where applicable.

If the proposed fix conflicts with an adopted SDR, explicitly call it out.

---

## Impacted Scope (Agent Must Confirm)

- Object Type:
- Workflow:
- Integration Points:
- Business Rule File(s):

The agent must confirm impacted files before generating code.

---

## Technical Constraints

- Ensure null safety and defensive checks.
- Avoid adding unnecessary STEP API calls.
- Consider bulk execution contexts.
- Avoid impacting unrelated workflows.
- Maintain current performance characteristics.

---

## Required Output From Agent

1. Pull Jira Title and Acceptance Criteria.
2. Confirm Acceptance Criteria sufficiency (list gaps if any).
3. Confirm impacted Business Rule file(s).
4. Propose minimal patch strategy BEFORE generating code.
5. Provide code changes in **diff format only**.
6. Highlight modified lines and explain rationale briefly.
7. Add/update required unit and integration tests for changed behavior (or explicitly justify allowed integration-test exception for pure transformer/helper logic).
8. List regression risks and edge cases.
9. Provide exact dev deploy command for changed file(s) only.

---

## Manual Verification Checklist (Dev)

- [ ] Workflow transitions validated (if applicable)
- [ ] Attributes updated correctly
- [ ] No runtime errors
- [ ] No regression in existing behavior
- [ ] Event processor behavior verified (if applicable)
- [ ] Bridge outbound behavior verified (if applicable)

---

## Deployment (Dev Example)

```bash
npm run step-deploy -- --route rest --env dev --files "<path/to/BR.js>"
