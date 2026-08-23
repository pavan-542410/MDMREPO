# STEP XML Codec

`step-xml-codec` is a lightweight CLI for decoding and re-encoding gzip+Base64 blobs embedded in STEP XML export files.

It is useful when a STEP config file contains XML elements such as `<Configuration>` whose text content starts with `H4sI...`, which indicates gzip-compressed content encoded as Base64.

## Location

- CLI: [`tools/step-xml-codec/cli.js`](/Users/sankartalam/Documents/GH/core-product-catalog/tools/step-xml-codec/cli.js)

## What It Does

- Lists embedded gzip+Base64 blobs in a STEP XML file
- Decodes blobs to stdout or individual files
- Re-encodes edited content back into the source XML

## Supported STEP Files

The tool is generic and works on any STEP XML file that contains `H4sI`-prefixed gzip+Base64 content, including:

- `STEPWorkflow_*.xml`
- `GatewayIntegrationEndpoint_*.xml`
- `EventProcessor_*.xml`
- `InBoundIntegrationEndpoint_*.xml`
- `OutBoundIntegrationEndpoint_*.xml`

## How It Works

- Uses Node's built-in `zlib` to `gunzip` and `gzip` content
- Finds blobs with a regex matching XML elements whose text content starts with `H4sI`
- Does not hardcode XML tag names, so discovery works across multiple STEP export types
- Identifies each blob by:
  - tag name
  - 0-based index within that tag name
- Adds context when available:
  - nearest parent element with an `ID` attribute
  - nearby `<!-- Definition: ... -->` comment

## Commands

Run from the repository root:

```bash
node tools/step-xml-codec/cli.js <command> <file> [options]
```

### 1. List Blobs

Shows all decodable blobs in a file, along with their tag/index and nearest parent ID context.

```bash
node tools/step-xml-codec/cli.js list "step-configs/STEPWorkflow/STEPWorkflow_ProductAttributionAndApproval.xml"
```

### 2. Decode Blobs

Decode all blobs to stdout:

```bash
node tools/step-xml-codec/cli.js decode "step-configs/EventProcessor/EventProcessor_ElasticSearchConfig.xml"
```

Decode one specific blob:

```bash
node tools/step-xml-codec/cli.js decode "step-configs/STEPWorkflow/STEPWorkflow_ProductAttributionAndApproval.xml" --tag Configuration --index 0
```

Decode and write blobs to files:

```bash
node tools/step-xml-codec/cli.js decode "step-configs/STEPWorkflow/STEPWorkflow_ProductAttributionAndApproval.xml" --out /tmp/decoded
```

Show the nearby `Definition` comment if present:

```bash
node tools/step-xml-codec/cli.js decode "step-configs/STEPWorkflow/STEPWorkflow_ProductAttributionAndApproval.xml" --out /tmp/decoded --show-comment
```

### 3. Encode Blobs

Re-encode modified content back into the original file:

```bash
node tools/step-xml-codec/cli.js encode "step-configs/STEPWorkflow/STEPWorkflow_ProductAttributionAndApproval.xml" --tag Configuration --index 0 --from /tmp/decoded/Configuration_0.xml
```

Write the updated XML to a separate file instead of replacing the source:

```bash
node tools/step-xml-codec/cli.js encode "step-configs/STEPWorkflow/STEPWorkflow_ProductAttributionAndApproval.xml" --tag Configuration --index 0 --from /tmp/decoded/Configuration_0.xml --out-file /tmp/updated.xml
```

## Recommended Workflow

1. Run `list` to discover available blobs.
2. Pick the correct tag/index pair.
3. Run `decode` with `--out` to export the decoded content.
4. Edit the exported file.
5. Run `encode` with the same tag/index and `--from` the edited file.
6. Prefer `--out-file` first if you want to review the updated XML before replacing the original file.

## Notes and Limitations

- Blob detection is regex-based, not full XML structural parsing.
- Only blobs beginning with `H4sI` are treated as gzip+Base64 payloads.
- If multiple blobs share the same tag name, use `--index` to target the right one.
- Parent ID detection is heuristic and based on the nearest earlier element with an `ID` attribute.

## Examples

List all embedded blobs:

```bash
node tools/step-xml-codec/cli.js list "step-configs/EventProcessor/EventProcessor_ElasticSearchConfig.xml"
```

Decode all blobs in a workflow file to `/tmp`:

```bash
node tools/step-xml-codec/cli.js decode "step-configs/STEPWorkflow/STEPWorkflow_ProductAttributionAndApproval.xml" --out /tmp/decoded
```

Rebuild one blob after editing:

```bash
node tools/step-xml-codec/cli.js encode "step-configs/STEPWorkflow/STEPWorkflow_ProductAttributionAndApproval.xml" --tag Configuration --index 0 --from /tmp/decoded/Configuration_0.xml --out-file /tmp/ProductAttributionAndApproval.updated.xml
```
