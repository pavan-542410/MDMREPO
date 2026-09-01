'use strict';

const br = require('../../../../../step-configs/BusinessRule/BusinessRule_WorkflowTransitionConfig');

describe('WorkflowTransitionConfig', () => {
  let result;
  let configMap;

  beforeEach(() => {
    result = br.operation0();
    configMap = JSON.parse(result);
  });

  test('returns valid JSON string', () => {
    expect(() => JSON.parse(result)).not.toThrow();
  });

  test('contains all four expected workflows', () => {
    expect(configMap).toHaveProperty('ProductAttributionAndApproval');
    expect(configMap).toHaveProperty('ProductMaintenance');
    expect(configMap).toHaveProperty('SampleAndMedia');
    expect(configMap).toHaveProperty('ProductCreation');
  });

  test('ProductAttributionAndApproval has correct state-to-event mappings', () => {
    const wf = configMap.ProductAttributionAndApproval;
    expect(wf.PrePO).toBe('WaitingForPO');
    expect(wf.ReviewAndApproval).toBe('Approve');
    expect(wf.WaitingForAIResponse).toBe('Attribution_Complete');
    expect(wf.WaitingForPO).toBe('PO_Found');
    expect(wf.WaitingForSampleOrMedia).toBe('Imagery_Complete');
  });

  test('ProductMaintenance has correct state-to-event mappings', () => {
    const wf = configMap.ProductMaintenance;
    expect(wf.Initial).toBe('Submit');
    expect(wf.SV_Imagery_Needed).toBe('Approve');
  });

  test('SampleAndMedia has all expected states mapped to Submit', () => {
    const wf = configMap.SampleAndMedia;
    const expectedStates = [
      'Initial', 'Internal_Transfer_Reqd', 'Photography_Complete',
      'Sample_Needed', 'Sample_Recd_by_HQ', 'Sample_Recd_by_Studio',
      'Switch', 'Transfer_Reqd_from_DC', 'WaitingForPO'
    ];
    expectedStates.forEach(state => {
      expect(wf[state]).toBe('Submit');
    });
  });

  test('ProductCreation has correct state-to-event mappings', () => {
    const wf = configMap.ProductCreation;
    expect(wf.Initial).toBe('Submit');
    expect(wf.UploadReview).toBe('Submit');
  });

  test('all values are non-empty strings', () => {
    Object.keys(configMap).forEach(workflowID => {
      Object.keys(configMap[workflowID]).forEach(stateID => {
        expect(typeof configMap[workflowID][stateID]).toBe('string');
        expect(configMap[workflowID][stateID].length).toBeGreaterThan(0);
      });
    });
  });
});
