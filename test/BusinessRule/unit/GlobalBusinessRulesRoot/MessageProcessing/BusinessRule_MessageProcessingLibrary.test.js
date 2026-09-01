const messageProcessingLibrary = require('../../../../../step-configs/BusinessRule/BusinessRule_MessageProcessingLibrary');

function createHashSetMock(initialItems) {
  const values = [];

  (initialItems || []).forEach((item) => {
    if (values.indexOf(item) === -1) {
      values.push(item);
    }
  });

  return {
    add: (value) => {
      if (values.indexOf(value) === -1) {
        values.push(value);
      }
    },
    forEach: (callback) => values.forEach((value) => callback(value)),
    size: () => values.length,
    toArray: () => values.slice(),
    values
  };
}

function createAttribute(attributeID, multiValued) {
  return {
    getID: () => attributeID,
    isMultiValued: () => Boolean(multiValued)
  };
}

function createValueHolder(initialValue) {
  const holder = {
    currentValue: initialValue,
    deleted: false,
    getSimpleValue: () => holder.currentValue,
    setSimpleValue: (nextValue) => {
      holder.currentValue = nextValue;
      holder.deleted = false;
    },
    deleteCurrent: () => {
      holder.currentValue = '';
      holder.deleted = true;
    },
    replace: () => {
      const values = [];
      return {
        addValue: (value) => values.push(value),
        apply: () => {
          holder.currentValue = values.join('<multisep/>');
        }
      };
    }
  };

  return holder;
}

function createNode(objectTypeID, values, children, parent, links) {
  const state = values || {};

  return {
    _state: state,
    getID: () => state.__id || `${objectTypeID}_1`,
    getObjectType: () => ({ getID: () => objectTypeID }),
    getChildren: () => ({
      toArray: () => (children || []),
      forEach: (callback) => (children || []).forEach((child) => callback(child))
    }),
    getParent: () => parent || null,
    getValue: (attrID) => {
      if (!state[attrID]) {
        state[attrID] = createValueHolder(null);
      }
      return state[attrID];
    },
    setName: (name) => {
      state.__name = name;
    },
    queryClassificationProductLinks: () => ({
      forEach: (callback) => (links || []).forEach((link) => callback(link))
    })
  };
}

describe('BusinessRule_MessageProcessingLibrary', () => {
  beforeEach(() => {
    global.java = {
      util: {
        HashSet: function HashSet(items) {
          if (items && typeof items.toArray === 'function') {
            return createHashSetMock(items.toArray());
          }
          if (Array.isArray(items)) {
            return createHashSetMock(items);
          }
          return createHashSetMock();
        },
        ArrayList: function ArrayList(items) {
          return (items && typeof items.toArray === 'function') ? items.toArray() : [];
        },
        Collections: {
          sort: (list) => list.sort()
        }
      }
    };

    global.com = {
      stibo: {
        core: {
          domain: {
            classificationproductlinktype: {
              ClassificationProductLinkTypeHome: function ClassificationProductLinkTypeHome() {}
            }
          }
        }
      }
    };
  });

  afterEach(() => {
    delete global.java;
    delete global.com;
  });

  test('promotes consistent child values to parent and writes a fragmentation report for mismatched values', () => {
    const firstChild = createNode('StyleVariant', {
      __id: 'SV_1',
      product_name: createValueHolder('Classic Shirt'),
      color: createValueHolder('Blue')
    });
    const secondChild = createNode('StyleVariant', {
      __id: 'SV_2',
      product_name: createValueHolder('Classic Shirt'),
      color: createValueHolder('Red')
    });
    const parent = createNode('ProductNode', {
      __id: 'PRD_1',
      product_name: createValueHolder(''),
      color: createValueHolder(''),
      attribute_upsert_report: createValueHolder('')
    }, [firstChild, secondChild]);
    const step = {
      getAttributeHome: () => ({
        getAttributeByID: (attrID) => createAttribute(attrID, false)
      })
    };

    messageProcessingLibrary.upsertOnNodeFromChildren(parent, {
      product_name: 'product_name',
      color: 'color'
    }, step);

    expect(parent.getValue('product_name').getSimpleValue()).toBe('Classic Shirt');
    expect(parent.getValue('color').deleted).toBe(true);
    expect(parent.getValue('attribute_upsert_report').getSimpleValue()).toContain('Attribute: color');
  });

  test('calculates upsert on colorway/product nodes and builds names for product, colorway, and SKU', () => {
    const schema = {
      getAttributeLinks: () => ({
        toArray: () => [{
          getAttribute: () => ({ getID: () => 'size_name' }),
          getValue: () => createValueHolder('1')
        }]
      })
    };
    const skuNode = createNode('SKUNode', {
      __id: 'SKU_1',
      product_name: createValueHolder('Classic Shirt'),
      brand_color: createValueHolder('Navy'),
      size_name: createValueHolder('M')
    }, [], null, [{
      getClassification: () => schema
    }]);
    const colorwayNode = createNode('ColorwayVariantNode', {
      __id: 'VAR_1',
      product_name: createValueHolder('Classic Shirt'),
      brand_color: createValueHolder('Navy')
    }, [skuNode]);
    const productNode = createNode('ProductNode', {
      __id: 'PRD_1',
      product_name: createValueHolder('Classic Shirt')
    }, [colorwayNode]);
    const step = {
      getAttributeHome: () => ({
        getAttributeByID: (attrID) => createAttribute(attrID, false)
      }),
      getHome: () => ({
        getLinkTypeByID: () => ({ getID: () => 'SKUToSizeSchemaLink' })
      })
    };

    messageProcessingLibrary.calculateUpsertOnProduct(colorwayNode, step);
    messageProcessingLibrary.calculateUpsertOnProduct(productNode, step);

    expect(messageProcessingLibrary.convertToString(null)).toBe('');
    expect(messageProcessingLibrary.getProductName(productNode)).toBe('Classic Shirt');
    expect(messageProcessingLibrary.getColorwayName(colorwayNode)).toBe('Classic Shirt - Navy');
    expect(messageProcessingLibrary.getSKUName(skuNode, step)).toBe('Classic Shirt - Navy - M');

    messageProcessingLibrary.updateNameFromAttrs(productNode, step);
    messageProcessingLibrary.updateNameFromAttrs(colorwayNode, step);
    messageProcessingLibrary.updateNameFromAttrs(skuNode, step);

    expect(productNode._state.__name).toBe('Classic Shirt');
    expect(colorwayNode._state.__name).toBe('Classic Shirt - Navy');
    expect(skuNode._state.__name).toBe('Classic Shirt - Navy - M');
  });

  test('rolls up inventory dates and statuses from SKU to Colorway and then Product', () => {
    const productNode = createNode('ProductNode', {
      __id: 'PRD_1',
      first_expected_inventory_date: createValueHolder(''),
      latest_expected_inventory_date: createValueHolder(''),
      product_status: createValueHolder('')
    });
    const colorwayNode = createNode('ColorwayVariantNode', {
      __id: 'VAR_1',
      first_expected_inventory_date: createValueHolder(''),
      latest_expected_inventory_date: createValueHolder(''),
      colorway_status: createValueHolder('')
    }, [], productNode);
    const firstSku = createNode('SKUNode', {
      __id: 'SKU_1',
      first_expected_inventory_date: createValueHolder('2024-01-10'),
      latest_expected_inventory_date: createValueHolder('2024-02-01'),
      status: createValueHolder('Pending')
    }, [], colorwayNode);
    const secondSku = createNode('SKUNode', {
      __id: 'SKU_2',
      first_expected_inventory_date: createValueHolder('2024-01-01'),
      latest_expected_inventory_date: createValueHolder('2024-01-20'),
      status: createValueHolder('Approved')
    }, [], colorwayNode);

    colorwayNode.getChildren = () => ({
      toArray: () => [firstSku, secondSku],
      forEach: (callback) => [firstSku, secondSku].forEach((child) => callback(child))
    });
    productNode.getChildren = () => ({
      toArray: () => [colorwayNode],
      forEach: (callback) => [colorwayNode].forEach((child) => callback(child))
    });

    messageProcessingLibrary.roll_up_inventory_dates_status(colorwayNode);

    expect(colorwayNode.getValue('first_expected_inventory_date').getSimpleValue()).toBe('2024-01-01');
    expect(colorwayNode.getValue('latest_expected_inventory_date').getSimpleValue()).toBe('2024-01-20');
    expect(colorwayNode.getValue('colorway_status').getSimpleValue()).toBe('Partially Approved<multisep/>Partially Pending');
    expect(productNode.getValue('product_status').getSimpleValue()).toBe('Partially Approved<multisep/>Partially Pending');
  });
});
