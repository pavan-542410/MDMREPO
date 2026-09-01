const metricsLibrary = require('../../../../../step-configs/BusinessRule/BusinessRule_MetricsLibrary');

function createAttr(id) {
  return {
    getID: jest.fn(() => id),
  };
}

function createNode(id, parent, valuesByID, attrLinksByAttrID, itemTypeNode) {
  return {
    getID: jest.fn(() => id),
    getName: jest.fn(() => `${id}-name`),
    getParent: jest.fn(() => parent || null),
    getValue: jest.fn((attrID) => ({
      getSimpleValue: jest.fn(() => Object.prototype.hasOwnProperty.call(valuesByID, attrID)
        ? valuesByID[attrID]
        : null),
    })),
    getAttributeLink: jest.fn((attr) => attrLinksByAttrID[attr.getID()] || null),
    getManager: jest.fn(() => ({
      getHome: jest.fn(() => ({
        getLinkTypeByID: jest.fn(() => 'SKUToItemTypeLink'),
      })),
    })),
    queryClassificationProductLinks: jest.fn(() => ({
      forEach: jest.fn((callback) => {
        if (itemTypeNode) {
          callback({
            getClassification: jest.fn(() => itemTypeNode),
          });
        }
      }),
    })),
  };
}

describe('BusinessRule_MetricsLibrary', () => {
  beforeEach(() => {
    global.com = {
      stibo: {
        core: {
          domain: {
            classificationproductlinktype: {
              ClassificationProductLinkTypeHome: function ClassificationProductLinkTypeHome() {},
            },
          },
        },
      },
    };
  });

  afterEach(() => {
    delete global.com;
  });

  test('returns score 100 when mandatory inherited attributes are populated', () => {
    const colorAttr = createAttr('brand_color');
    const root = createNode('ItemTypeHierarchyRoot', null, {}, {}, null);
    const department = createNode('DepartmentNode', root, {}, {
      brand_color: {
        isMandatory: jest.fn(() => true),
      },
    }, null);
    const itemTypeNode = createNode('ItemTypeNode', department, {}, {}, null);
    const node = createNode('SKU_1', null, {
      brand_color: 'Red',
    }, {}, itemTypeNode);
    const step = {
      getAttributeHome: jest.fn(() => ({
        getAttributeByID: jest.fn(() => colorAttr),
      })),
    };

    expect(metricsLibrary.mandatoryAttributeCheck(node, step, ['brand_color'])).toEqual({
      score: 100,
      message: 'Attribution Complete.',
    });
    expect(metricsLibrary.getItemTypeHierarchy(node)).toBe(itemTypeNode);
    expect(metricsLibrary.getInheritedAttrLink(itemTypeNode, colorAttr, {})).toEqual([
      department.getAttributeLink(colorAttr),
      'DepartmentNode-name',
    ]);
  });

  test('returns score 0 with a mandatory-attribute message and reads attribute groups', () => {
    const colorAttr = createAttr('brand_color');
    const root = createNode('ItemTypeHierarchyRoot', null, {}, {}, null);
    const department = createNode('DepartmentNode', root, {}, {
      brand_color: {
        isMandatory: jest.fn(() => true),
      },
    }, null);
    const itemTypeNode = createNode('ItemTypeNode', department, {}, {}, null);
    const node = createNode('SKU_2', null, {
      brand_color: '',
    }, {}, itemTypeNode);
    const attributeGroup = {
      getAttributes: jest.fn(() => ({
        forEach: jest.fn((callback) => {
          callback(colorAttr);
        }),
      })),
    };
    const step = {
      getAttributeHome: jest.fn(() => ({
        getAttributeByID: jest.fn(() => colorAttr),
      })),
      getAttributeGroupHome: jest.fn(() => ({
        getAttributeGroupByID: jest.fn((groupID) => (
          groupID === 'RequiredGroup' ? attributeGroup : null
        )),
      })),
    };
    const cache = {};

    expect(metricsLibrary.mandatoryAttributeCheck(node, step, ['brand_color'])).toEqual({
      score: 0,
      message: 'brand_color is mandatory for DepartmentNode-name.',
    });
    expect(metricsLibrary.getCachedParent(itemTypeNode, cache)).toBe(department);
    expect(metricsLibrary.getCachedParent(itemTypeNode, cache)).toBe(department);
    expect(metricsLibrary.getAttrIDArrFromGroupID(step, 'RequiredGroup')).toEqual(['brand_color']);
    expect(metricsLibrary.getAttrIDArrFromGroupID(step, 'MissingGroup')).toEqual([]);
  });
});
