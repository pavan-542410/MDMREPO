# STEP MCP Server

MCP server that exposes STEP REST API v2 as tools for Claude Code and Codex.

## Setup

```bash
cd tools/step-mcp && npm install
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STEP_PASSWORD` | Yes | — | STEP user password |
| `STEP_USERNAME` | No | `br_test_user` | STEP username |
| `STEP_ENV` | No | `preprod` | Default environment (`dev` or `preprod`) |

## Available Tools

| Tool | Description |
|------|-------------|
| `step_get_node` | Get a node by ID with attributes and references |
| `step_search_nodes` | Search nodes by text query, optionally filtered by object type |
| `step_get_workflow_state` | Get workflow instances for a node |
| `step_get_attribute_definition` | Get attribute definition (type, validation, LOV) |
| `step_health_check` | Check connectivity and response time |

All tools accept an optional `env` parameter to override the default environment.

## Testing

```bash
# Verify the server starts and lists tools
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | STEP_PASSWORD=xxx node index.js
```

## Registration

Already registered in:
- `.mcp.json` (Claude Code)
- `.codex/config.toml` (Codex)
