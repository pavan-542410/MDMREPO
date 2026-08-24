# Agent Rules

## Jira-Driven Implementation Workflow

When the user provides a Jira issue ID (e.g. `SCRUM-1`, `MIT-42`), the agent MUST follow this workflow automatically without asking for further clarification:

### Step 1 — Fetch the Jira issue
- Connect to Jira using the configured MCP server (`mastechdigital-team-znbcn3sj.atlassian.net`).
- Fetch the full issue: summary, description, acceptance criteria, and any nested content.
- Extract all text values from the Atlassian Document Format (ADF) response to get the complete requirements.

### Step 2 — Analyse and plan
- Parse the acceptance criteria from the issue description.
- Identify the type of change required (e.g. new attribute, LOV, business rule, integration config).
- Look up existing repo patterns in `step-config/` and `docs/ai-playbook/` before writing any new files.

### Step 3 — Implement
- Create a new branch named `feature/<JIRA-ID>-<short-description>` (e.g. `feature/SCRUM-1-thinkpad-validity-attribute`).
- Make all required file changes on that branch following the conventions in `docs/ai-playbook/`.
- Validate any new XML files for well-formedness before committing.

### Step 4 — Commit and push
- Commit with message format: `feat(<JIRA-ID>): <summary>`
- Push the branch to `origin`.
- Provide the GitHub PR URL for human review.

### Jira Connection Details
- **Site:** `mastechdigital-team-znbcn3sj.atlassian.net`
- **User:** `pavan.kumar@mastechdigital.com`
- **Token:** Read from `ATLASSIAN_API_TOKEN` environment variable (set as a persistent user env var on this machine).
- **API base:** `https://mastechdigital-team-znbcn3sj.atlassian.net/rest/api/3/issue/<JIRA-ID>`

---

## Branching Policy
- Never commit directly to `main` (or any protected branch).
- For every requested code or config change, create a brand new branch first.
- Branch names should clearly describe the change, for example: `feature/<short-description>` or `fix/<short-description>`.

## Deployment Safety Policy
- Never auto-deploy after making changes.
- Never trigger CI/CD deployment jobs automatically.
- Deployment must be a separate, explicit, manual approval step by a human.

## Required Workflow
1. Create a new branch.
2. Make and validate changes on that branch.
3. Open a pull request for review.
4. Wait for explicit human approval.
5. Deploy manually only after approval.