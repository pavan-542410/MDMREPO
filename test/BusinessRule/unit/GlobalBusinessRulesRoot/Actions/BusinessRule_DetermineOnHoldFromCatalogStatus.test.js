const br = require('../../../../../step-configs/BusinessRule/BusinessRule_DetermineOnHoldFromCatalogStatus');

function rhinoString(value) {
  return {
    equals: jest.fn((other) => value === other),
    toString: jest.fn(() => value),
    valueOf: jest.fn(() => value),
  };
}

function createNode(status, inWorkflow, holdReason) {
  const workflowInstance = {
    setSimpleVariable: jest.fn(),
    getSimpleVariable: jest.fn(() => holdReason ? rhinoString(holdReason) : null),
    getTaskByID: jest.fn(() => ({
      triggerByID: jest.fn(),
    })),
  };

  return {
    isInWorkflow: jest.fn(() => inWorkflow),
    startWorkflowByID: jest.fn(() => workflowInstance),
    getWorkflowInstanceByID: jest.fn(() => workflowInstance),
    getValue: jest.fn(() => ({
      getSimpleValue: jest.fn(() => rhinoString(status)),
    })),
    __workflowInstance: workflowInstance,
  };
}

describe('BusinessRule_DetermineOnHoldFromCatalogStatus', () => {
  it('currently throws on Sellable status because status is coerced to a JS string before calling .equals()', () => {
    const node = createNode('Sellable', false, null);

    expect(() => br.operation0(node, {}, {
      evaluate: jest.fn(() => ({
        isAccepted: jest.fn(() => false),
      })),
    })).toThrow('status.equals is not a function');

    expect(node.startWorkflowByID).not.toHaveBeenCalled();
    expect(node.__workflowInstance.setSimpleVariable).not.toHaveBeenCalled();
  });

  it('still throws before the imagery-valid branch can run while status uses Java-style .equals() on a JS string', () => {
    const node = createNode('Sellable', false, null);

    expect(() => br.operation0(node, {}, {
      evaluate: jest.fn(() => ({
        isAccepted: jest.fn(() => true),
      })),
    })).toThrow('status.equals is not a function');

    expect(node.startWorkflowByID).not.toHaveBeenCalled();
  });

  it('throws on the Hold branch for the same deferred .equals() issue', () => {
    const node = createNode('Hold', true, 'Imagery Validation Failed');

    expect(() => br.operation0(node, {}, {
      evaluate: jest.fn(() => ({
        isAccepted: jest.fn(() => false),
      })),
    })).toThrow('status.equals is not a function');

    expect(node.getWorkflowInstanceByID).not.toHaveBeenCalled();
    expect(node.__workflowInstance.getTaskByID).not.toHaveBeenCalled();
  });
});
