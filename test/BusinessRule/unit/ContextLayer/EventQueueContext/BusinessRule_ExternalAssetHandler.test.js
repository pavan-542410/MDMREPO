const br = require('../../../../../step-configs/BusinessRule/BusinessRule_ExternalAssetHandler');

describe('ExternalAssetHandler', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
  });

  afterEach(() => {
    delete global.logger;
  });

  function makeNode(styleVariantId) {
    return {
      getID: () => 'EA_100',
      getValue: () => ({
        getSimpleValue: () => styleVariantId
      })
    };
  }

  test('queues derived event when matching StyleVariant exists', () => {
    const sv = { getID: () => 'SV_123' };
    const step = {
      getProductHome: () => ({
        getProductByID: jest.fn(() => sv)
      })
    };
    const queue = { queueDerivedEvent: jest.fn() };
    const eventType = { id: 'StyleVariantAssetSyncEvent' };

    br.operation0(makeNode('123'), step, queue, eventType);

    expect(queue.queueDerivedEvent).toHaveBeenCalledWith(eventType, sv);
  });

  test('no-ops when style_variant_id is blank after trim', () => {
    const step = {
      getProductHome: () => ({
        getProductByID: jest.fn()
      })
    };
    const queue = { queueDerivedEvent: jest.fn() };

    br.operation0(makeNode('   '), step, queue, { id: 'StyleVariantAssetSyncEvent' });

    expect(step.getProductHome().getProductByID).not.toHaveBeenCalled();
    expect(queue.queueDerivedEvent).not.toHaveBeenCalled();
  });

  test('rethrows queue errors', () => {
    const sv = { getID: () => 'SV_123' };
    const step = {
      getProductHome: () => ({
        getProductByID: () => sv
      })
    };
    const queue = {
      queueDerivedEvent: () => {
        throw new Error('queue unavailable');
      }
    };

    expect(() => br.operation0(makeNode('123'), step, queue, { id: 'StyleVariantAssetSyncEvent' }))
      .toThrow('queue unavailable');
  });
});
