const clearMerchMoments = require('../../../../../step-configs/BusinessRule/BusinessRule_ClearMerchMoments');

class HashSetMock {
  constructor() {
    this.values = [];
  }

  add(value) {
    this.values.push(value);
  }

  isEmpty() {
    return this.values.length === 0;
  }
}

class ValuePartObjectMock {
  constructor(attributeID) {
    this.attributeID = attributeID;
  }

  getAttributeID() {
    return this.attributeID;
  }
}

class NamePartObjectMock {}

class ApproveBulkValidationExceptionMock {
  constructor(message) {
    this.message = message;
  }

  getMessage() {
    return this.message;
  }
}

function createIterator(items) {
  let index = 0;

  return {
    hasNext: jest.fn(() => index < items.length),
    next: jest.fn(() => items[index++]),
  };
}

function createNode(id, merchMoments, options) {
  const valueWrapper = {
    getValues: jest.fn(() => ({
      toArray: jest.fn(() => merchMoments.map((value) => ({
        getSimpleValue: jest.fn(() => value),
      }))),
    })),
    replace: jest.fn(() => valueWrapper),
    addSimpleValue: jest.fn(),
    apply: jest.fn(),
    deleteCurrent: jest.fn(),
  };

  return {
    getID: jest.fn(() => id),
    getValue: jest.fn((attrID) => (options && options.missingAttr && attrID === 'merch_moments'
      ? null
      : valueWrapper)),
    getChildren: jest.fn(() => ({
      forEach: jest.fn((callback) => {
        (options && options.children ? options.children : []).forEach(callback);
      }),
    })),
    getNonApprovedObjects: jest.fn(() => ({
      iterator: jest.fn(() => createIterator([
        new ValuePartObjectMock('merch_moments'),
        new ValuePartObjectMock('ignored_attr'),
        new NamePartObjectMock(),
      ])),
    })),
    approve: jest.fn(options && options.approveImpl ? options.approveImpl : undefined),
    __valueWrapper: valueWrapper,
  };
}

describe('BusinessRule_ClearMerchMoments', () => {
  beforeEach(() => {
    global.java = {
      util: {
        HashSet: HashSetMock,
      },
    };
    global.com = {
      stibo: {
        core: {
          domain: {
            partobject: {
              ValuePartObject: ValuePartObjectMock,
              NamePartObject: NamePartObjectMock,
            },
            approve: {
              ApproveBulkValidationException: ApproveBulkValidationExceptionMock,
            },
            synchronize: {
              exception: {
                SynchronizeException: function SynchronizeException() {},
              },
            },
          },
        },
      },
    };
    global.logger = {
      info: jest.fn(),
      warning: jest.fn(),
      severe: jest.fn(),
    };
    global.log = {
      warning: jest.fn(),
    };
  });

  afterEach(() => {
    delete global.java;
    delete global.com;
    delete global.logger;
    delete global.log;
  });

  test('copies merch moments from colorway to children, clears parent values, and partially approves touched nodes', () => {
    const child = createNode('SV_1', []);
    const parent = createNode('CW_1', ['Holiday', 'Vacation'], {
      children: [child],
    });

    clearMerchMoments.operation0(parent);

    expect(child.__valueWrapper.replace).toHaveBeenCalledTimes(1);
    expect(child.__valueWrapper.addSimpleValue).toHaveBeenCalledWith('Holiday');
    expect(child.__valueWrapper.addSimpleValue).toHaveBeenCalledWith('Vacation');
    expect(child.__valueWrapper.apply).toHaveBeenCalledTimes(1);
    expect(parent.__valueWrapper.deleteCurrent).toHaveBeenCalledTimes(1);
    expect(child.approve).toHaveBeenCalledTimes(1);
    expect(parent.approve).toHaveBeenCalledTimes(1);
  });

  test('logs warning for missing child attribute and handles approval validation exceptions', () => {
    const child = createNode('SV_2', [], {
      missingAttr: true,
      approveImpl: jest.fn(() => {
        throw {
          javaException: new ApproveBulkValidationExceptionMock('Validation failed'),
        };
      }),
    });
    const parent = createNode('CW_2', ['Holiday'], {
      children: [child],
    });

    expect(() => clearMerchMoments.operation0(parent)).not.toThrow();
    expect(global.logger.warning).toHaveBeenCalledWith("Attribute 'merch_moments' not found on node: SV_2");
    expect(global.log.warning).toHaveBeenCalledWith('Validation failed');
  });
});
