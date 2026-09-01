const br = require('../../../../../step-configs/BusinessRule/BusinessRule_returnHangtagJSON');

function createValueHolder(value) {
  return {
    getSimpleValue: jest.fn(() => value),
  };
}

function createNode(id, objectTypeID, values) {
  return {
    getID: jest.fn(() => id),
    getName: jest.fn(() => `${id}-Name`),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => objectTypeID),
    })),
    getValue: jest.fn((attrID) => createValueHolder((values || {})[attrID])),
    getManager: jest.fn(() => ({
      getReferenceTypeHome: jest.fn(() => ({
        getReferenceTypeByID: jest.fn(() => ({ getID: jest.fn(() => 'SampleToStyleVariant') })),
      })),
    })),
    queryReferences: jest.fn(() => ({
      asList: jest.fn(() => ({
        toArray: jest.fn(() => []),
      })),
    })),
    queryReferencedBy: jest.fn(() => ({
      forEach: jest.fn(),
    })),
    queryClassificationProductLinks: jest.fn(() => ({
      asList: jest.fn(() => ({
        get: jest.fn(() => ({
          getClassification: jest.fn(() => ({
            getName: jest.fn(() => 'Acme'),
          })),
        })),
      })),
    })),
  };
}

describe('BusinessRule_returnHangtagJSON', () => {
  it('builds hangtag JSON directly from a StyleVariant node and caps aggregated sample quantity at 2', () => {
    const styleVariant = createNode('SV_12345', 'StyleVariant', {
      first_expected_inventory_date: '2026-04-03',
      is_plus: 'true',
      is_petite: 'false',
      'studio_check-in_user_email': '',
    });
    const sampleOne = createNode('SAMPLE_1', 'Sample', { Quantity: '2' });
    const sampleTwo = createNode('SAMPLE_2', 'Sample', { Quantity: '3' });
    styleVariant.queryReferencedBy = jest.fn(() => ({
      forEach: jest.fn((callback) => {
        callback({ getSource: jest.fn(() => sampleOne) });
        callback({ getSource: jest.fn(() => sampleTwo) });
      }),
    }));

    const sku = createNode('SKU_1', 'SKUNode', {
      product_name: 'the best tee',
      brand_sku: 'SKU-1',
      brand_color: 'blue',
      item_type_division_name: 'Women',
      silhouette: 'Slim',
      age_intent: 'Adult',
      gender_intent: 'Women',
      inseam_inches: '28',
      is_maternity: 'false',
      merch_end_use: 'Casual',
      primary_client_focus: 'EVERYDAY',
      sample_notes: 'Handle with care',
    });

    const result = JSON.parse(br.operation0(
      {
        getCurrentUser: jest.fn(() => ({
          getID: jest.fn(() => 'user@stitchfix.com'),
        })),
      },
      { getID: jest.fn(() => 'SampleToStyleVariant') },
      { evaluate: jest.fn(() => sku) },
      { getID: jest.fn(() => 'ProductToBrandLink') },
      { evaluate: jest.fn(() => ({ getName: jest.fn(() => 'Jackets') })) },
      styleVariant,
      true,
      { nowISO: jest.fn(() => '2026-04-03 10:00:00') }
    ));

    expect(result.stibo_id).toBe('SV_12345');
    expect(result.product_name).toBe('the best tee');
    expect(result.brand).toBe('Acme');
    expect(result.classification).toBe('Jackets');
    expect(result.style_variant_id).toBe('12345');
    expect(result.qty).toBe('2');
    expect(result.primary_client_focus).toBe('Everyday');
    expect(result.user_email).toBe('user@stitchfix.com');
    expect(result.return_hangtag).toBe(true);
  });

  it('resolves a StyleVariant from a Sample reference and defaults quantity/date when no sample links exist', () => {
    const styleVariant = createNode('SV_22222', 'StyleVariant', {
      first_expected_inventory_date: 'null',
      is_plus: 'null',
      is_petite: 'null',
      'studio_check-in_user_email': 'stylist@stitchfix.com',
    });
    const sample = createNode('SAMPLE_22', 'Sample', {
      CheckedInDate: 'null',
      Quantity: '7',
    });
    sample.queryReferences = jest.fn(() => ({
      asList: jest.fn(() => ({
        toArray: jest.fn(() => [{
          getTarget: jest.fn(() => styleVariant),
        }]),
      })),
    }));
    styleVariant.queryReferencedBy = jest.fn(() => ({
      forEach: jest.fn(),
    }));

    const result = JSON.parse(br.operation0(
      {
        getCurrentUser: jest.fn(() => ({
          getID: jest.fn(() => 'fallback@stitchfix.com'),
        })),
      },
      { getID: jest.fn(() => 'SampleToStyleVariant') },
      { evaluate: jest.fn(() => createNode('SKU_2', 'SKUNode', {})) },
      { getID: jest.fn(() => 'ProductToBrandLink') },
      { evaluate: jest.fn(() => ({ getName: jest.fn(() => 'Accessories') })) },
      sample,
      false,
      { nowISO: jest.fn(() => '2026-04-03 11:00:00') }
    ));

    expect(result.stibo_id).toBe('SAMPLE_22');
    expect(result.checked_in_at).toBe('2026-04-03 11:00:00');
    expect(result.qty).toBe('1');
    expect(result.user_email).toBe('stylist@stitchfix.com');
    expect(result.return_hangtag).toBe(false);
  });
});
