const br = require('../../../../../step-configs/BusinessRule/BusinessRule_BYMessageHandler');

describe('BYMessageHandler (integration)', () => {
  function makeNode(values) {
    return {
      getValue: (attrID) => ({
        getSimpleValue: () => values[attrID]
      })
    };
  }

  test('writes expected outbound message for BlueYonder flow', () => {
    const node = makeNode({
      sku_id: 'SKU_555',
      product_name: 'null',
      description: 'Fallback description'
    });
    const nodeHandlerSource = { getNode: () => node };
    const nodeHandlerResult = { addMessage: jest.fn() };
    const DatadogQueue = { queueDerivedEvent: jest.fn() };
    const logger = { info: jest.fn() };

    br.operation0({}, logger, nodeHandlerSource, nodeHandlerResult, DatadogQueue, { id: 'DatadogTriggerEvent' });

    expect(DatadogQueue.queueDerivedEvent).toHaveBeenCalledTimes(1);
    expect(nodeHandlerResult.addMessage).toHaveBeenCalledTimes(1);

    const payload = JSON.parse(nodeHandlerResult.addMessage.mock.calls[0][1]);
    expect(payload.topic).toBe('product');
    expect(payload.operation).toBe('CREATE');
    expect(payload.value.productId).toBe('SKU_555');
    // Assert current behavior: description object is not persisted into payload.value.
    expect(payload.value.description).toBeUndefined();
  });
});
