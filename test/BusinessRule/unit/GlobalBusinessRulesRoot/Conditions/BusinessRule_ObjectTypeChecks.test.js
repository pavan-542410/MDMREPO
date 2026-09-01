const isSKUorSVorCWorPRD = require('../../../../../step-configs/BusinessRule/BusinessRule_isSKUorSVorCWorPRD');
const isSKUorSVorCW = require('../../../../../step-configs/BusinessRule/BusinessRule_isSKUorSVorCW');
const isSKUorSV = require('../../../../../step-configs/BusinessRule/BusinessRule_isSKUorSV');
const isProduct = require('../../../../../step-configs/BusinessRule/BusinessRule_isProduct');
const isColorway = require('../../../../../step-configs/BusinessRule/BusinessRule_isColorway');
const isStyleVariant = require('../../../../../step-configs/BusinessRule/BusinessRule_isStyleVariant');

function createNode(typeID) {
  return {
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => typeID),
    })),
  };
}

describe('BusinessRule object type checks', () => {
  test('accepts and rejects node types for composite object-type conditions', () => {
    expect(isSKUorSVorCWorPRD.operation0(createNode('SKUNode'))).toBe(true);
    expect(isSKUorSVorCWorPRD.operation0(createNode('StyleVariant'))).toBe(true);
    expect(isSKUorSVorCWorPRD.operation0(createNode('ColorwayVariantNode'))).toBe(true);
    expect(isSKUorSVorCWorPRD.operation0(createNode('ProductNode'))).toBe(true);
    expect(isSKUorSVorCWorPRD.operation0(createNode('Asset'))).toBe(false);

    expect(isSKUorSVorCW.operation0(createNode('SKUNode'))).toBe(true);
    expect(isSKUorSVorCW.operation0(createNode('StyleVariant'))).toBe(true);
    expect(isSKUorSVorCW.operation0(createNode('ColorwayVariantNode'))).toBe(true);
    expect(isSKUorSVorCW.operation0(createNode('ProductNode'))).toBe(false);

    expect(isSKUorSV.operation0(createNode('SKUNode'))).toBe(true);
    expect(isSKUorSV.operation0(createNode('StyleVariant'))).toBe(true);
    expect(isSKUorSV.operation0(createNode('ProductNode'))).toBe(false);
  });

  test('validates single object-type conditions', () => {
    expect(isProduct.operation0(createNode('ProductNode'))).toBe(true);
    expect(isProduct.operation0(createNode('StyleVariant'))).toBeUndefined();

    expect(isColorway.operation0(createNode('ColorwayVariantNode'))).toBe(true);
    expect(isColorway.operation0(createNode('SKUNode'))).toBeUndefined();

    expect(isStyleVariant.operation0(createNode('StyleVariant'))).toBe(true);
    expect(isStyleVariant.operation0(createNode('SKUNode'))).toBeUndefined();
  });
});
