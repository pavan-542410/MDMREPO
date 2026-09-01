const partiallyApproveSellsideAttributes = require('../../../../../step-configs/BusinessRule/BusinessRule_PartiallyApproveSellsideAttributes');

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

describe('BusinessRule_PartiallyApproveSellsideAttributes', () => {
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
              ApproveBulkValidationException: function ApproveBulkValidationException() {},
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
    global.log = {
      warning: jest.fn(),
    };
  });

  afterEach(() => {
    delete global.java;
    delete global.com;
    delete global.log;
  });

  test('approves node names and attributes from the ManagedByUDP attribute group', () => {
    const node = {
      getNonApprovedObjects: jest.fn(() => ({
        iterator: jest.fn(() => createIterator([
          new ValuePartObjectMock('sell_attr'),
          new ValuePartObjectMock('other_attr'),
          new NamePartObjectMock(),
        ])),
      })),
      approve: jest.fn(),
    };
    const step = {
      getAttributeHome: jest.fn(() => ({
        getAttributeByID: jest.fn(() => null),
      })),
      getAttributeGroupHome: jest.fn(() => ({
        getAttributeGroupByID: jest.fn(() => ({
          getAllAttributes: jest.fn(() => ({
            iterator: jest.fn(() => createIterator([
              { getID: jest.fn(() => 'sell_attr') },
            ])),
          })),
        })),
      })),
    };

    partiallyApproveSellsideAttributes.operation0(node, step, {
      getAllHomes: jest.fn(() => ({
        attrGroup: {},
      })),
    });

    expect(node.approve).toHaveBeenCalledTimes(1);
    expect(node.approve.mock.calls[0][0].values).toHaveLength(2);
    expect(node.approve.mock.calls[0][0].values[0].getAttributeID()).toBe('sell_attr');
    expect(node.approve.mock.calls[0][0].values[1]).toBeInstanceOf(NamePartObjectMock);
  });

  test('logs synchronize exceptions thrown by approval', () => {
    const node = {
      getNonApprovedObjects: jest.fn(() => ({
        iterator: jest.fn(() => createIterator([
          new ValuePartObjectMock('sell_attr'),
        ])),
      })),
      approve: jest.fn(() => {
        throw {
          javaException: new SynchronizeExceptionMock('Sync failed'),
        };
      }),
    };
    const step = {
      getAttributeHome: jest.fn(() => ({
        getAttributeByID: jest.fn(() => null),
      })),
      getAttributeGroupHome: jest.fn(() => ({
        getAttributeGroupByID: jest.fn(() => ({
          getAllAttributes: jest.fn(() => ({
            iterator: jest.fn(() => createIterator([
              { getID: jest.fn(() => 'sell_attr') },
            ])),
          })),
        })),
      })),
    };

    expect(() => partiallyApproveSellsideAttributes.operation0(node, step, {
      getAllHomes: jest.fn(() => ({
        attrGroup: {},
      })),
    })).not.toThrow();
    expect(global.log.warning).toHaveBeenCalledWith('Sync failed');
  });
});
