const partialApproveNodeAttributes = require('../../../../../step-configs/BusinessRule/BusinessRule_PartialApproveNodeAttributes');

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

  iterator() {
    let index = 0;

    return {
      hasNext: jest.fn(() => index < this.values.length),
      next: jest.fn(() => this.values[index++]),
    };
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

class SynchronizeExceptionMock {
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

describe('BusinessRule_PartialApproveNodeAttributes', () => {
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
                SynchronizeException: SynchronizeExceptionMock,
              },
            },
          },
        },
      },
    };
    global.logger = {
      info: jest.fn(),
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

  test('partially approves matching value attributes and node names from explicit attrs and groups', () => {
    const node = {
      getNonApprovedObjects: jest.fn(() => ({
        iterator: jest.fn(() => createIterator([
          new ValuePartObjectMock('sell_attr'),
          new ValuePartObjectMock('direct_attr'),
          new ValuePartObjectMock('ignored_attr'),
          new NamePartObjectMock(),
        ])),
      })),
      approve: jest.fn(),
    };
    const step = {
      getAttributeHome: jest.fn(() => ({
        getAttributeByID: jest.fn((id) => (id === 'direct_attr'
          ? { getID: jest.fn(() => 'direct_attr') }
          : null)),
      })),
      getAttributeGroupHome: jest.fn(() => ({
        getAttributeGroupByID: jest.fn((id) => (id === 'ManagedByUDP'
          ? {
            getAllAttributes: jest.fn(() => ({
              iterator: jest.fn(() => createIterator([
                { getID: jest.fn(() => 'sell_attr') },
              ])),
            })),
          }
          : null)),
      })),
    };

    partialApproveNodeAttributes.operation0(
      step,
      node,
      JSON.stringify({ groupName: 'ManagedByUDP', attributeName: 'direct_attr' }),
      {
        getAllHomes: jest.fn(() => ({
          attrGroup: {},
        })),
      }
    );

    expect(node.approve).toHaveBeenCalledTimes(1);
    const approvalSet = node.approve.mock.calls[0][0];
    expect(approvalSet.values).toHaveLength(3);
    expect(approvalSet.values[0].getAttributeID()).toBe('sell_attr');
    expect(approvalSet.values[1].getAttributeID()).toBe('direct_attr');
    expect(approvalSet.values[2]).toBeInstanceOf(NamePartObjectMock);
  });

  test('logs expected approval failures and rethrows unexpected errors', () => {
    const step = {
      getAttributeHome: jest.fn(() => ({
        getAttributeByID: jest.fn(() => ({ getID: jest.fn(() => 'direct_attr') })),
      })),
      getAttributeGroupHome: jest.fn(() => ({
        getAttributeGroupByID: jest.fn(() => null),
      })),
    };
    const sl = {
      getAllHomes: jest.fn(() => ({
        attrGroup: {},
      })),
    };
    const handledNode = {
      getNonApprovedObjects: jest.fn(() => ({
        iterator: jest.fn(() => createIterator([
          new ValuePartObjectMock('direct_attr'),
        ])),
      })),
      approve: jest.fn(() => {
        throw {
          javaException: new ApproveBulkValidationExceptionMock('Validation failed'),
        };
      }),
    };

    expect(() => partialApproveNodeAttributes.operation0(
      step,
      handledNode,
      JSON.stringify({ attributeName: 'direct_attr' }),
      sl
    )).not.toThrow();
    expect(global.log.warning).toHaveBeenCalledWith('Validation failed');

    const unexpectedNode = {
      getNonApprovedObjects: jest.fn(() => ({
        iterator: jest.fn(() => createIterator([
          new ValuePartObjectMock('direct_attr'),
        ])),
      })),
      approve: jest.fn(() => {
        throw new Error('Unexpected approval failure');
      }),
    };

    expect(() => partialApproveNodeAttributes.operation0(
      step,
      unexpectedNode,
      JSON.stringify({ attributeName: 'direct_attr' }),
      sl
    )).toThrow('Unexpected approval failure');
  });
});
