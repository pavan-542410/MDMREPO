import { StepClient } from './client.js';

export const toolDefinitions = [
  {
    name: 'step_get_node',
    description: 'Get a STEP node by ID, including its attribute values and references.',
    inputSchema: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'The STEP node ID (e.g., "SV-12345")' },
        env: { type: 'string', description: 'STEP environment: dev or preprod (default: STEP_ENV or preprod)', enum: ['dev', 'preprod'] },
      },
      required: ['nodeId'],
    },
  },
  {
    name: 'step_search_nodes',
    description: 'Search STEP nodes by text query. Optionally filter by object type.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query text' },
        objectTypeId: { type: 'string', description: 'Filter by object type ID (e.g., "StyleVariant")' },
        maxResults: { type: 'string', description: 'Max results to return (default: 25)' },
        env: { type: 'string', description: 'STEP environment', enum: ['dev', 'preprod'] },
      },
      required: ['query'],
    },
  },
  {
    name: 'step_get_workflow_state',
    description: 'Get workflow instances and their current states for a STEP node.',
    inputSchema: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'The STEP node ID' },
        env: { type: 'string', description: 'STEP environment', enum: ['dev', 'preprod'] },
      },
      required: ['nodeId'],
    },
  },
  {
    name: 'step_get_attribute_definition',
    description: 'Get a STEP attribute definition including data type, validation, and LOV.',
    inputSchema: {
      type: 'object',
      properties: {
        attributeId: { type: 'string', description: 'The attribute ID (e.g., "stretch", "belt_inches")' },
        env: { type: 'string', description: 'STEP environment', enum: ['dev', 'preprod'] },
      },
      required: ['attributeId'],
    },
  },
  {
    name: 'step_health_check',
    description: 'Check STEP environment connectivity, response time, and system info.',
    inputSchema: {
      type: 'object',
      properties: {
        env: { type: 'string', description: 'STEP environment', enum: ['dev', 'preprod'] },
      },
    },
  },
];

export async function handleToolCall(name, args) {
  const env = args.env || undefined; // let StepClient use STEP_ENV default
  const client = new StepClient(env);

  switch (name) {
    case 'step_get_node':
      return await client.getNode(args.nodeId);

    case 'step_search_nodes':
      return await client.searchNodes(args.query, args.objectTypeId, args.maxResults);

    case 'step_get_workflow_state':
      return await client.getWorkflowInstances(args.nodeId);

    case 'step_get_attribute_definition':
      return await client.getAttributeDefinition(args.attributeId);

    case 'step_health_check':
      return await client.healthCheck();

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
