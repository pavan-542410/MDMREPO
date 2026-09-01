const businessRuleModule = require('../../../../../step-configs/BusinessRule/BusinessRule_SVAssetSyncHandler');

test('delegates to HandleStyleVariantAssets', () => {
  global.logger = { info: jest.fn() };
  const node = { getID: () => 'SV_1' };
  const handleStyleVariantAssets = { execute: jest.fn() };

  businessRuleModule.operation0(node, handleStyleVariantAssets);

  expect(handleStyleVariantAssets.execute).toHaveBeenCalledWith(node);
  delete global.logger;
});

test('rethrows errors from HandleStyleVariantAssets', () => {
  global.logger = { info: jest.fn() };
  const node = { getID: () => 'SV_2' };
  const handleStyleVariantAssets = {
    execute: () => {
      throw new Error('delegate failure');
    }
  };

  expect(() => businessRuleModule.operation0(node, handleStyleVariantAssets))
    .toThrow('delegate failure');
  delete global.logger;
});
