const br = require('../../../../../step-configs/BusinessRule/BusinessRule_SVAssetSyncHandler');

describe('SVAssetSyncHandler', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
  });

  afterEach(() => {
    delete global.logger;
  });

  test('delegates to HandleStyleVariantAssets', () => {
    const node = { getID: () => 'SV_1' };
    const handleStyleVariantAssets = { execute: jest.fn() };

    br.operation0(node, handleStyleVariantAssets);

    expect(handleStyleVariantAssets.execute).toHaveBeenCalledWith(node);
  });

  test('rethrows delegate errors', () => {
    const node = { getID: () => 'SV_1' };
    const handleStyleVariantAssets = {
      execute: () => {
        throw new Error('delegate failed');
      }
    };

    expect(() => br.operation0(node, handleStyleVariantAssets)).toThrow('delegate failed');
  });
});
