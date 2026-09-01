'use strict';

const br = require('../../../../../step-configs/BusinessRule/BusinessRule_HandleWorkflowTransition');

describe('HandleWorkflowTransition', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
  });
  const WORKFLOW_MAP = {
    ProductMaintenance: { Initial: 'Submit', SV_Imagery_Needed: 'Approve' },
    SampleAndMedia: { Initial: 'Submit' }
  };

  function makeNode(nodeID) {
    return { getID: () => nodeID || 'SV_001' };
  }

  function makeWorkflowTransitionConfig(map) {
    return { evaluate: () => JSON.stringify(map) };
  }

  function makeW(rejections) {
    return {
      triggerWorkflowEventsByMap: jest.fn().mockReturnValue(rejections || null)
    };
  }

  test('calls triggerWorkflowEventsByMap with node, configMap, and message', () => {
    const node = makeNode('SV_001');
    const config = makeWorkflowTransitionConfig(WORKFLOW_MAP);
    const w = makeW(null);

    br.operation0(node, config, w);

    expect(w.triggerWorkflowEventsByMap).toHaveBeenCalledTimes(1);
    const [calledNode, calledMap, calledMsg] = w.triggerWorkflowEventsByMap.mock.calls[0];
    expect(calledNode).toBe(node);
    expect(calledMap).toEqual(WORKFLOW_MAP);
    expect(calledMsg).toContain('SV_001');
  });

  test('does not throw when triggerWorkflowEventsByMap returns null (no rejections)', () => {
    const node = makeNode('SV_002');
    const config = makeWorkflowTransitionConfig(WORKFLOW_MAP);
    const w = makeW(null);

    expect(() => br.operation0(node, config, w)).not.toThrow();
  });

  test('logs rejections without throwing when triggerWorkflowEventsByMap returns rejection messages', () => {
    const node = makeNode('SV_003');
    const config = makeWorkflowTransitionConfig(WORKFLOW_MAP);
    const w = makeW(['SV_003 transition rejected by script']);

    expect(() => br.operation0(node, config, w)).not.toThrow();
    expect(w.triggerWorkflowEventsByMap).toHaveBeenCalledTimes(1);
  });

  test('rethrows unexpected errors from triggerWorkflowEventsByMap', () => {
    const node = makeNode('SV_ERR');
    const config = makeWorkflowTransitionConfig(WORKFLOW_MAP);
    const w = {
      triggerWorkflowEventsByMap: jest.fn().mockImplementation(() => {
        throw new Error('unexpected STEP failure');
      })
    };

    expect(() => br.operation0(node, config, w)).toThrow('unexpected STEP failure');
  });

  test('passes full workflow map from config to triggerWorkflowEventsByMap', () => {
    const fullMap = {
      ProductAttributionAndApproval: { PrePO: 'WaitingForPO', ReviewAndApproval: 'Approve' },
      ProductMaintenance: { Initial: 'Submit' }
    };
    const node = makeNode('SV_004');
    const config = makeWorkflowTransitionConfig(fullMap);
    const w = makeW(null);

    br.operation0(node, config, w);

    expect(w.triggerWorkflowEventsByMap.mock.calls[0][1]).toEqual(fullMap);
  });
});
