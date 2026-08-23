# AI-Assisted Development Workflow

This document describes the end-to-end process for implementing Jira stories using Claude Code in this repository.

---

## Overview

Every story follows a two-phase flow:

```
Phase 1: Kickoff → Agent Research → Plan Review
Phase 2: Implementation → Dev Validation → Preprod → (Manual Prod)
```

You provide minimal input. The agent does the research. You review and approve before any code is written.

---

## Phase 1 — Kickoff & Plan

### Step 1: Start with the Kickoff Template

Open `docs/ai-playbook/templates/00-kickoff.md` and send this to the agent:

```
Jira: PCH-XXXX
Mode: 3-TIER          # or LEGACY_PATCH or BUGFIX
Hint: <optional 1-line context>
```

### Step 2: Agent Researches (Plan Mode)

The agent will automatically:
- Fetch the Jira story (title, description, AC)
- Flag any AC gaps before going further
- Flag mode/template selection discrepancies before going further
- Search the codebase for impacted Business Rule files
- Read those BRs to understand current behavior
- Review `docs/ai-playbook/standards.md` for relevant SDRs
- Build and present a structured Plan

> No code is written in this step.

### Step 3: Review the Plan

The agent presents a Plan covering:
- Jira summary and AC checklist
- Any AC gaps or flags
- Any mode/template mismatch flags
- Impacted files with reasons
- Proposed approach (2–4 bullets)
- Layer responsibilities (3-TIER only)
- Relevant SDR considerations
- Regression risks
- Exact deploy command

**Your responses:**

| You say                 | What happens                                        |
|-------------------------|-----------------------------------------------------|
| `Proceed`               | Agent starts implementation                         |
| `Proceed with changes:` | Agent adjusts approach then implements              |
| `Question: ...`         | Agent answers, waits for follow-up                  |
| `Hold`                  | Agent stops — you can resume later                  |

---

## Phase 2 — Implementation

### Step 4: Agent Implements

After `Proceed`, the agent follows the appropriate template strictly:
- `01-3-tier.md` — for new BRs or full refactors
- `02-legacy.md` — for surgical patches to existing BRs
- `03-bugfix.md` — for targeted bug investigations and fixes

Deliverables from the agent:
- Code changes (full files or diff format for legacy patches)
- Jest unit tests for Logic and Utility layers
- Integration tests for changed behavior (except explicitly documented pure transformer/helper exceptions)
- XML configuration validation (`npm run validate:xml` or `make validate-xml`)
- Exact deploy command for dev
- JSDoc updates for newly created and touched functions
- `p(ui, severity, message)`-based debug logging in new/touched BR code paths

### Step 5: Deploy to Dev

Before deploying, run:

```bash
npm run validate:xml
```

```bash
npm run step-deploy -- --route rest --env dev --files "<path/to/BR.js>"
```

Manually validate in the STEP dev environment against each AC item.

### Step 6: Iterate if Needed

If an issue is found in dev, report it to the agent:

```
Issue found in dev:
- Observed: <what happened>
- Expected: <what should happen>
- Logs: <relevant error or log snippet>

Provide a minimal corrective patch.
```

### Step 7: Deploy to Preprod

Once dev validation passes:

```bash
npm run step-deploy -- --route rest --env preprod --files "<path/to/BR.js>"
```

### Step 8: Production (Manual Only)

Production deployments are always manual. Never auto-deploy to prod.

---

## Choosing the Right Mode

| Situation                                      | Mode             | Template                     |
|------------------------------------------------|------------------|------------------------------|
| New BR from scratch                            | `3-TIER`         | `01-3-tier.md`               |
| Refactor legacy BR into 3-tier                 | `3-TIER`         | `01-3-tier.md`               |
| Small fix to existing BR — no restructuring    | `LEGACY_PATCH`   | `02-legacy.md`               |
| Investigating a bug, root cause unknown        | `BUGFIX`         | `03-bugfix.md`               |
| Bug confirmed, fix is surgical                 | `LEGACY_PATCH`   | `02-legacy.md`               |
| Adding new values to an existing LOV           | `LOV_ADD_VALUES` | `04-lov-add-values.md`       |
| Creating new attribute(s) or attribute group(s)| `ADD_ATTRIBUTE`  | `05-add-attribute.md`        |
| Adding/backfilling tests for an existing BR    | `ADD_TESTS`      | `06-add-tests.md`            |
| Refactoring a legacy BR into 3-tier            | `REFACTOR`       | `07-refactor.md`             |
| Updating encoded STEP config payloads          | `CONFIG_CODEC`   | `08-step-config-codec.md`    |

---

## Template Locations

| Template               | Purpose                                      |
|------------------------|----------------------------------------------|
| `00-kickoff.md`        | Entry point — minimal input to start a story |
| `01-3-tier.md`         | 3-tier implementation rules and output spec  |
| `02-legacy.md`         | Legacy patch rules and output spec           |
| `03-bugfix.md`         | Bug investigation and fix output spec        |
| `04-lov-add-values.md` | Add new values to an existing LOV XML file                |
| `05-add-attribute.md`  | Create new attribute(s) and/or attribute group(s)         |
| `06-add-tests.md`      | Add or backfill tests for an existing BR                  |
| `07-refactor.md`       | Refactor a legacy BR into 3-tier architecture             |
| `08-step-config-codec.md` | Update encoded STEP config payloads (workflow/endpoints/processors) |

Supplemental guides:
- `docs/ai-playbook/attribute-lov-patterns.md` — reusable attribute + LOV creation conventions from repo patterns
- `docs/ai-playbook/template-selection.md` — mode/template decision matrix
- `docs/ai-playbook/step-xml-codec-workflow.md` — decode/edit/encode/deploy runbook for encoded STEP config payloads

---

## Safety Rules (Non-Negotiable)

- Never auto-deploy to production
- Never modify STEP metadata blocks
- Never proceed past Plan without engineer approval
- Always validate in dev before preprod
- Always review diffs before approving

---

## Sprint Records

Sprint records are maintained under `docs/ai-playbook/records/`:
- One `.md` file per sprint
- File naming: `FY26Q3-Sprint-<Letter>.md`
- Contents: tasks worked on, Claude-assisted work summary, key decisions
