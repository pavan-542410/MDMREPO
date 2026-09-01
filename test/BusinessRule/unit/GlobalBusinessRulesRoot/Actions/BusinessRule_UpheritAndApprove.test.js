const upheritAndApprove = require('../../../../../step-configs/BusinessRule/BusinessRule_UpheritAndApprove');

class LinkedHashSetMock {
  constructor() {
    this.values = [];
  }

  add(value) {
    if (this.values.indexOf(value) === -1) {
      this.values.push(value);
    }
  }

  forEach(callback) {
    this.values.forEach(callback);
  }
}

class HashSetMock {
  constructor() {
    this.values = [];
  }

  add(value) {
    this.values.push(value);
  }

  contains(value) {
    return this.values.indexOf(value) !== -1;
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

function createValueStore(valuesByID) {
  const wrappers = {};

  return jest.fn((attrID) => {
    if (!wrappers[attrID]) {
      wrappers[attrID] = {
        getSimpleValue: jest.fn(() => valuesByID[attrID] || null),
        setSimpleValue: jest.fn((value) => {
          valuesByID[attrID] = value;
        }),
        deleteCurrent: jest.fn(() => {
          delete valuesByID[attrID];
        }),
      };
    }

    return wrappers[attrID];
  });
}

function createNode(id, objectTypeID, valuesByID, children) {
  const node = {
    getID: jest.fn(() => id),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => objectTypeID),
    })),
    getValue: createValueStore(valuesByID),
    getChildren: jest.fn(() => ({
      forEach: jest.fn((callback) => {
        (children || []).forEach(callback);
      }),
    })),
    getParent: jest.fn(() => null),
    getNonApprovedObjects: jest.fn(() => ({
      iterator: jest.fn(() => createIterator([])),
    })),
    approve: jest.fn(),
    __values: valuesByID,
  };

  (children || []).forEach((child) => {
    child.getParent = jest.fn(() => node);
  });

  return node;
}

function createGroup(groupID, attributeIDs) {
  return {
    getID: jest.fn(() => groupID),
    getAllAttributes: jest.fn(() => ({
      iterator: jest.fn(() => createIterator(attributeIDs.map((attributeID) => ({
        getID: jest.fn(() => attributeID),
      })))),
    })),
  };
}

describe('BusinessRule_UpheritAndApprove', () => {
  beforeEach(() => {
    global.java = {
      util: {
        LinkedHashSet: LinkedHashSetMock,
        HashSet: HashSetMock,
      },
    };
    global.com = {
      stibo: {
        core: {
          domain: {
            partobject: {
              ValuePartObject: ValuePartObjectMock,
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
    };
  });

  afterEach(() => {
    delete global.java;
    delete global.com;
    delete global.logger;
  });

  test('upherits product attrs, but currently misses colorway attrs because both attr groups share the same cache key', () => {
    const sku = createNode('SKU_1', 'SKUNode', {
      product_attr: 'old-product',
      colorway_attr: 'old-colorway',
    }, []);
    const childSv = createNode('SV_CHILD', 'StyleVariant', {
      product_attr: 'child-product',
      colorway_attr: 'child-colorway',
    }, [sku]);
    const colorway = createNode('CW_1', 'ColorwayVariantNode', {
      product_attr: 'old-product',
      colorway_attr: 'old-colorway',
    }, [childSv]);
    const product = createNode('PRD_1', 'ProductNode', {
      product_name: 'Test Product',
      product_attr: 'old-product',
    }, [colorway]);
    const styleVariant = createNode('SV_1', 'StyleVariant', {
      product_name: 'Test Product',
      product_attr: 'new-product',
      colorway_attr: 'new-colorway',
    }, []);

    colorway.getParent = jest.fn(() => product);
    styleVariant.getParent = jest.fn(() => colorway);
    styleVariant.getNonApprovedObjects = jest.fn(() => ({
      iterator: jest.fn(() => createIterator([
        new ValuePartObjectMock('product_attr'),
        new ValuePartObjectMock('colorway_attr'),
      ])),
    }));

    const ui = {
      getClass: jest.fn(() => ({
        getName: jest.fn(() => 'com.stibo.webui.bindaction.server.bind.WebUiContextImpl'),
      })),
      showAlert: jest.fn(),
    };

    upheritAndApprove.operation0(
      styleVariant,
      createGroup('ProductUpheritAttributes', ['product_attr']),
      createGroup('ColorwayUpheritAttributes', ['colorway_attr']),
      ui
    );

    expect(product.__values.product_attr).toBe('new-product');
    expect(colorway.__values.colorway_attr).toBe('old-colorway');
    expect(colorway.__values.product_attr).toBeUndefined();
    expect(childSv.__values.product_attr).toBeUndefined();
    expect(childSv.__values.colorway_attr).toBe('child-colorway');
    expect(sku.__values.product_attr).toBe('old-product');
    expect(product.approve).toHaveBeenCalledTimes(1);
    expect(colorway.approve).toHaveBeenCalledTimes(1);
    expect(childSv.approve).toHaveBeenCalledTimes(1);
    expect(sku.approve).not.toHaveBeenCalled();
    expect(ui.showAlert).toHaveBeenCalledWith(
      'ACKNOWLEDGMENT',
      'Successfully updated Test Product(SV_1)'
    );
  });

  test('reports expected approval failures through logger when not running in WebUI', () => {
    const product = createNode('PRD_2', 'ProductNode', {
      product_name: 'Broken Product',
      product_attr: 'new-product',
    }, []);
    product.getNonApprovedObjects = jest.fn(() => ({
      iterator: jest.fn(() => createIterator([
        new ValuePartObjectMock('product_attr'),
      ])),
    }));
    product.approve = jest.fn(() => {
      throw {
        javaException: new ApproveBulkValidationExceptionMock('Cannot approve product'),
      };
    });

    upheritAndApprove.operation0(
      product,
      createGroup('ProductUpheritAttributes', ['product_attr']),
      createGroup('ColorwayUpheritAttributes', ['colorway_attr']),
      {
        getClass: jest.fn(() => ({
          getName: jest.fn(() => 'NonWebUiContext'),
        })),
        showAlert: jest.fn(),
      }
    );

    expect(global.logger.info).toHaveBeenCalledWith(
      'Broken Product(PRD_2): Not Approved, Failure Reason: Cannot approve product'
    );
  });
});
