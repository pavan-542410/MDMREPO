# AI Usage Guide – STEP Business Rule Development

## 1. Purpose
This playbook defines how AI (Codex / ChatGPT) is used in STEP Business Rule development at MIt.

AI is used to:
- Assist with reasoning and solution design.
- Generate or modify business rule code.
- Propose unit tests.
- Suggest edge cases.
- Provide structured deploy commands.

AI does **not**:
- Replace engineering judgment.
- Make architectural decisions independently.
- Deploy to production.
- Bypass manual validation.

Engineers remain fully responsible for:
- Reviewing design and code.
- Validating behavior in STEP.
- Ensuring safe deployments.

## 2. Folder Structure
```text
/docs/ai-playbook/
  templates/            # reusable prompt templates
  records/              # sprint-level AI execution logs
  team-workflow.md      # required workflow for BR changes and test placement
  test-structure.md     # canonical Business Rule test placement standard
  usage-guidelines.md   # workflow and rules
```

Rules:
- Templates are never edited per Jira.
- Records contain sprint-based execution entries.
- `team-workflow.md` defines the team checklist for BR and test work.
- `test-structure.md` defines where Business Rule tests must live.
- This structure prevents file sprawl and maintains traceability.

## 2a. Business Rule Test Placement

Before creating or modifying tests, AI must read:

`docs/ai-playbook/test-structure.md`

Before placing or moving a Business Rule test, AI should also use:

`npm run test-path -- --file "<path/to/BusinessRule.js>" --kind unit|integration`

Required behavior:
- use the Business Rule `setupGroups` metadata as the leaf test folder name
- resolve the canonical STEP parent layer from `step-configs/SetupGroup/SetupGroup_<setupGroup>.xml`
- separate `unit` and `integration` tests
- create missing setupGroup folders when needed
- avoid placing new tests in deprecated legacy folders

## 3. When to Use Each Template
Use `legacy-patch.md` when:
- Updating legacy Business Rules.
- Applying minimal or surgical fixes.
- Avoiding structural refactor.
- Maintaining backward compatibility.

Use `3-tier.md` when:
- Creating new Business Rules.
- Refactoring to Context / Logic / Utility architecture.
- Improving testability and modularity.

Use `bugfix.md` (if available) when:
- Diagnosing runtime failures.
- Investigating event processor issues.
- Handling integration-related errors.

Do not mix architectural modes in a single prompt.

## 4. Standard Workflow
### Step 1: Create sprint record entry
Open:
```text
/docs/ai-playbook/records/<current-sprint>.md
```

Add a new section:
```text
STP-XXXX
Mode: LEGACY_PATCH or FOLLOW_3_TIER
Context: <1-line intent>
```

### Step 2: Use template
Copy the appropriate template from `/templates/`.

Fill only required sections:
- JIRA ID
- Business Context (1–2 lines)
- Architecture Mode

Do not overfill. Allow AI to reason.

### Step 2a: Resolve canonical test path
Before creating or moving tests, run:

```bash
npm run test-path -- --file "step-configs/BusinessRule/BusinessRule_<Name>.js" --kind unit
```

or:

```bash
npm run test-path -- --file "step-configs/BusinessRule/BusinessRule_<Name>.js" --kind integration
```

Use that output as the canonical location for the test file.

### Step 3: Paste into AI
Paste template content into Codex and add:
```text
Start by:
- Pulling Jira details
- Validating Acceptance Criteria
- Proposing approach

Do NOT generate code yet.
```

### Step 4: Review approach
Before approving code, confirm:
- Impacted BR files
- Acceptance Criteria clarity
- Minimal change strategy (for legacy)
- Architectural compliance (for 3-tier)

If approach is incorrect, request revision.

### Step 5: Approve code generation
Only after validating approach:
```text
Approved. Generate minimal diff patch and tests.
```

Review:
- Diff correctness
- Metadata preservation
- Null safety
- Performance impact
- Bulk execution safety

### Step 6: Deploy to dev
Deploy only changed files:
```bash
npm run step-deploy -- --route rest --env dev --files "<path/to/BR.js>"
```

Manual validation checklist:
- Workflow transitions
- Attribute updates
- Event processor behavior
- Outbound Bridge integrations

### Step 7: Iterate if needed
If issues are found, provide:
- Observed behavior
- Expected behavior
- Logs
- Environment
- Sample payload (if applicable)

Request minimal corrective patch only.

### Step 8: Preprod and production
- Promote to preprod only after dev validation.
- Production deployment remains manual and controlled.
- AI must never initiate or automate production deployment.

## 5. Non-Negotiable Safety Rules
- Never allow AI to modify STEP metadata blocks.
- Never allow AI to auto-deploy to production.
- Always request approach before code.
- Always manually review diffs.
- Always validate in dev before preprod.
- Never accept code that does not satisfy Acceptance Criteria.

## 6. AI Expectations
AI must:
- Pull Jira title and Acceptance Criteria.
- Flag unclear or missing Acceptance Criteria.
- Identify impacted Business Rule files.
- Resolve canonical test paths before adding or moving Business Rule tests.
- Propose approach before coding.
- Provide minimal diff output (for legacy).
- Add or update JSDoc for newly created and touched BR functions.
- Use existing `p(ui, severity, message)` logging pattern in new/touched BR code paths and include debug traces via `p(ui, "INFO", "[DEBUG] ...")` unless an approved BR-specific convention exists.
- Provide unit and integration test updates for changed behavior (except explicitly documented pure transformer/helper integration-test exceptions).
- Highlight potential regression risks.
- Provide explicit deploy commands.

## 7. AI Prohibited Behavior
AI must not:
- Refactor legacy BRs in `LEGACY_PATCH` mode.
- Modify unrelated logic.
- Introduce architectural changes unintentionally.
- Skip test considerations.
- Assume missing business requirements.
- Suggest production automation.

## 8. Sprint Record Example
```text
## STP-4821
Mode: LEGACY_PATCH
Context: Sell-side workflow not transitioning after imagery enrichment.
Status: Dev validated (1 iteration required).
```

Keep records concise. Avoid duplication of full templates inside sprint logs.

## 9. Engineering Ownership
AI is an accelerator.

Engineering accountability remains with the developer.

All STEP runtime behavior, workflow transitions, integration impacts, and production safety remain human-validated responsibilities.
