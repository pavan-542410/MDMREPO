const br = require('../../../../../step-configs/BusinessRule/BusinessRule_BYMessageHandler');

describe('BYMessageHandler', () => {
  function makeNode(values) {
    return {
      getValue: (attrID) => ({
        getSimpleValue: () => values[attrID]
      })
    };
  }

  test('queues Datadog event and publishes current payload shape', () => {
    const node = makeNode({
      sku_id: 'SKU_100',
      product_name: 'Blue Sweater',
      description: 'Long description'
    });
    const nodeHandlerSource = { getNode: () => node };
    const nodeHandlerResult = { addMessage: jest.fn() };
    const DatadogQueue = { queueDerivedEvent: jest.fn() };
    const logger = { info: jest.fn() };
    const DatadogEvent = { id: 'DatadogTriggerEvent' };

    br.operation0({}, logger, nodeHandlerSource, nodeHandlerResult, DatadogQueue, DatadogEvent);

    expect(DatadogQueue.queueDerivedEvent).toHaveBeenCalledWith(DatadogEvent, node);
    expect(nodeHandlerResult.addMessage).toHaveBeenCalledTimes(1);
    expect(nodeHandlerResult.addMessage).toHaveBeenCalledWith('update', expect.any(String));

    const payload = JSON.parse(nodeHandlerResult.addMessage.mock.calls[0][1]);
    expect(payload.key.productId).toBe('SKU_100');
    expect(payload.value.productId).toBe('SKU_100');
    // Assert current behavior: description object is computed but not attached.
    expect(payload.value.description).toBeUndefined();
  });
});
