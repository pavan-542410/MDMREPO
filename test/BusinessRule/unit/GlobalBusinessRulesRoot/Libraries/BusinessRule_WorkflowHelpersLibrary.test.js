const workflowHelpers = require('../../../../../step-configs/BusinessRule/BusinessRule_WorkflowHelpersLibrary');

function createIterator(values) {
  let index = 0;

  return {
    hasNext: jest.fn(() => index < values.length),
    next: jest.fn(() => values[index++]),
  };
}

function createTask(triggerResult) {
  return {
    triggerByID: jest.fn(() => triggerResult || {
      isRejectedByScript: jest.fn(() => false),
      getScriptMessage: jest.fn(() => ''),
    }),
    triggerLaterByID: jest.fn(),
    setStatusFlagByID: jest.fn(),
    setDeadline: jest.fn(),
    reassign: jest.fn(),
  };
}

function createWorkflowInstance(taskMap, tasks, assigneeID) {
  return {
    getTaskByID: jest.fn((taskID) => taskMap[taskID] || null),
    getTasks: jest.fn(() => ({
      iterator: jest.fn(() => createIterator(tasks)),
    })),
    getSimpleVariable: jest.fn(() => assigneeID),
  };
}

function createNode(valuesByID, workflowInstanceByID, groupByID) {
  return {
    getName: jest.fn(() => 'Style Variant A'),
    getValue: jest.fn((attrID) => ({
      getSimpleValue: jest.fn(() => valuesByID[attrID] || null),
    })),
    getWorkflowInstanceByID: jest.fn((workflowID) => workflowInstanceByID[workflowID] || null),
    getManager: jest.fn(() => ({
      getGroupHome: jest.fn(() => ({
        getGroupByID: jest.fn((groupID) => groupByID[groupID] || null),
      })),
    })),
    toString: jest.fn(() => 'SV_1'),
  };
}

describe('BusinessRule_WorkflowHelpersLibrary', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
    global.log = {
      warning: jest.fn(),
    };
    global.logger = {
      info: jest.fn(),
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    delete global.log;
    delete global.logger;
  });

  test('triggers immediate/later events and handles rejected workflow transitions', () => {
    const rejectedResult = {
      isRejectedByScript: jest.fn(() => true),
      getScriptMessage: jest.fn(() => 'was rejected'),
    };
    const taskA = createTask();
    const taskB = createTask(rejectedResult);
    const wfi = createWorkflowInstance({ PrePO: taskA, WaitingForPO: taskB }, [taskA, taskB], 'MerchGroup');
    const node = createNode({}, { ProductAttributionAndApproval: wfi }, {
      MerchGroup: { id: 'MerchGroup' },
    });

    expect(() => workflowHelpers.triggerWorkflowEvent(
      node,
      'ProductAttributionAndApproval',
      ['PrePO'],
      'WaitingForPO'
    )).not.toThrow();
    expect(taskA.triggerByID).toHaveBeenCalledWith('WaitingForPO', 'Triggered via Business Rule.');

    expect(() => workflowHelpers.triggerWorkflowEventLater(
      node,
      'ProductAttributionAndApproval',
      'WaitingForPO',
      'PO_Found'
    )).not.toThrow();
    expect(taskB.triggerLaterByID).toHaveBeenCalledWith('PO_Found', 'Triggered via Business Rule.');

    expect(workflowHelpers.smartTriggerWorkflow(node, taskB, 'Approve', 'Triggered')).toBe(
      'Style Variant A was rejected'
    );
  });

  test('sets status/deadline/assignee and orchestrates workflow updates', () => {
    const taskA = createTask();
    const taskB = createTask();
    const wfi = createWorkflowInstance({ PrePO: taskA, WaitingForPO: taskB }, [taskA, taskB], 'MerchGroup');
    const userGroup = { id: 'MerchGroup' };
    const node = createNode({
      first_inventory_delivery_date: null,
      first_expected_inventory_date: '2024-01-15',
    }, {
      ProductAttributionAndApproval: wfi,
      ProductMaintenance: wfi,
    }, {
      MerchGroup: userGroup,
    });

    workflowHelpers.setStatusDealine(node, wfi);
    expect(taskA.setStatusFlagByID).toHaveBeenCalledWith('2+WeeksOut');
    expect(taskB.setDeadline).toHaveBeenCalledTimes(1);

    workflowHelpers.setAssignee(node, null);
    expect(taskA.reassign).toHaveBeenCalledWith(userGroup);
    expect(taskB.reassign).toHaveBeenCalledWith(userGroup);

    workflowHelpers.handleWorkflowUpdates(node);
    expect(taskA.triggerByID).toHaveBeenCalledWith('WaitingForPO', 'Triggered via Business Rule.');
    expect(taskB.triggerByID).toHaveBeenCalledWith('WaitingForPO', 'Triggered via Business Rule.');
  });

  test('logs and rethrows task-processing failures', () => {
    const brokenTask = {
      triggerByID: jest.fn(() => {
        throw new Error('trigger failed');
      }),
    };
    const wfi = createWorkflowInstance({ PrePO: brokenTask }, [brokenTask], null);

    expect(() => workflowHelpers.processTasks(wfi, ['PrePO'], 'Approve', false))
      .toThrow('trigger failed');
    expect(global.log.warning).toHaveBeenCalledWith(expect.stringContaining('Failed to process task with ID: PrePO'));

    expect(() => workflowHelpers.triggerTask(brokenTask, 'Approve', false))
      .toThrow('trigger failed');
    expect(global.log.warning).toHaveBeenCalledWith(expect.stringContaining('Error triggering task:'));
  });
});
