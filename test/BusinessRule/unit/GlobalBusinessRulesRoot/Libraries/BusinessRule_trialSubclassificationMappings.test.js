const mappings = require('../../../../../step-configs/BusinessRule/BusinessRule_trialSubclassificationMappings');

function findMappingByValue(mappingList, attributeID, valueToSet) {
  return mappingList.find((mapping) => {
    return Array.isArray(mapping.attributesToSet) && mapping.attributesToSet.some((attribute) => {
      return attribute.attributeID === attributeID && attribute.valueToSet === valueToSet;
    });
  });
}

describe('BusinessRule_trialSubclassificationMappings', () => {
  test('getAdvancedMappings returns hoodies and jogger mapping rules with expected structure', () => {
    const advancedMappings = mappings.getAdvancedMappings();

    expect(Array.isArray(advancedMappings)).toBe(true);
    expect(advancedMappings.length).toBeGreaterThan(0);
    expect(advancedMappings[0]).toEqual({
      attributesToCheck: {
        subclassification: 'jogger'
      },
      attributesToSet: [
        { attributeID: 'trial_subclassification', valueToSet: 'jogger' }
      ]
    });

    const hoodieMapping = findMappingByValue(
      advancedMappings,
      'trial_subclassification',
      'Hoodies'
    );

    expect(hoodieMapping).toBeDefined();
    expect(hoodieMapping.parentToSet).toBe('Sweatshirts');
    expect(hoodieMapping.attributesToCheck.hood).toBe('Attached');
  });

  test('getClassAndSiloMappings returns class-specific trial subclassification rules', () => {
    const classAndSiloMappings = mappings.getClassAndSiloMappings();

    expect(Array.isArray(classAndSiloMappings)).toBe(true);
    expect(classAndSiloMappings.length).toBeGreaterThan(0);

    const loungewearMapping = findMappingByValue(
      classAndSiloMappings,
      'trial_subclassification',
      'Loungewear Top'
    );

    expect(loungewearMapping).toBeDefined();
    expect(loungewearMapping.validClass).toBe('IT_CLS_200');
    expect(loungewearMapping.attributesToCheck).toEqual({
      silhouette: '1_4_btn_zip_layering'
    });
  });

  test('getKeywordMappings returns keyword-driven mappings for accessories and footwear', () => {
    const keywordMappings = mappings.getKeywordMappings();

    expect(Array.isArray(keywordMappings)).toBe(true);
    expect(keywordMappings.length).toBeGreaterThan(0);

    expect(keywordMappings).toEqual(expect.arrayContaining([
      {
        keywordToCheck: 'weekender bag',
        attributesToSet: [
          {
            attributeID: 'trial_subclassification',
            valueToSet: 'Weekender Bags'
          }
        ]
      },
      {
        keywordToCheck: 'chukka boot',
        attributesToSet: [
          {
            attributeID: 'trial_subclassification',
            valueToSet: 'Chukka Boots'
          }
        ]
      }
    ]));
  });
});
