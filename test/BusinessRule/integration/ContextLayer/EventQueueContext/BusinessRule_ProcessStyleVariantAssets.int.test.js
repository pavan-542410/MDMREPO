const businessRuleModule = require('../../../../../step-configs/BusinessRule/BusinessRule_ProcessStyleVariantAssets');

function iteratorFrom(arr) {
  let i = 0;
  return {
    hasNext: () => i < arr.length,
    next: () => arr[i++]
  };
}

test('processes each node once per batch, deduplicating by ID', () => {
  global.logger = { info: jest.fn() };
  const sv1 = { getID: () => 'SV_1', getObjectType: () => ({ getID: () => 'StyleVariant' }) };
  const sv1Dup = { getID: () => 'SV_1', getObjectType: () => ({ getID: () => 'StyleVariant' }) };
  const sv2 = { getID: () => 'SV_2', getObjectType: () => ({ getID: () => 'StyleVariant' }) };
  const ea = { getID: () => 'EA_1', getObjectType: () => ({ getID: () => 'ExternalAsset' }) };

  const batch = {
    getEvents: () => ({
      iterator: () => iteratorFrom([
        { getNode: () => sv1 },
        { getNode: () => sv1Dup },
        { getNode: () => ea },
        { getNode: () => sv2 }
      ])
    })
  };

  const handleStyleVariantAssets = { execute: jest.fn() };

  businessRuleModule.operation0(batch, handleStyleVariantAssets);

  // BR processes all nodes, deduplicates by ID only (no object type filtering)
  expect(handleStyleVariantAssets.execute).toHaveBeenCalledTimes(3);
  expect(handleStyleVariantAssets.execute).toHaveBeenNthCalledWith(1, sv1);
  expect(handleStyleVariantAssets.execute).toHaveBeenNthCalledWith(2, ea);
  expect(handleStyleVariantAssets.execute).toHaveBeenNthCalledWith(3, sv2);
  delete global.logger;
});
