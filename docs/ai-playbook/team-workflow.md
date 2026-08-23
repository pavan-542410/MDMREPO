# Team Workflow for Engineers, Codex, and Claude Code

This document is the day-to-day workflow for engineers and AI agents working on STEP Business Rules in this repository.

Use it together with:

- `AGENTS.md`
- `docs/ai-playbook/test-structure.md`
- `docs/ai-playbook/usage-guidelines.md`

## Standard Ticket Workflow

1. Engineer syncs local `main` with `origin/main`.
2. Engineer starts a new task by providing the Jira ID, work mode, and a short hint to the AI agent.
3. The AI agent reviews the request, confirms scope, and presents the implementation approach when the selected workflow requires review before coding.
4. The AI agent creates a fresh short-lived branch from `main` using the standard naming pattern:
   - `feature/<JIRA-ID-or-NOJIRA>-<short-description>`
   - `bugfix/<JIRA-ID-or-NOJIRA>-<short-description>`
   - `refactor/<JIRA-ID-or-NOJIRA>-<short-description>`
5. The AI agent implements the change on that branch only.
6. The AI agent runs the relevant tests and validation steps for the touched code.
7. The AI agent summarizes what changed, what was tested, and any remaining risks for human review.
8. After human approval, the AI agent may stage, commit, push, and open a PR into `main`, but only when explicitly instructed.
9. After the PR is approved and merged, delete the short-lived branch.

## Branching Rules

- Never commit ticket work directly to `main`
- Never reuse a previously merged branch for new work
- Always branch from the latest `main`
- Always target `main` in the PR unless a human explicitly requests another base branch
- Never push, create a PR, merge, or delete a branch without explicit human instruction
- Treat `sfx-dev` and `cp-sfx-dev` as legacy branches unless a human explicitly asks to use them

## Engineer Input Standard

Each new task should start with:

- `Jira`: ticket ID such as `PCH-4474`, or `NOJIRA` for approved docs-only or workflow-maintenance changes
- `Mode`: one of the supported implementation modes
- `Hint`: short optional context, impact area, or constraint

The engineer does not need to tell the AI agent how to branch, commit, or open the PR. Those steps must follow this workflow automatically.

## Required Checklist for New or Updated Tests

Before creating or moving a test, confirm all of the following:

- the Business Rule file path is correct
- the first `setupGroups` value was read from the metadata block
- the parent layer was resolved from the exported SetupGroup XML
- the chosen test type is intentional: `unit` or `integration`
- the file name matches the Business Rule file name
- the final path matches the canonical structure
- any missing setupGroup folders were created in the right parent layer

## Required Checklist for New or Updated BR Code

Before finalizing any new or modified BR:

- JSDoc exists for all newly created functions.
- JSDoc is added or updated for each touched existing function.
- Logging follows existing `p(ui, severity, message)` pattern where applicable.
- Debug traces use `p(ui, "INFO", "[DEBUG] ...")` unless the BR has an approved existing debug convention.
- Automated tests exist for changed behavior (unit + integration unless an explicit pure transformer/helper integration exception applies).

## Required Checklist Before Push or PR

Before an engineer asks an AI agent to push or open a PR, confirm all of the following:

- the change was reviewed by a human
- acceptance criteria are satisfied
- the branch name matches the naming standard
- relevant tests or validations were run and reviewed
- the commit message is clear and includes the Jira ID
- the PR target branch is `main`
- any deployment or runtime risks are called out in the PR summary

## Resolver Script

Use the resolver before creating or moving tests:

```bash
npm run test-path -- --file "step-configs/BusinessRule/BusinessRule_returnValuesJSON.js" --kind unit
```

Integration example:

```bash
npm run test-path -- --file "step-configs/BusinessRule/BusinessRule_MakeSelectedAssetPrimary.js" --kind integration
```

Repository-wide mapping example:

```bash
npm run test-path:all -- --kind integration --format json
```

The script prints:

- Business Rule path
- Business Rule ID
- Business Rule type
- `setupGroups` leaf folder
- XML-derived parent layer
- expected canonical test path

## Rules for AI Agents

AI agents must not invent their own branch workflow or test taxonomy.

Before writing or moving a Business Rule test, the agent must:

1. read `docs/ai-playbook/test-structure.md`
2. run or logically follow the resolver workflow
3. place the test under `test/BusinessRule/unit/<Parent>/<SetupGroup>/` or `test/BusinessRule/integration/<Parent>/<SetupGroup>/`
4. preserve `.test.js` for unit tests and `.int.test.js` for integration tests
5. keep helper code out of arbitrary setupGroup folders unless it is test-specific

Before implementing code for a new Jira task, the agent must:

1. ensure local work starts from the latest `main`
2. create or switch to a fresh short-lived branch for that ticket
3. keep all implementation commits on that ticket branch
4. avoid any push, PR, merge, or branch deletion action until explicitly instructed
5. present a concise review summary before asking for the next instruction

If repository instructions conflict, `AGENTS.md` is the source of truth for branching and this document is the source of truth for day-to-day execution details.
