const workflowApprove = require('../../../../../step-configs/BusinessRule/BusinessRule_WorkflowApprove');

function createIterator(items) {
  let index = 0;

  return {
    hasNext: jest.fn(() => index < items.length),
    next: jest.fn(() => items[index++]),
  };
}

function createTask(rejected, message) {
  return {
    triggerByID: jest.fn(() => ({
      isRejectedByScript: jest.fn(() => rejected),
      getScriptMessage: jest.fn(() => message),
    })),
  };
}

function createWorkflowInstance(taskMap) {
  return {
    getTaskByID: jest.fn((taskID) => taskMap[taskID] || null),
  };
}

function createNode(id, name, workflowMap) {
  return {
    getID: jest.fn(() => id),
    getName: jest.fn(() => name),
    getWorkflowInstanceByID: jest.fn((workflowID) => workflowMap[workflowID] || null),
  };
}

describe('BusinessRule_WorkflowApprove', () => {
  test('processes selected nodes outside Details Item and emits warning when some approvals fail', () => {
    const successNode = createNode('SV_1', 'SV One', {
      ProductMaintenance: createWorkflowInstance({
        Approval: createTask(false, null),
      }),
    });
    const rejectedNode = createNode('SV_2', 'SV Two', {
      ProductMaintenance: createWorkflowInstance({
        Approval: createTask(true, 'Rejected by script'),
      }),
    });
    const ui = {
      getScreenId: jest.fn(() => 'Bulk Edit'),
      getSelection: jest.fn(() => ({
        iterator: jest.fn(() => createIterator([successNode, rejectedNode])),
      })),
      showAlert: jest.fn(),
    };
    const upheritAndApprove = {
      execute: jest.fn(),
    };

    workflowApprove.operation0(ui, successNode, upheritAndApprove);

    expect(upheritAndApprove.execute).toHaveBeenCalledWith(successNode);
    expect(upheritAndApprove.execute).toHaveBeenCalledWith(rejectedNode);
    expect(ui.showAlert).toHaveBeenCalledWith(
      'WARNING',
      'Workflow Results',
      'SV One  has successfully been approved.\nSV Two Rejected by script'
    );
  });

  test('approves Details Item node, navigates on success, and shows error when no workflow/task matches', () => {
    const successNode = createNode('SV_3', 'SV Three', {
      ProductMaintenance: createWorkflowInstance({
        Approval: createTask(false, null),
      }),
    });
    const ui = {
      getScreenId: jest.fn(() => 'Details Item'),
      showAlert: jest.fn(),
      navigateUrl: jest.fn(),
    };
    const upheritAndApprove = {
      execute: jest.fn(),
    };

    workflowApprove.operation0(ui, successNode, upheritAndApprove);

    expect(ui.showAlert).toHaveBeenCalledWith('INFO', 'Workflow Results', 'SV Three  has successfully been approved.');
    expect(ui.navigateUrl).toHaveBeenCalledTimes(1);

    const orphanNode = createNode('SV_4', 'SV Four', {});
    workflowApprove.operation0(ui, orphanNode, upheritAndApprove);

    expect(ui.showAlert).toHaveBeenLastCalledWith(
      'ERROR',
      'Workflow Results',
      'SV Four Workflow trigger failed: No matching workflow/task found.'
    );
  });
});
