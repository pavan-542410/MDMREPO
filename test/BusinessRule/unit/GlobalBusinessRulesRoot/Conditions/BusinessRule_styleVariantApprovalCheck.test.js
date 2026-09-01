'use strict';

const br = require('../../../../../step-configs/BusinessRule/BusinessRule_styleVariantApprovalCheck');
const validationConfig = require('../../../../../step-configs/BusinessRule/BusinessRule_StyleVariantApprovalValidationConfig');
const validationFunction = require('../../../../../step-configs/BusinessRule/BusinessRule_StyleVariantApprovalValidationFunction');

function makeNode(objectTypeID, values, parent, refsByType) {
  const attrNames = {
    product_name: 'Product Name',
    is_exclusive: 'Is Exclusive'
  };
  return {
    getID: () => 'SV_100',
    getObjectType: () => ({ getID: () => objectTypeID }),
    getParent: () => parent || null,
    getManager: () => ({
      getAttributeHome: () => ({
        getAttributeByID: (attrID) => ({
          getName: () => attrNames[attrID] || attrID
        })
      })
    }),
    getValue: (attrID) => ({
      getSimpleValue: () => values[attrID]
    }),
    queryClassificationProductLinks: (linkType) => ({
      asList: () => ({
        toArray: () => (refsByType[linkType.getID()] || []).map((targetID) => ({
          getClassification: () => targetID ? { getID: () => targetID } : null
        }))
      })
    })
  };
}

describe('BusinessRule_styleVariantApprovalCheck', () => {
  const vendorReferenceType = { getID: () => 'ProductToVendorLink' };
  const brandReferenceType = { getID: () => 'ProductToBrandLink' };
  const styleReferenceType = { getID: () => 'StyleVariantToStyleLink' };
  const sizeReferenceType = { getID: () => 'SKUToSizeSchemaLink' };
  const validationConfigFunction = {
    evaluate: () => validationConfig.operation0()
  };
  const validationFunctionBind = {
    evaluate: (params) => validationFunction.operation0(
      vendorReferenceType,
      brandReferenceType,
      styleReferenceType,
      sizeReferenceType,
      params.node,
      params.configJson
    )
  };

  test('returns true when all required data is present', () => {
    const product = makeNode('ProductNode', {}, null, {
      ProductToVendorLink: ['VENDOR_1'],
      ProductToBrandLink: ['BRAND_1']
    });
    const colorway = makeNode('ColorwayVariantNode', {}, product, {});
    const node = makeNode('StyleVariant', {
      product_name: 'Dress',
      is_exclusive: 'true',
      is_fix_eligible: 'false',
      status: 'Active',
      is_shop_eligible: 'true',
      is_not_sendable_to_petite: 'false',
      is_do_not_ship: 'false',
      is_extras_eligible: 'true',
      is_not_sendable_to_plus: 'false',
      ft_data_model_style_variant_id: ''
    }, colorway, {
      StyleVariantToStyleLink: ['STYLE_1'],
      SKUToSizeSchemaLink: ['SIZE_1']
    });

    expect(br.operation0(
      node,
      vendorReferenceType,
      brandReferenceType,
      styleReferenceType,
      sizeReferenceType,
      validationConfigFunction,
      validationFunctionBind
    )).toBe(true);
  });

  test('returns joined validation errors for missing attributes and references', () => {
    const product = makeNode('ProductNode', {}, null, {
      ProductToVendorLink: [],
      ProductToBrandLink: []
    });
    const colorway = makeNode('ColorwayVariantNode', {}, product, {});
    const node = makeNode('StyleVariant', {
      product_name: '',
      is_exclusive: 'invalid',
      is_fix_eligible: 'false',
      status: '',
      is_shop_eligible: 'true',
      is_not_sendable_to_petite: '',
      is_do_not_ship: 'false',
      is_extras_eligible: 'true',
      is_not_sendable_to_plus: 'false'
    }, colorway, {
      StyleVariantToStyleLink: [],
      SKUToSizeSchemaLink: []
    });

    const result = br.operation0(
      node,
      vendorReferenceType,
      brandReferenceType,
      styleReferenceType,
      sizeReferenceType,
      validationConfigFunction,
      validationFunctionBind
    );

    expect(result).toContain('Missing required attribute: Product Name');
    expect(result).toContain('Invalid boolean attribute: Is Exclusive must be TRUE or FALSE.');
    expect(result).toContain('Missing or invalid required reference: Vendor');
    expect(result).toContain('Missing or invalid required reference: Style');
  });

  test('does not duplicate hasStitchFixID validation logic', () => {
    const product = makeNode('ProductNode', {}, null, {
      ProductToVendorLink: ['VENDOR_1'],
      ProductToBrandLink: ['BRAND_1']
    });
    const colorway = makeNode('ColorwayVariantNode', {}, product, {});
    const node = makeNode('StyleVariant', {
      product_name: 'Dress',
      is_exclusive: 'true',
      is_fix_eligible: 'false',
      status: 'Active',
      is_shop_eligible: 'true',
      is_not_sendable_to_petite: 'false',
      is_do_not_ship: 'false',
      is_extras_eligible: 'true',
      is_not_sendable_to_plus: 'false',
      ft_data_model_style_variant_id: ''
    }, colorway, {
      StyleVariantToStyleLink: ['STYLE_1'],
      SKUToSizeSchemaLink: ['SIZE_1']
    });

    const result = br.operation0(
      node,
      vendorReferenceType,
      brandReferenceType,
      styleReferenceType,
      sizeReferenceType,
      validationConfigFunction,
      validationFunctionBind
    );

    expect(result).toBe(true);
  });

  test('uses java.util.HashMap params when Rhino java bindings are available', () => {
    const previousJava = global.java;
    const paramsState = {};
    global.java = {
      util: {
        HashMap: function () {
          return {
            put: function (key, value) {
              paramsState[key] = value;
            }
          };
        }
      }
    };

    const node = makeNode('StyleVariant', { product_name: 'Dress' }, null, {});
    const configFn = { evaluate: () => '{}' };
    const validationFn = {
      evaluate: (params) => {
        expect(typeof params.put).toBe('function');
        expect(paramsState.node).toBe(node);
        expect(paramsState.configJson).toBe('{}');
        return JSON.stringify({ isValid: false, errors: ['A', 'B'] });
      }
    };

    expect(br.operation0(
      node,
      vendorReferenceType,
      brandReferenceType,
      styleReferenceType,
      sizeReferenceType,
      configFn,
      validationFn
    )).toBe('A\nB');

    global.java = previousJava;
  });
});
