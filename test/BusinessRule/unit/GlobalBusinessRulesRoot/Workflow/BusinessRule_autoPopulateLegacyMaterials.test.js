const autoPopulateLegacyMaterials = require('../../../../../step-configs/BusinessRule/BusinessRule_autoPopulateLegacyMaterials');

function createLegacySv(primaryMaterial, additionalMaterial) {
  return {
    getValue: jest.fn((attrID) => ({
      getSimpleValue: jest.fn(() => (attrID === 'primary_material'
        ? primaryMaterial
        : additionalMaterial)),
    })),
  };
}

describe('BusinessRule_autoPopulateLegacyMaterials', () => {
  test('sets the most common legacy material combination from matching SVs', () => {
    const valuesByID = {
      primary_material: null,
      additional_material: null,
    };
    const sv = {
      getID: jest.fn(() => 'SV_1'),
      queryReferences: jest.fn(() => ({
        asList: jest.fn(() => ({
          toArray: jest.fn(() => [
            {
              getTarget: jest.fn(() => ({ getID: jest.fn(() => 'MAT_1') })),
              getValue: jest.fn(() => ({
                getSimpleValue: jest.fn(() => '60 %'),
              })),
            },
            {
              getTarget: jest.fn(() => ({ getID: jest.fn(() => 'MAT_2') })),
              getValue: jest.fn(() => ({
                getSimpleValue: jest.fn(() => '40 %'),
              })),
            },
          ]),
        })),
      })),
      getValue: jest.fn((attrID) => ({
        getSimpleValue: jest.fn(() => valuesByID[attrID] || null),
        setSimpleValue: jest.fn((value) => {
          valuesByID[attrID] = value;
        }),
      })),
      __values: valuesByID,
    };

    autoPopulateLegacyMaterials.operation0(
      sv,
      {},
      { info: jest.fn() },
      {},
      {
        evaluate: jest.fn(() => [
          createLegacySv('Cotton', 'Spandex'),
          createLegacySv('Cotton', 'Spandex'),
          createLegacySv('Nylon', null),
        ]),
      }
    );

    expect(sv.__values.primary_material).toBe('Cotton');
    expect(sv.__values.additional_material).toBe('Spandex');
  });

  test('leaves values unchanged when no matching legacy material combination exists', () => {
    const valuesByID = {
      primary_material: 'Existing',
      additional_material: 'Existing Secondary',
    };
    const sv = {
      getID: jest.fn(() => 'SV_2'),
      queryReferences: jest.fn(() => ({
        asList: jest.fn(() => ({
          toArray: jest.fn(() => []),
        })),
      })),
      getValue: jest.fn((attrID) => ({
        getSimpleValue: jest.fn(() => valuesByID[attrID] || null),
        setSimpleValue: jest.fn((value) => {
          valuesByID[attrID] = value;
        }),
      })),
      __values: valuesByID,
    };

    autoPopulateLegacyMaterials.operation0(
      sv,
      {},
      { info: jest.fn() },
      {},
      {
        evaluate: jest.fn(() => []),
      }
    );

    expect(sv.__values.primary_material).toBe('Existing');
    expect(sv.__values.additional_material).toBe('Existing Secondary');
  });
});
