'use strict';

const br = require('../../../../../step-configs/BusinessRule/BusinessRule_SVAssetsProcessorHoldFilter');

describe('SVAssetsProcessorHoldFilter', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
  });

  function makeWfi(holdReason) {
    return {
      getSimpleVariable: (key) => (key === 'HoldReason' ? holdReason : null)
    };
  }

  function makeNode({ inWorkflow = false, wfi = null, nodeID = 'SV_123' } = {}) {
    return {
      getID: () => nodeID,
      isInWorkflow: (wfID) => wfID === 'ProductMaintenance' && inWorkflow,
      getWorkflowInstanceByID: () => wfi
    };
  }

  // ── NOT in ProductMaintenance ─────────────────────────────────────────────

  test('returns true when SV is not in ProductMaintenance', () => {
    const node = makeNode({ inWorkflow: false });
    expect(br.operation0(node)).toBe(true);
  });

  // ── In ProductMaintenance — null HoldReason ───────────────────────────────

  test('returns rejection string when SV is in ProductMaintenance with null HoldReason', () => {
    const node = makeNode({ inWorkflow: true, wfi: makeWfi(null) });
    const result = br.operation0(node);
    expect(typeof result).toBe('string');
    expect(result).toMatch(/SV_123/);
    expect(result).toMatch(/preserve manual hold/);
  });

  test('returns rejection string when SV is in ProductMaintenance with empty HoldReason', () => {
    const node = makeNode({ inWorkflow: true, wfi: makeWfi('') });
    const result = br.operation0(node);
    expect(typeof result).toBe('string');
    expect(result).toMatch(/preserve manual hold/);
  });

  // ── In ProductMaintenance — HoldReason = "Imagery Validation Failed" ──────

  test('returns true when HoldReason is "Imagery Validation Failed"', () => {
    const node = makeNode({ inWorkflow: true, wfi: makeWfi('Imagery Validation Failed') });
    expect(br.operation0(node)).toBe(true);
  });

  // ── In ProductMaintenance — other HoldReason ─────────────────────────────

  test('returns rejection string when HoldReason is some other value', () => {
    const node = makeNode({ inWorkflow: true, wfi: makeWfi('Size Issue') });
    const result = br.operation0(node);
    expect(typeof result).toBe('string');
    expect(result).toMatch(/preserve manual hold/);
  });

  // ── Defensive: workflow instance not found ────────────────────────────────

  test('returns true and logs when workflow instance is null', () => {
    const node = makeNode({ inWorkflow: true, wfi: null });
    const result = br.operation0(node);
    expect(result).toBe(true);
    expect(global.logger.info).toHaveBeenCalledWith(
      expect.stringMatching(/could not get workflow instance/)
    );
  });

  // ── Error propagation ─────────────────────────────────────────────────────

  test('throws and rethrows on unexpected errors', () => {
    const node = {
      getID: () => 'SV_ERR',
      isInWorkflow: () => { throw new Error('STEP API failure'); },
      getWorkflowInstanceByID: () => null
    };
    expect(() => br.operation0(node)).toThrow('STEP API failure');
    expect(global.logger.info).toHaveBeenCalledWith(
      expect.stringMatching(/SVAssetsProcessorHoldFilter error/)
    );
  });
});
