#!/usr/bin/env node
/**
 * STEP MCP Server — exposes STEP REST API v2 as MCP tools.
 * Auth: Basic auth via STEP_USERNAME (default: br_test_user) + STEP_PASSWORD env vars.
 * Environment: STEP_ENV (default: preprod). Each tool also accepts an `env` param.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { toolDefinitions, handleToolCall } from './lib/tools.js';

const server = new Server(
  { name: 'step-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: toolDefinitions,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const result = await handleToolCall(name, args || {});
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('step-mcp failed to start:', err.message);
  process.exit(1);
});
