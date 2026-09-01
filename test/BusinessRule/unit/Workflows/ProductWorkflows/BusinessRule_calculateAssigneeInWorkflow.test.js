const calculateAssigneeInWorkflow = require('../../../../../step-configs/BusinessRule/BusinessRule_calculateAssigneeInWorkflow');

function createHierarchyNode(name, parent) {
  return {
    getName: jest.fn(() => name),
    getParent: jest.fn(() => parent || null),
  };
}

function createNode(valuesByID, groupByID, nodeClass, workflowInstance) {
  const root = createHierarchyNode('Sleepwear', null);
  const classParent = createHierarchyNode('2nd Layer', root);
  const styleParent = createHierarchyNode('StyleParent', createHierarchyNode('ColorwayParent', createHierarchyNode('ProductParent', root)));

  return {
    getWorkflowInstance: jest.fn(() => workflowInstance),
    getParent: jest.fn(() => styleParent),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => 'StyleVariant'),
    })),
    getValue: jest.fn((attrID) => ({
      getSimpleValue: jest.fn(() => valuesByID[attrID] || null),
      setSimpleValue: jest.fn((value) => {
        valuesByID[attrID] = value;
      }),
    })),
    getManager: jest.fn(() => ({
      getGroupHome: jest.fn(() => ({
        getGroupByID: jest.fn((groupID) => groupByID[groupID] || null),
      })),
    })),
    __nodeClass: nodeClass || {
      getParent: jest.fn(() => classParent),
      getValue: jest.fn(() => ({
        getSimpleValue: jest.fn(() => 'Kids-Sleepwear'),
      })),
    },
  };
}

describe('BusinessRule_calculateAssigneeInWorkflow', () => {
  beforeEach(() => {
    global.logger = {
      info: jest.fn(),
    };
  });

  afterEach(() => {
    delete global.logger;
  });

  test('assigns plus, mapped, and fallback merch groups', () => {
    const workflowInstance = {
      setSimpleVariable: jest.fn(),
    };
    const plusNode = createNode({
      is_plus: 'true',
      primary_client_focus: 'general',
      business_line_name: 'Womens',
      gender_intent: 'Female',
    }, {
      'Womens-Plus2ndLayer': { id: 'plus-group' },
    }, null, workflowInstance);
    const getClass = {
      evaluate: jest.fn(({ node }) => node.__nodeClass),
    };
    const classToGroupAttr = {
      getID: jest.fn(() => 'ClassToUserGroup'),
    };

    calculateAssigneeInWorkflow.operation0(plusNode, getClass, classToGroupAttr, {}, {}, 'ProductMaintenance');
    expect(plusNode.getValue('assignee').getSimpleValue()).toBe('Womens-Plus2ndLayer');
    expect(workflowInstance.setSimpleVariable).toHaveBeenCalledWith('assignee', 'Womens-Plus2ndLayer');

    const fallbackNode = createNode({
      is_plus: 'false',
      primary_client_focus: 'general',
      business_line_name: 'UnknownLine',
      gender_intent: 'Unknown',
    }, {
      core_merch: { id: 'core' },
    }, {
      getParent: jest.fn(() => createHierarchyNode('UnknownDepartment', null)),
      getValue: jest.fn(() => ({
        getSimpleValue: jest.fn(() => 'UnmappedGroup'),
      })),
    }, {
      setSimpleVariable: jest.fn(),
    });

    calculateAssigneeInWorkflow.operation0(fallbackNode, getClass, classToGroupAttr, {}, {}, 'ProductMaintenance');
    expect(fallbackNode.getValue('assignee').getSimpleValue()).toBe('core_merch');
  });

  test('skips assignment when class lookup returns null', () => {
    const node = createNode({
      business_line_name: 'Womens',
    }, {}, null, {
      setSimpleVariable: jest.fn(),
    });

    calculateAssigneeInWorkflow.operation0(node, {
      evaluate: jest.fn(() => null),
    }, {
      getID: jest.fn(() => 'ClassToUserGroup'),
    }, {}, {}, 'ProductMaintenance');

    expect(node.getValue('assignee').getSimpleValue()).toBeNull();
  });
});
