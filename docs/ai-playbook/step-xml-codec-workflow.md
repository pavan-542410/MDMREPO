# STEP XML Codec Workflow

Use this runbook for STEP XML artifacts that contain gzip+Base64 encoded payloads (for example `<Configuration>` values starting with `H4sI...`).

Tool:
- `tools/step-xml-codec/cli.js`

Applies to:
- `step-configs/STEPWorkflow/STEPWorkflow_*.xml`
- `step-configs/GatewayIntegrationEndpoint/GatewayIntegrationEndpoint_*.xml`
- `step-configs/EventProcessor/EventProcessor_*.xml`
- `step-configs/InBoundIntegrationEndpoint/InBoundIntegrationEndpoint_*.xml`
- `step-configs/OutBoundIntegrationEndpoint/OutBoundIntegrationEndpoint_*.xml`

---

## Workflow

1. List encoded blobs in target file:
```bash
node tools/step-xml-codec/cli.js list "<path/to/file.xml>"
```

2. Decode target blob to an output directory:
```bash
node tools/step-xml-codec/cli.js decode "<path/to/file.xml>" --tag Configuration --index 0 --out /tmp/decoded
```

3. Edit decoded output file (usually `/tmp/decoded/<Tag>_<Index>.xml`).

4. Re-encode into original XML:
```bash
node tools/step-xml-codec/cli.js encode "<path/to/file.xml>" --tag Configuration --index 0 --from /tmp/decoded/Configuration_0.xml
```

5. Validate XML before deploy:
```bash
npm run validate:xml
```

6. Deploy to dev:
```bash
npm run step-deploy -- --route rest --env dev --files "<path/to/file.xml>"
```

7. After manual dev validation, deploy to preprod:
```bash
npm run step-deploy -- --route rest --env preprod --files "<path/to/file.xml>"
```

---

## Guardrails

- Do not modify STEP export metadata headers.
- Keep edits minimal and scoped to accepted Jira requirements.
- Decode only the blob/tag/index you plan to change.
- Validate in dev before preprod for every config change.
- Never auto-deploy to production.

---

## Useful Commands

Decode all blobs with comments:
```bash
node tools/step-xml-codec/cli.js decode "<path/to/file.xml>" --out /tmp/decoded --show-comment
```

Write encoded result to a separate file for review:
```bash
node tools/step-xml-codec/cli.js encode "<path/to/file.xml>" --tag Configuration --index 0 --from /tmp/decoded/Configuration_0.xml --out-file /tmp/updated.xml
```
