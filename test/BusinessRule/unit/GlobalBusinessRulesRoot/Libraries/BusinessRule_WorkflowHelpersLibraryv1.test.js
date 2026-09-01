const workflowHelpers = require('../../../../../step-configs/BusinessRule/BusinessRule_WorkflowHelpersLibraryv1');

function createIterator(items) {
  let index = 0;

  return {
    hasNext: jest.fn(() => index < items.length),
    next: jest.fn(() => items[index++]),
  };
}

function createTasksCollection(tasks) {
  return {
    iterator: jest.fn(() => createIterator(tasks)),
  };
}

function createTask(overrides) {
  return {
    triggerByID: jest.fn(() => ({
      isRejectedByScript: jest.fn(() => false),
      getScriptMessage: jest.fn(() => ''),
    })),
    triggerLaterByID: jest.fn(),
    setStatusFlagByID: jest.fn(),
    setDeadline: jest.fn(),
    reassign: jest.fn(),
    ...overrides,
  };
}

function createWorkflowInstance(taskMap, tasks, assigneeID) {
  return {
    getTaskByID: jest.fn((stateID) => taskMap[stateID] || null),
    getTasks: jest.fn(() => createTasksCollection(tasks || [])),
    getSimpleVariable: jest.fn(() => assigneeID),
  };
}

function createNode(valuesByID, workflowInstanceByID, groupByID) {
  return {
    getName: jest.fn(() => 'Style Variant A'),
    getValue: jest.fn((attributeID) => ({
      getSimpleValue: jest.fn(() => valuesByID[attributeID] || null),
    })),
    getWorkflowInstanceByID: jest.fn((workflowID) => workflowInstanceByID[workflowID] || null),
    getManager: jest.fn(() => ({
      getGroupHome: jest.fn(() => ({
        getGroupByID: jest.fn((groupID) => groupByID[groupID] || null),
      })),
    })),
  };
}

function expectLocalMidnightDate(dateValue, year, monthIndex, dayOfMonth) {
  expect(dateValue).toBeInstanceOf(Date);
  expect(dateValue.getFullYear()).toBe(year);
  expect(dateValue.getMonth()).toBe(monthIndex);
  expect(dateValue.getDate()).toBe(dayOfMonth);
}

describe('BusinessRule_WorkflowHelpersLibraryv1', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T12:00:00.000Z'));

    global.log = {
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    delete global.log;
  });

  it('triggers immediate and delayed workflow events for configured state IDs', () => {
    const prePoTask = createTask();
    const waitingTask = createTask();
    const workflowInstance = createWorkflowInstance(
      {
        PrePO: prePoTask,
        WaitingForPO: waitingTask,
      },
      [prePoTask, waitingTask],
      'MerchGroup'
    );
    const node = createNode({}, { AttributionAndApproval: workflowInstance }, {});

    expect(
      workflowHelpers.triggerWorkflowEvent(
        node,
        workflowHelpers.ATTRIBUTION_APPROVAL,
        [workflowHelpers.PRE_PO, workflowHelpers.WAITING_FOR_PO],
        workflowHelpers.WAITING_FOR_PO
      )
    ).toBe(true);

    expect(prePoTask.triggerByID).toHaveBeenCalledWith(
      workflowHelpers.WAITING_FOR_PO,
      'Triggered via Business Rule.'
    );
    expect(waitingTask.triggerByID).toHaveBeenCalledWith(
      workflowHelpers.WAITING_FOR_PO,
      'Triggered via Business Rule.'
    );

    expect(
      workflowHelpers.triggerWorkflowEventLater(
        node,
        workflowHelpers.ATTRIBUTION_APPROVAL,
        workflowHelpers.PRE_PO,
        workflowHelpers.WAITING_FOR_PO
      )
    ).toBe(true);

    expect(prePoTask.triggerLaterByID).toHaveBeenCalledWith(
      workflowHelpers.WAITING_FOR_PO,
      'Triggered via Business Rule.'
    );
  });

  it('returns structured process errors for invalid workflow/task inputs', () => {
    const resultWithoutWorkflow = workflowHelpers.processTasks(null, 'PrePO', 'Approve', false);
    expect(resultWithoutWorkflow).toEqual({
      success: false,
      processedTasks: [],
      errors: ['Workflow instance is null'],
    });

    const emptyWorkflow = createWorkflowInstance({}, [], null);
    const resultWithoutEvent = workflowHelpers.processTasks(emptyWorkflow, 'PrePO', '', false);
    expect(resultWithoutEvent.success).toBe(false);
    expect(resultWithoutEvent.errors).toEqual(['Event ID is required']);

    const result = {
      success: true,
      processedTasks: [],
      errors: [],
    };
    workflowHelpers.processTask(emptyWorkflow, 'MissingState', 'Approve', false, result);

    expect(result.success).toBe(true);
    expect(result.processedTasks).toEqual([]);
    expect(result.errors).toEqual(['Task not found with ID: MissingState']);
  });

  it('calculates received, overdue, and future deadline statuses', () => {
    const receivedNode = createNode(
      {
        first_inventory_delivery_date: '2024-01-02',
      },
      {},
      {}
    );

    expect(workflowHelpers.calculateDeadlineInfo(receivedNode, { success: true, errors: [] })).toEqual({
      statusFlag: workflowHelpers.RECEIVED,
      deadline: null,
    });

    const overdueNode = createNode(
      {
        first_expected_inventory_date: '2023-12-20',
      },
      {},
      {}
    );

    expect(workflowHelpers.calculateDeadlineInfo(overdueNode, { success: true, errors: [] })).toEqual({
      statusFlag: workflowHelpers.WEEKS_OUT[0],
      deadline: null,
    });

    const futureNode = createNode(
      {
        first_expected_inventory_date: '2024-01-15',
      },
      {},
      {}
    );

    const futureResult = workflowHelpers.calculateDeadlineInfo(futureNode, {
      success: true,
      errors: [],
    });

    expect(futureResult.statusFlag).toBe(workflowHelpers.WEEKS_OUT[2]);
    expectLocalMidnightDate(futureResult.deadline, 2024, 0, 8);
  });

  it('applies status flags, deadlines, and assignees to all workflow tasks', () => {
    const firstTask = createTask();
    const secondTask = createTask();
    const workflowInstance = createWorkflowInstance(
      {
        PrePO: firstTask,
        WaitingForPO: secondTask,
      },
      [firstTask, secondTask],
      'MerchGroup'
    );
    const userGroup = { id: 'MerchGroup' };
    const node = createNode(
      {
        first_expected_inventory_date: '2024-01-08',
      },
      {
        ProductMaintenance: workflowInstance,
      },
      {
        MerchGroup: userGroup,
      }
    );

    const deadlineResult = workflowHelpers.setStatusDeadline(node, workflowInstance);

    expect(deadlineResult.success).toBe(true);
    expect(deadlineResult.statusFlag).toBe(workflowHelpers.WEEKS_OUT[1]);
    expect(firstTask.setStatusFlagByID).toHaveBeenCalledWith(workflowHelpers.WEEKS_OUT[1]);
    expect(secondTask.setDeadline).toHaveBeenCalledTimes(1);
    expectLocalMidnightDate(secondTask.setDeadline.mock.calls[0][0], 2024, 0, 8);

    const assigneeResult = workflowHelpers.setAssignee(node, null);

    expect(assigneeResult).toEqual({
      success: true,
      assignee: 'MerchGroup',
      errors: [],
    });
    expect(firstTask.reassign).toHaveBeenCalledWith(userGroup);
    expect(secondTask.reassign).toHaveBeenCalledWith(userGroup);
  });

  it('handles workflow update orchestration and reports missing workflows', () => {
    const prePoTask = createTask();
    const waitingTask = createTask();
    const workflowInstance = createWorkflowInstance(
      {
        PrePO: prePoTask,
        WaitingForPO: waitingTask,
      },
      [prePoTask, waitingTask],
      null
    );
    const nodeWithWorkflow = createNode(
      {
        first_expected_inventory_date: '2024-01-08',
      },
      {
        AttributionAndApproval: workflowInstance,
      },
      {}
    );

    expect(workflowHelpers.handleWorkflowUpdates(nodeWithWorkflow)).toEqual({
      success: true,
      errors: [],
    });

    expect(prePoTask.triggerByID).toHaveBeenCalledWith(
      workflowHelpers.WAITING_FOR_PO,
      'Triggered via Business Rule.'
    );

    const nodeWithoutWorkflow = createNode({}, {}, {});
    expect(workflowHelpers.handleWorkflowUpdates(nodeWithoutWorkflow)).toEqual({
      success: false,
      errors: ['No AttributionAndApproval workflow instance found'],
    });
  });

  it('returns trigger map rejections, null on success, and validation errors', () => {
    const rejectedTask = createTask({
      triggerByID: jest.fn(() => ({
        isRejectedByScript: jest.fn(() => true),
        getScriptMessage: jest.fn(() => 'Rejected by validation'),
      })),
    });
    const workflowInstance = createWorkflowInstance(
      {
        PrePO: rejectedTask,
      },
      [rejectedTask],
      null
    );
    const node = createNode(
      {
        first_expected_inventory_date: '2024-01-08',
      },
      {
        AttributionAndApproval: workflowInstance,
      },
      {}
    );

    expect(
      workflowHelpers.triggerWfFromMapNoWebUI(
        node,
        {
          AttributionAndApproval: {
            PrePO: 'Approve',
          },
        },
        'Transition message',
        true
      )
    ).toEqual(['Style Variant A Rejected by validation']);

    rejectedTask.triggerByID.mockReturnValue({
      isRejectedByScript: jest.fn(() => false),
      getScriptMessage: jest.fn(() => ''),
    });

    expect(
      workflowHelpers.triggerWfFromMapNoWebUI(
        node,
        {
          AttributionAndApproval: {
            PrePO: 'Approve',
          },
        },
        'Transition message',
        false
      )
    ).toBeNull();

    expect(workflowHelpers.triggerWfFromMapNoWebUI(null, {}, 'Message', false)).toEqual([
      'Object parameter is null',
    ]);
    expect(workflowHelpers.triggerWfFromMapNoWebUI(node, null, 'Message', false)).toEqual([
      'Workflow state event map is null',
    ]);
  });

  it('returns a script rejection message from smartTriggerWorkflow and supports logger passthrough', () => {
    const task = createTask({
      triggerByID: jest.fn(() => ({
        isRejectedByScript: jest.fn(() => true),
        getScriptMessage: jest.fn(() => 'Needs manual review'),
      })),
    });
    const node = createNode({}, {}, {});
    const logger = { info: jest.fn() };

    expect(workflowHelpers.smartTriggerWorkflow(node, task, 'Approve', 'Manual trigger')).toBe(
      'Style Variant A Needs manual review'
    );
    expect(workflowHelpers.smartTriggerWorkflow(null, task, 'Approve', 'Manual trigger')).toBe(
      'Missing required parameters'
    );

    workflowHelpers.p('workflow log', logger);
    expect(logger.info).toHaveBeenCalledWith('workflow log');
  });
});
