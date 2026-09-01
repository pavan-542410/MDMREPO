const calculateAssigneeInWorkflowBU = require('../../../../../step-configs/BusinessRule/BusinessRule_calculateAssigneeInWorkflow_BU');

function createParentChain(sfmpName) {
  const root = {
    getName: jest.fn(() => sfmpName),
    getParent: jest.fn(() => null),
  };

  return {
    getParent: jest.fn(() => ({
      getParent: jest.fn(() => ({
        getParent: jest.fn(() => root),
      })),
    })),
  };
}

function createNode(valuesByID, groupsByID, workflowInstance, classNode) {
  const chain = createParentChain('Swimwear');

  return {
    getWorkflowInstanceByID: jest.fn(() => workflowInstance),
    getParent: chain.getParent,
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => 'StyleVariant'),
    })),
    getValue: jest.fn((attrID) => ({
      getSimpleValue: jest.fn(() => (Object.prototype.hasOwnProperty.call(valuesByID, attrID) ? valuesByID[attrID] : null)),
      setSimpleValue: jest.fn((value) => {
        valuesByID[attrID] = value;
      }),
    })),
    getManager: jest.fn(() => ({
      getGroupHome: jest.fn(() => ({
        getGroupByID: jest.fn((groupID) => groupsByID[groupID] || null),
      })),
    })),
    __values: valuesByID,
    __classNode: classNode,
  };
}

describe('BusinessRule_calculateAssigneeInWorkflow_BU', () => {
  beforeEach(() => {
    global.log = {
      info: jest.fn(),
    };
    global.logger = {
      info: jest.fn(),
    };
  });

  afterEach(() => {
    delete global.log;
    delete global.logger;
  });

  test('assigns mapped merch groups and reassigns all workflow tasks', () => {
    const taskA = {
      reassign: jest.fn(),
    };
    const taskB = {
      reassign: jest.fn(),
    };
    let taskIndex = 0;
    const workflowInstance = {
      setSimpleVariable: jest.fn(),
      getTasks: jest.fn(() => ({
        iterator: jest.fn(() => ({
          hasNext: jest.fn(() => taskIndex < 2),
          next: jest.fn(() => [taskA, taskB][taskIndex++]),
        })),
      })),
    };
    const womensSwimGroup = { id: 'Womens-Swimwear' };
    const node = createNode({
      business_line_name: 'Womens',
      gender_intent: 'Female',
      is_plus: 'false',
      primary_client_focus: 'casual',
    }, {
      'Womens-Swimwear': womensSwimGroup,
    }, workflowInstance, {
      getParent: jest.fn(() => ({
        getName: jest.fn(() => 'Swimwear'),
      })),
      getValue: jest.fn(() => ({
        getSimpleValue: jest.fn(() => 'Womens-Swimwear'),
      })),
    });
    const classToGroupAttr = {
      getID: jest.fn(() => 'ClassToUserGroup'),
    };

    calculateAssigneeInWorkflowBU.operation0(node, {
      evaluate: jest.fn(({ node: currentNode }) => currentNode.__classNode),
    }, classToGroupAttr, {}, {});

    expect(workflowInstance.setSimpleVariable).toHaveBeenCalledWith('assignee', 'Womens-Swimwear');
    expect(taskA.reassign).toHaveBeenCalledWith(womensSwimGroup);
    expect(taskB.reassign).toHaveBeenCalledWith(womensSwimGroup);
    expect(node.__values.assignee).toBe('Womens-Swimwear');
  });

  test('falls back to core_merch when mapped group does not exist', () => {
    const workflowInstance = {
      setSimpleVariable: jest.fn(),
      getTasks: jest.fn(() => ({
        iterator: jest.fn(() => ({
          hasNext: jest.fn(() => false),
        })),
      })),
    };
    const node = createNode({
      business_line_name: 'Unknown',
      gender_intent: 'Unknown',
      is_plus: 'false',
      primary_client_focus: 'casual',
    }, {
      core_merch: { id: 'core_merch' },
    }, workflowInstance, {
      getParent: jest.fn(() => ({
        getName: jest.fn(() => 'UnknownDepartment'),
      })),
      getValue: jest.fn(() => ({
        getSimpleValue: jest.fn(() => 'UnmappedGroup'),
      })),
    });

    calculateAssigneeInWorkflowBU.operation0(node, {
      evaluate: jest.fn(({ node: currentNode }) => currentNode.__classNode),
    }, {
      getID: jest.fn(() => 'ClassToUserGroup'),
    }, {}, {});

    expect(node.__values.assignee).toBe('core_merch');
  });
});
