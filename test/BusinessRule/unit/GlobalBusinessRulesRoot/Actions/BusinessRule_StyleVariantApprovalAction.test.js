const styleVariantApprovalAction = require('../../../../../step-configs/BusinessRule/BusinessRule_StyleVariantApprovalAction');

function createValueStore(values) {
  const wrappers = {};

  return jest.fn((attrID) => {
    if (!wrappers[attrID]) {
      wrappers[attrID] = {
        getSimpleValue: jest.fn(() => (Object.prototype.hasOwnProperty.call(values, attrID) ? values[attrID] : null)),
        setSimpleValue: jest.fn((value) => {
          values[attrID] = value;
        }),
      };
    }

    return wrappers[attrID];
  });
}

function rhinoString(value) {
  return {
    equals: jest.fn((other) => value === other),
    toString: jest.fn(() => value),
  };
}

describe('BusinessRule_StyleVariantApprovalAction', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-02-03T04:05:06.000Z'));
    global.logger = {
      warning: jest.fn(),
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    delete global.logger;
  });

  test('starts hold workflow when sellable imagery is invalid and recomputes status', () => {
    const values = {
      ft_status: 'Active',
      catalog_status: 'Sellable',
      first_active_at: null,
      status: null,
    };
    const workflowInstance = {
      setSimpleVariable: jest.fn(),
    };
    const node = {
      getID: jest.fn(() => 'SV_1'),
      getValue: createValueStore(values),
      isInWorkflow: jest.fn(() => false),
      startWorkflowByID: jest.fn(() => {
        values.catalog_status = 'Hold';
        return workflowInstance;
      }),
      getWorkflowInstanceByID: jest.fn(() => null),
    };
    const validImageryCondition = {
      evaluate: jest.fn(() => ({
        isAccepted: jest.fn(() => false),
      })),
    };

    styleVariantApprovalAction.operation0(node, {}, validImageryCondition);

    expect(node.startWorkflowByID).toHaveBeenCalledWith(
      'ProductMaintenance',
      'Imagery Validation failed - placing on hold'
    );
    expect(workflowInstance.setSimpleVariable).toHaveBeenCalledWith(
      'HoldReason',
      'Imagery Validation Failed'
    );
    expect(values.status).toBe('Hold');
    expect(values.first_active_at).toBeNull();
  });

  test('releases imagery hold, sets active status, and stamps first active date', () => {
    const values = {
      ft_status: 'Active',
      catalog_status: 'Hold',
      first_active_at: null,
      status: null,
    };
    const task = {
      triggerByID: jest.fn(),
    };
    const workflowInstance = {
      getSimpleVariable: jest.fn(() => rhinoString('Imagery Validation Failed')),
      getTaskByID: jest.fn(() => task),
    };
    const node = {
      getID: jest.fn(() => 'SV_2'),
      getValue: createValueStore(values),
      isInWorkflow: jest.fn(() => true),
      startWorkflowByID: jest.fn(),
      getWorkflowInstanceByID: jest.fn(() => workflowInstance),
    };
    const validImageryCondition = {
      evaluate: jest.fn(() => ({
        isAccepted: jest.fn(() => true),
      })),
    };

    styleVariantApprovalAction.operation0(node, {}, validImageryCondition);

    expect(task.triggerByID).toHaveBeenCalledWith(
      'Approve',
      'Imagery Validation resolved - removing Hold'
    );
    expect(values.status).toBe('Hold');

    values.catalog_status = 'Sellable';
    styleVariantApprovalAction.operation0({
      getID: jest.fn(() => 'SV_3'),
      getValue: createValueStore(values),
      isInWorkflow: jest.fn(() => false),
      startWorkflowByID: jest.fn(),
      getWorkflowInstanceByID: jest.fn(() => null),
    }, {}, validImageryCondition);

    expect(values.status).toBe('Active');
    expect(values.first_active_at).toBe('2024-02-03 04:05:06');
  });

  test('logs a warning when status cannot be derived from FT/catalog status', () => {
    const values = {
      ft_status: 'Unexpected',
      catalog_status: 'Unknown',
      first_active_at: null,
      status: null,
    };
    const node = {
      getID: jest.fn(() => 'SV_4'),
      getValue: createValueStore(values),
      isInWorkflow: jest.fn(() => false),
      startWorkflowByID: jest.fn(),
      getWorkflowInstanceByID: jest.fn(() => null),
    };

    styleVariantApprovalAction.operation0(node, {}, {
      evaluate: jest.fn(() => ({
        isAccepted: jest.fn(() => true),
      })),
    });

    expect(global.logger.warning).toHaveBeenCalledWith(
      'Status not updated for SV_4 due to ft_status(Unexpected), catalog_status(Unknown)'
    );
  });
});
