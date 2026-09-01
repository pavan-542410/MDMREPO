'use strict';

const br = require('../../../../../step-configs/BusinessRule/BusinessRule_StyleVariantApprovalValidationConfig');

describe('StyleVariantApprovalValidationConfig', () => {
  let result;
  let config;

  beforeEach(() => {
    result = br.operation0();
    config = JSON.parse(result);
  });

  test('returns valid JSON string', () => {
    expect(() => JSON.parse(result)).not.toThrow();
  });

  test('returns a string payload, not a native object', () => {
    expect(typeof result).toBe('string');
  });

  test('exports deterministic config object', () => {
    expect(JSON.parse(br.operation0())).toEqual(config);
  });

  test('contains expected style variant validation rules', () => {
    expect(config.objectType).toBe('StyleVariant');
    expect(config.requiredAttributes).toEqual(expect.arrayContaining([
      'product_name',
      'status',
      'is_exclusive'
    ]));
    expect(config.booleanAttributes).toEqual(expect.arrayContaining([
      'is_exclusive',
      'is_fix_eligible',
      'is_shop_eligible'
    ]));
    expect(config.excludedAttributes).toEqual(expect.arrayContaining([
      'is_petite',
      'is_plus'
    ]));
    expect(config.requiredReferences).toEqual(expect.arrayContaining([
      expect.objectContaining({
        linkTypeId: 'ProductToVendorLink',
        label: 'Vendor',
        sourceResolver: 'self_or_product_parent'
      }),
      expect.objectContaining({
        linkTypeId: 'StyleVariantToStyleLink',
        label: 'Style',
        sourceResolver: 'self'
      })
    ]));
  });
});
