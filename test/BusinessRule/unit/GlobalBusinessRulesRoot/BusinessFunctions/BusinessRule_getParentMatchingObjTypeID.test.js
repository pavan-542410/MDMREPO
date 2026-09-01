const getParentMatchingObjTypeID = require('../../../../../step-configs/BusinessRule/BusinessRule_getParentMatchingObjTypeID');

function createNode(typeID, parent) {
  return {
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => typeID),
    })),
    getParent: jest.fn(() => parent || null),
  };
}

describe('BusinessRule_getParentMatchingObjTypeID', () => {
  test('returns null for missing inputs and when no ancestor matches', () => {
    const root = createNode('Root', null);
    const sku = createNode('SKUNode', root);

    expect(getParentMatchingObjTypeID.operation0(null, 'ProductNode')).toBeNull();
    expect(getParentMatchingObjTypeID.operation0(sku, '')).toBeNull();
    expect(getParentMatchingObjTypeID.operation0(sku, 'StyleVariant')).toBeNull();
  });

  test('returns the first matching node, including the current node and ancestors', () => {
    const product = createNode('ProductNode', null);
    const colorway = createNode('ColorwayVariantNode', product);
    const sku = createNode('SKUNode', colorway);

    expect(getParentMatchingObjTypeID.operation0(sku, 'SKUNode')).toBe(sku);
    expect(getParentMatchingObjTypeID.operation0(sku, 'ProductNode')).toBe(product);
  });
});
