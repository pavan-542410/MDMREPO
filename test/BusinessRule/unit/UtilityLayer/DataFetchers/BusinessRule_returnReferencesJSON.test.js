const businessRuleModule = require('../../../../../step-configs/BusinessRule/BusinessRule_returnReferencesJSON');

function arrCollection(arr) {
  return {
    size: () => arr.length,
    toArray: () => arr
  };
}

function val(attrID, simpleValue) {
  return {
    getAttribute: () => ({ getID: () => attrID }),
    getSimpleValue: () => simpleValue
  };
}

test('returns references with metadata and supports ref type blacklist', () => {
  const keptRefType = { getID: () => 'RefTypeKeep' };
  const skippedRefType = { getID: () => 'RefTypeSkip' };

  const manager = {
    getReferenceTypeHome: () => ({
      getProductReferenceTypes: () => arrCollection([keptRefType]),
      getAssetReferenceTypes: () => arrCollection([]),
      getClassificationReferenceTypes: () => arrCollection([skippedRefType]),
      getEntityReferenceTypes: () => arrCollection([])
    })
  };

  const obj = {
    queryReferences: (refType) => ({
      asList: (_limit) => {
        if (refType.getID() === 'RefTypeKeep') {
          return arrCollection([
            {
              getTarget: () => ({ getID: () => 'TARGET_1' }),
              getValues: () => arrCollection([val('meta_a', 'A'), val('meta_empty', '')])
            },
            {
              getTarget: () => null,
              getValues: () => arrCollection([])
            }
          ]);
        }
        return arrCollection([
          {
            getTarget: () => ({ getID: () => 'TARGET_2' }),
            getValues: () => arrCollection([])
          }
        ]);
      }
    })
  };

  const parsed = JSON.parse(businessRuleModule.operation0(manager, obj, ['RefTypeSkip']));

  expect(parsed).toEqual([
    {
      refTypeID: 'RefTypeKeep',
      refTarget: 'TARGET_1',
      refMetaData: [{ attrID: 'meta_a', sValue: 'A' }]
    }
  ]);
});
