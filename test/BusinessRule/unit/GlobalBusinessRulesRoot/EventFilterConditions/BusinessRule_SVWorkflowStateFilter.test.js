'use strict';

const br = require('../../../../../step-configs/BusinessRule/BusinessRule_SVWorkflowStateFilter');

describe('SVWorkflowStateFilter', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
  });
  const WORKFLOW_MAP = {
    ProductAttributionAndApproval: { PrePO: 'WaitingForPO' },
    ProductMaintenance: { Initial: 'Submit' },
    SampleAndMedia: { Initial: 'Submit' },
    ProductCreation: { Initial: 'Submit' }
  };

  function makeWorkflowTransitionConfig(map) {
    return { evaluate: () => JSON.stringify(map) };
  }

  function makeNode(workflowsPresent, nodeID) {
    return {
      getID: () => nodeID || 'SV_123',
      isInWorkflow: (wfID) => workflowsPresent.indexOf(wfID) !== -1
    };
  }

  test('returns true when SV is in ProductMaintenance', () => {
    const node = makeNode(['ProductMaintenance']);
    const config = makeWorkflowTransitionConfig(WORKFLOW_MAP);
    expect(br.operation0(node, config)).toBe(true);
  });

  test('returns true when SV is in SampleAndMedia', () => {
    const node = makeNode(['SampleAndMedia']);
    const config = makeWorkflowTransitionConfig(WORKFLOW_MAP);
    expect(br.operation0(node, config)).toBe(true);
  });

  test('returns true when SV is in ProductAttributionAndApproval', () => {
    const node = makeNode(['ProductAttributionAndApproval']);
    const config = makeWorkflowTransitionConfig(WORKFLOW_MAP);
    expect(br.operation0(node, config)).toBe(true);
  });

  test('returns true when SV is in ProductCreation', () => {
    const node = makeNode(['ProductCreation']);
    const config = makeWorkflowTransitionConfig(WORKFLOW_MAP);
    expect(br.operation0(node, config)).toBe(true);
  });

  test('returns rejection string when SV is not in any workflow', () => {
    const node = makeNode([], 'SV_999');
    const config = makeWorkflowTransitionConfig(WORKFLOW_MAP);
    const result = br.operation0(node, config);
    expect(typeof result).toBe('string');
    expect(result).toMatch(/SV_999/);
    expect(result).toMatch(/not in any configured workflow/);
  });

  test('returns true when SV is in multiple workflows (short-circuits on first match)', () => {
    const node = makeNode(['ProductCreation', 'ProductMaintenance']);
    const config = makeWorkflowTransitionConfig(WORKFLOW_MAP);
    expect(br.operation0(node, config)).toBe(true);
  });

  test('throws and rethrows on unexpected errors', () => {
    const node = {
      getID: () => 'SV_ERR',
      isInWorkflow: () => { throw new Error('STEP API failure'); }
    };
    const config = makeWorkflowTransitionConfig(WORKFLOW_MAP);
    expect(() => br.operation0(node, config)).toThrow('STEP API failure');
  });
});
