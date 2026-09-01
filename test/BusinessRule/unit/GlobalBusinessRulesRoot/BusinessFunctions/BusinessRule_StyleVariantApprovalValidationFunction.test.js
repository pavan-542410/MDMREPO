'use strict';

const br = require('../../../../../step-configs/BusinessRule/BusinessRule_StyleVariantApprovalValidationFunction');
const validationConfig = require('../../../../../step-configs/BusinessRule/BusinessRule_StyleVariantApprovalValidationConfig');

function makeNode(objectTypeID, values, parent, refsByType) {
  const attrNames = {
    product_name: 'Product Name',
    is_exclusive: 'Is Exclusive',
    status: 'Status',
    is_not_sendable_to_petite: 'Is Not Sendable To Petite'
  };
  return {
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

describe('StyleVariantApprovalValidationFunction', () => {
  const vendorReferenceType = { getID: () => 'ProductToVendorLink' };
  const brandReferenceType = { getID: () => 'ProductToBrandLink' };
  const styleReferenceType = { getID: () => 'StyleVariantToStyleLink' };
  const sizeReferenceType = { getID: () => 'SKUToSizeSchemaLink' };
  const configJson = validationConfig.operation0();

  test('returns valid result payload when node passes validation', () => {
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
      is_not_sendable_to_plus: 'false'
    }, colorway, {
      StyleVariantToStyleLink: ['STYLE_1'],
      SKUToSizeSchemaLink: ['SIZE_1']
    });

    expect(JSON.parse(br.operation0(
      vendorReferenceType,
      brandReferenceType,
      styleReferenceType,
      sizeReferenceType,
      node,
      configJson
    ))).toEqual({
      isValid: true,
      errors: []
    });
  });

  test('accepts uppercase boolean values without breaking lowercase payloads', () => {
    const product = makeNode('ProductNode', {}, null, {
      ProductToVendorLink: ['VENDOR_1'],
      ProductToBrandLink: ['BRAND_1']
    });
    const node = makeNode('StyleVariant', {
      product_name: 'Dress',
      is_exclusive: 'TRUE',
      is_fix_eligible: 'FALSE',
      status: 'Active',
      is_shop_eligible: 'true',
      is_not_sendable_to_petite: 'false',
      is_do_not_ship: 'FALSE',
      is_extras_eligible: 'TRUE',
      is_not_sendable_to_plus: 'false'
    }, product, {
      StyleVariantToStyleLink: ['STYLE_1'],
      SKUToSizeSchemaLink: ['SIZE_1']
    });

    expect(JSON.parse(br.operation0(
      vendorReferenceType,
      brandReferenceType,
      styleReferenceType,
      sizeReferenceType,
      node,
      configJson
    ))).toEqual({
      isValid: true,
      errors: []
    });
  });

  test('returns error payload when node fails validation', () => {
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

    const result = JSON.parse(br.operation0(
      vendorReferenceType,
      brandReferenceType,
      styleReferenceType,
      sizeReferenceType,
      node,
      configJson
    ));

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'Missing required attribute: Product Name',
      'Invalid boolean attribute: Is Exclusive must be TRUE or FALSE.',
      'Missing or invalid required reference: Vendor',
      'Missing or invalid required reference: Style'
    ]));
  });

  test('accepts config objects, skips excluded attributes, and uses direct node references when available', () => {
    const node = makeNode('StyleVariant', {
      skip_me: '',
      bool_flag: 'false'
    }, null, {
      ProductToVendorLink: ['VENDOR_DIRECT']
    });

    const result = JSON.parse(br.operation0(
      vendorReferenceType,
      brandReferenceType,
      styleReferenceType,
      sizeReferenceType,
      node,
      {
        requiredAttributes: ['skip_me', 'bool_flag'],
        booleanAttributes: ['bool_flag'],
        excludedAttributes: ['skip_me'],
        requiredReferences: [{
          linkTypeId: 'ProductToVendorLink',
          label: 'Vendor',
          sourceResolver: 'self_or_product_parent'
        }]
      }
    ));

    expect(result).toEqual({
      isValid: true,
      errors: []
    });
  });

  test('returns missing binding errors and falls back to attr IDs when metadata lookup fails', () => {
    const node = {
      getValue: () => ({ getSimpleValue: () => '' }),
      getManager: () => {
        throw new Error('metadata unavailable');
      },
      queryClassificationProductLinks: () => null
    };

    const result = JSON.parse(br.operation0(
      null,
      null,
      null,
      null,
      node,
      JSON.stringify({
        requiredAttributes: ['raw_attr'],
        requiredReferences: [{
          linkTypeId: 'ProductToVendorLink',
          label: 'Vendor'
        }]
      })
    ));

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'Missing required attribute: raw_attr',
      'Missing required reference binding: Vendor'
    ]));
  });

  test('supports getTarget links, list size/get adapters, query toArray fallback, and null config', () => {
    const product = {
      getObjectType: () => ({ getID: () => 'ProductNode' }),
      queryClassificationProductLinks: () => ({
        asList: () => ({
          size: () => 1,
          get: () => ({ getTarget: () => ({ getID: () => 'VENDOR_1' }) })
        })
      }),
      getValue: () => ({ getSimpleValue: () => null })
    };
    const styleNode = {
      getParent: () => product,
      queryClassificationProductLinks: (linkType) => {
        if (linkType.getID() === 'StyleVariantToStyleLink') {
          return {
            toArray: () => [{ getTarget: () => ({ getID: () => 'STYLE_1' }) }]
          };
        }
        return {
          forEach: (callback) => {
            callback({ getTarget: () => ({ getID: () => 'SIZE_1' }) });
          }
        };
      },
      getValue: () => ({ getSimpleValue: () => 'value' })
    };

    expect(JSON.parse(br.operation0(
      vendorReferenceType,
      brandReferenceType,
      styleReferenceType,
      sizeReferenceType,
      styleNode,
      null
    ))).toEqual({
      isValid: true,
      errors: []
    });

    const result = JSON.parse(br.operation0(
      vendorReferenceType,
      brandReferenceType,
      styleReferenceType,
      sizeReferenceType,
      styleNode,
      {
        requiredReferences: [
          {
            linkTypeId: 'ProductToVendorLink',
            label: 'Vendor',
            sourceResolver: 'self_or_product_parent'
          },
          {
            linkTypeId: 'StyleVariantToStyleLink',
            label: 'Style'
          },
          {
            linkTypeId: 'SKUToSizeSchemaLink',
            label: 'Size'
          }
        ]
      }
    ));

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
