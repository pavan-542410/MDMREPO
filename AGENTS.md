# Agent Rules

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
