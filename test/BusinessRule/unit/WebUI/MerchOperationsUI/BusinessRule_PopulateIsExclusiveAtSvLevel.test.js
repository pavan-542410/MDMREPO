const populateIsExclusiveAtSvLevel = require('../../../../../step-configs/BusinessRule/BusinessRule_PopulateIsExclusiveAtSvLevel');

class ValuePartObjectMock {
  constructor(attributeID) {
    this.attributeID = attributeID;
  }

  getAttributeID() {
    return this.attributeID;
  }
}

function createIterator(items) {
  let index = 0;

  return {
    hasNext: jest.fn(() => index < items.length),
    next: jest.fn(() => items[index++]),
  };
}

function createSv(id, currentExclusiveValue) {
  const values = {
    is_exclusive: currentExclusiveValue,
  };

  return {
    getID: jest.fn(() => id),
    getValue: jest.fn((attrID) => ({
      getSimpleValue: jest.fn(() => values[attrID] || null),
      setSimpleValue: jest.fn((value) => {
        values[attrID] = value;
      }),
    })),
    getNonApprovedObjects: jest.fn(() => ({
      iterator: jest.fn(() => createIterator([new ValuePartObjectMock('is_exclusive')])),
    })),
    approve: jest.fn(),
    __values: values,
  };
}

function createProduct(children) {
  return {
    getID: jest.fn(() => 'PRD_1'),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => 'ProductNode'),
    })),
    getChildren: jest.fn(() => ({
      iterator: jest.fn(() => createIterator(children)),
    })),
  };
}

describe('BusinessRule_PopulateIsExclusiveAtSvLevel', () => {
  beforeEach(() => {
    global.java = {
      util: {
        HashMap: function HashMap() {
          const data = {};
          return {
            put: jest.fn((key, value) => {
              data[key] = value;
            }),
            values: jest.fn(() => ({
              iterator: jest.fn(() => createIterator(Object.keys(data).map((key) => data[key]))),
            })),
          };
        },
        HashSet: function HashSet() {
          const values = [];
          return {
            add: jest.fn((value) => values.push(value)),
            size: jest.fn(() => values.length),
          };
        },
      },
    };
    global.com = {
      stibo: {
        core: {
          domain: {
            partobject: {
              ValuePartObject: ValuePartObjectMock,
            },
          },
        },
      },
    };
    global.log = {
      info: jest.fn(),
    };
  });

  afterEach(() => {
    delete global.java;
    delete global.com;
    delete global.log;
  });

  test('updates linked SVs from a direct brand-linked SV and nested ProductNode descendants', () => {
    const directSv = createSv('SV_DIRECT', 'false');
    const nestedSv = createSv('SV_CHILD', 'false');
    const cw = {
      queryChildren: jest.fn(() => ({
        forEach: jest.fn((callback) => {
          callback(nestedSv);
        }),
      })),
    };
    const product = createProduct([cw]);
    const brandNode = {
      getID: jest.fn(() => 'BRAND_1'),
      getValue: jest.fn(() => ({
        getSimpleValue: jest.fn(() => 'true'),
      })),
      queryClassificationProductLinks: jest.fn(() => ({
        asList: jest.fn(() => ({
          size: jest.fn(() => 2),
          get: jest.fn((index) => (index === 0
            ? {
              getLinkType: jest.fn(() => ({ getID: jest.fn(() => 'ProductToBrandLink') })),
              getProduct: jest.fn(() => directSv),
            }
            : {
              getLinkType: jest.fn(() => ({ getID: jest.fn(() => 'ProductToBrandLink') })),
              getProduct: jest.fn(() => product),
            })),
        })),
      })),
    };
    directSv.getObjectType = jest.fn(() => ({
      getID: jest.fn(() => 'StyleVariant'),
    }));
    const eventQueue = {
      republish: jest.fn(),
    };

    populateIsExclusiveAtSvLevel.operation0(brandNode, {}, eventQueue);

    expect(directSv.__values.is_exclusive).toBe('true');
    expect(nestedSv.__values.is_exclusive).toBe('true');
    expect(directSv.approve).toHaveBeenCalledTimes(1);
    expect(nestedSv.approve).toHaveBeenCalledTimes(1);
    expect(eventQueue.republish).toHaveBeenCalledWith(directSv);
    expect(eventQueue.republish).toHaveBeenCalledWith(nestedSv);
  });

  test('skips processing when brand_is_exclusive is blank', () => {
    const brandNode = {
      getID: jest.fn(() => 'BRAND_2'),
      getValue: jest.fn(() => ({
        getSimpleValue: jest.fn(() => '   '),
      })),
      queryClassificationProductLinks: jest.fn(),
    };

    populateIsExclusiveAtSvLevel.operation0(brandNode, {}, {
      republish: jest.fn(),
    });

    expect(brandNode.queryClassificationProductLinks).not.toHaveBeenCalled();
  });
});
