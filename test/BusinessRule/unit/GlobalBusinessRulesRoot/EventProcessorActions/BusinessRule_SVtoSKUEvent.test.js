const svToSkuEvent = require('../../../../../step-configs/BusinessRule/BusinessRule_SVtoSKUEvent');

function createValueStore(valuesByID) {
  const wrappers = {};

  return jest.fn((attrID) => {
    if (!wrappers[attrID]) {
      wrappers[attrID] = {
        getSimpleValue: jest.fn(() => valuesByID[attrID] || null),
        setSimpleValue: jest.fn((value) => {
          valuesByID[attrID] = value;
        }),
        replace: jest.fn(() => ({
          addValue: jest.fn(),
          apply: jest.fn(),
        })),
      };
    }

    return wrappers[attrID];
  });
}

function createNode(id, objectTypeID, valuesByID, children) {
  return {
    getID: jest.fn(() => id),
    toString: jest.fn(() => id),
    getParent: jest.fn(() => null),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => objectTypeID),
    })),
    getValue: createValueStore(valuesByID),
    getChildren: jest.fn(() => ({
      size: jest.fn(() => (children || []).length),
      get: jest.fn((index) => children[index]),
      iterator: jest.fn(() => {
        let index = 0;
        return {
          hasNext: jest.fn(() => index < (children || []).length),
          next: jest.fn(() => children[index++]),
        };
      }),
    })),
    __values: valuesByID,
  };
}

describe('BusinessRule_SVtoSKUEvent', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-04-05T06:07:08.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('queues derived events for SKU children and sets first_active_at for active SVs', () => {
    const sku = createNode('SKU_1', 'SKUNode', {}, []);
    const nonSku = createNode('CW_1', 'ColorwayVariantNode', {}, []);
    const sv = createNode('SV_1', 'StyleVariant', {
      first_active_at: null,
      status: 'Active',
    }, [sku, nonSku]);
    const batch = {
      getEvents: jest.fn(() => ({
        size: jest.fn(() => 1),
        get: jest.fn(() => ({
          getNode: jest.fn(() => sv),
        })),
      })),
    };
    const cnsQueue = {
      queueDerivedEvent: jest.fn(),
    };
    const byQueue = {
      republish: jest.fn(),
    };
    const eventType = { id: 'SVStatusUpdate' };

    svToSkuEvent.operation0(sv, cnsQueue, byQueue, batch, eventType);

    expect(sv.__values.first_active_at).toBe('2024-04-05 06:07:08');
    expect(cnsQueue.queueDerivedEvent).toHaveBeenCalledWith(eventType, sku);
    expect(byQueue.republish).toHaveBeenCalledWith(sku);
    expect(cnsQueue.queueDerivedEvent).not.toHaveBeenCalledWith(eventType, nonSku);
  });

  test('does not overwrite existing first_active_at when status is not Active', () => {
    const sku = createNode('SKU_2', 'SKUNode', {}, []);
    const sv = createNode('SV_2', 'StyleVariant', {
      first_active_at: '2023-01-01 00:00:00',
      status: 'Hold',
    }, [sku]);
    const batch = {
      getEvents: jest.fn(() => ({
        size: jest.fn(() => 1),
        get: jest.fn(() => ({
          getNode: jest.fn(() => sv),
        })),
      })),
    };

    svToSkuEvent.operation0(sv, {
      queueDerivedEvent: jest.fn(),
    }, {
      republish: jest.fn(),
    }, batch, {});

    expect(sv.__values.first_active_at).toBe('2023-01-01 00:00:00');
  });
});
