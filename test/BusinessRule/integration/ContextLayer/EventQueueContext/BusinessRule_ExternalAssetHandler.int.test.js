const businessRuleModule = require('../../../../../step-configs/BusinessRule/BusinessRule_ExternalAssetHandler');

test('queues impacted StyleVariant for ExternalAsset nodes', () => {
  global.logger = { info: jest.fn() };
  const ea = {
    getObjectType: () => ({ getID: () => 'ExternalAsset' }),
    getID: () => 'EA_1',
    getValue: (attrID) => ({
      getSimpleValue: () => (attrID === 'style_variant_id' ? '123' : '')
    })
  };
  const sv = { getID: () => 'SV_123' };
  const step = {
    getProductHome: () => ({
      getProductByID: (id) => (id === 'SV_123' ? sv : null)
    })
  };
  const svAssetBatchQueue = { queueDerivedEvent: jest.fn() };
  const svAssetSyncEvent = { id: 'StyleVariantAssetSyncEvent' };

  businessRuleModule.operation0(
    ea,
    step,
    svAssetBatchQueue,
    svAssetSyncEvent
  );

  expect(svAssetBatchQueue.queueDerivedEvent).toHaveBeenCalledTimes(1);
  expect(svAssetBatchQueue.queueDerivedEvent).toHaveBeenCalledWith(svAssetSyncEvent, sv);
  delete global.logger;
});

test('no-ops for unsupported object types', () => {
  global.logger = { info: jest.fn() };
  const node = {
    getObjectType: () => ({ getID: () => 'StyleVariant' }),
    getID: () => 'SV_100',
    getValue: () => ({ getSimpleValue: () => '100' })
  };
  const step = { getProductHome: () => ({ getProductByID: () => null }) };
  const svAssetBatchQueue = { queueDerivedEvent: jest.fn() };
  const svAssetSyncEvent = { id: 'StyleVariantAssetSyncEvent' };

  businessRuleModule.operation0(
    node,
    step,
    svAssetBatchQueue,
    svAssetSyncEvent
  );

  expect(svAssetBatchQueue.queueDerivedEvent).not.toHaveBeenCalled();
  delete global.logger;
});

test('no-ops when style_variant_id resolves to no StyleVariant', () => {
  global.logger = { info: jest.fn() };
  const ea = {
    getObjectType: () => ({ getID: () => 'ExternalAsset' }),
    getID: () => 'EA_2',
    getValue: () => ({ getSimpleValue: () => '999' })
  };
  const step = {
    getProductHome: () => ({
      getProductByID: () => null
    })
  };
  const svAssetBatchQueue = { queueDerivedEvent: jest.fn() };

  businessRuleModule.operation0(
    ea,
    step,
    svAssetBatchQueue,
    { id: 'StyleVariantAssetSyncEvent' }
  );

  expect(svAssetBatchQueue.queueDerivedEvent).not.toHaveBeenCalled();
  delete global.logger;
});

test('rethrows queue failures', () => {
  global.logger = { info: jest.fn() };
  const ea = {
    getObjectType: () => ({ getID: () => 'ExternalAsset' }),
    getID: () => 'EA_3',
    getValue: () => ({ getSimpleValue: () => '123' })
  };
  const sv = { getID: () => 'SV_123' };
  const step = {
    getProductHome: () => ({
      getProductByID: () => sv
    })
  };
  const svAssetBatchQueue = {
    queueDerivedEvent: () => {
      throw new Error('queue error');
    }
  };

  expect(() => businessRuleModule.operation0(
    ea,
    step,
    svAssetBatchQueue,
    { id: 'StyleVariantAssetSyncEvent' }
  )).toThrow('queue error');
  delete global.logger;
});
