const hasStitchFixID = require('../../../../../step-configs/BusinessRule/BusinessRule_hasStitchFixID');

function createNode({ id, objectTypeID, values }) {
  return {
    getID: jest.fn(() => id),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => objectTypeID),
    })),
    getValue: jest.fn((attrID) => ({
      getSimpleValue: jest.fn(() => (values && values[attrID]) || ''),
    })),
  };
}

describe('BusinessRule_hasStitchFixID', () => {
  test('returns true when mapped enterprise-key attribute is present', () => {
    const node = createNode({
      id: 'SV_123',
      objectTypeID: 'StyleVariant',
      values: { ft_data_model_style_variant_id: '123' },
    });

    expect(hasStitchFixID.operation0(node)).toBe(true);
  });

  test('accepts StyleVariant IDs with UUID patterns when enterprise-key attribute is blank', () => {
    const svPrefixedUUID = createNode({
      id: 'SV_11111111-2222-3333-4444-555555555555',
      objectTypeID: 'StyleVariant',
      values: { ft_data_model_style_variant_id: '' },
    });
    const svBareUUID = createNode({
      id: '11111111-2222-3333-4444-555555555555',
      objectTypeID: 'StyleVariantNode',
      values: { ft_data_model_style_variant_id: '' },
    });

    expect(hasStitchFixID.operation0(svPrefixedUUID)).toBe(true);
    expect(hasStitchFixID.operation0(svBareUUID)).toBe(true);
  });

  test('returns failure message when no enterprise key can be derived', () => {
    const node = createNode({
      id: 'SV_invalid',
      objectTypeID: 'StyleVariant',
      values: { ft_data_model_style_variant_id: '' },
    });

    expect(hasStitchFixID.operation0(node)).toBe('Enterprise key not found on node SV_invalid');
  });
});
