const updateProductName = require('../../../../../step-configs/BusinessRule/BusinessRule_UpdateProductName');

class ValuePartObjectMock {
  constructor(attributeID) {
    this.attributeID = attributeID;
  }

  getAttributeID() {
    return this.attributeID;
  }
}

class NamePartObjectMock {}

function createIterator(items) {
  let index = 0;

  return {
    hasNext: jest.fn(() => index < items.length),
    next: jest.fn(() => items[index++]),
  };
}

function createCollection(items) {
  return {
    toArray: jest.fn(() => items),
    forEach: jest.fn((callback) => {
      items.forEach(callback);
    }),
  };
}

function createValueStore(valuesByID) {
  return jest.fn((attrID) => ({
    getSimpleValue: jest.fn(() => valuesByID[attrID] || null),
    setSimpleValue: jest.fn((value) => {
      valuesByID[attrID] = value;
    }),
    deleteCurrent: jest.fn(() => {
      valuesByID[attrID] = '';
    }),
  }));
}

function createNode(id, valuesByID, children, classLinks, partObjects) {
  return {
    getID: jest.fn(() => id),
    getName: jest.fn(() => valuesByID.__name || id),
    setName: jest.fn((value) => {
      valuesByID.__name = value;
    }),
    getValue: createValueStore(valuesByID),
    getChildren: jest.fn(() => createCollection(children || [])),
    queryClassificationProductLinks: jest.fn(() => ({
      forEach: jest.fn((callback) => {
        (classLinks || []).forEach(callback);
      }),
    })),
    getNonApprovedObjects: jest.fn(() => ({
      iterator: jest.fn(() => createIterator(partObjects || [])),
    })),
    approve: jest.fn(),
    __values: valuesByID,
  };
}

describe('BusinessRule_UpdateProductName', () => {
  beforeEach(() => {
    global.java = {
      util: {
        LinkedHashSet: function LinkedHashSet() {
          const values = [];
          return {
            add: jest.fn((value) => values.push(value)),
            isEmpty: jest.fn(() => values.length === 0),
          };
        },
      },
    };
    global.com = {
      stibo: {
        core: {
          domain: {
            classificationproductlinktype: {
              ClassificationProductLinkTypeHome: function ClassificationProductLinkTypeHome() {},
            },
            partobject: {
              ValuePartObject: ValuePartObjectMock,
              NamePartObject: NamePartObjectMock,
            },
            approve: {
              ApproveBulkValidationException: function ApproveBulkValidationException() {},
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

  test('renames product/colorway/style variant/SKU nodes and partially approves changed names', () => {
    const schemaNode = {
      getAttributeLinks: jest.fn(() => ({
        toArray: jest.fn(() => [{
          getAttribute: jest.fn(() => ({ getID: jest.fn(() => 'size_name') })),
          getValue: jest.fn(() => ({
            getSimpleValue: jest.fn(() => '1'),
          })),
        }]),
      })),
    };
    const skuValues = { size_name: 'M', product_name: 'Old', __name: 'Old SKU' };
    const sku = createNode('SKU_1', skuValues, [], [{
      getClassification: jest.fn(() => schemaNode),
    }], [new NamePartObjectMock(), new ValuePartObjectMock('product_name')]);
    const svValues = { product_name: 'Old SV', __name: 'Old SV' };
    const sv = createNode('SV_123', svValues, [sku], [], [new NamePartObjectMock()]);
    const cwValues = { brand_color: 'Blue', product_name: 'Old CW', __name: 'Old CW' };
    const colorway = createNode('VAR_1', cwValues, [sv], [], [new NamePartObjectMock()]);
    const productValues = { product_name: 'Old Product', __name: 'Old Product' };
    const product = createNode('PRD_1', productValues, [colorway], [], [new ValuePartObjectMock('product_name')]);
    const node = {
      getParent: jest.fn(() => product),
    };

    updateProductName.operation0({
      getHome: jest.fn(() => ({
        getLinkTypeByID: jest.fn(() => ({ getID: jest.fn(() => 'SKUToSizeSchemaLink') })),
      })),
    }, node, 'New Product Name');

    expect(productValues.__name).toBe('New Product Name');
    expect(productValues.product_name).toBe('New Product Name');
    expect(cwValues.__name).toBe('New Product Name - Blue');
    expect(cwValues.product_name).toBe('');
    expect(svValues.__name).toBe('123');
    expect(svValues.product_name).toBe('');
    expect(skuValues.__name).toBe('New Product Name - Blue - M');
    expect(skuValues.product_name).toBe('');
    expect(product.approve).toHaveBeenCalledTimes(1);
    expect(colorway.approve).toHaveBeenCalledTimes(1);
    expect(sv.approve).toHaveBeenCalledTimes(1);
    expect(sku.approve).toHaveBeenCalledTimes(1);
  });
});
