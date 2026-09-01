const br = require('../../../../../step-configs/BusinessRule/BusinessRule_StatusUpdateHandler');

function makeIterator(items) {
  let idx = 0;
  return {
    hasNext: () => idx < items.length,
    next: () => items[idx++]
  };
}

function makeEvent(node) {
  return { getNode: () => node };
}

function makeSV(id) {
  return {
    getID: () => id,
    getObjectType: () => ({ getID: () => 'StyleVariant' })
  };
}

function makeColorway(id, children) {
  return {
    getID: () => id,
    getObjectType: () => ({ getID: () => 'ColorwayVariantNode' }),
    getChildren: () => ({ toArray: () => children })
  };
}

describe('StatusUpdateHandler', () => {
  test('deduplicates StyleVariants across direct and Colorway events', () => {
    const sv1 = makeSV('SV_1');
    const sv2 = makeSV('SV_2');
    const colorway = makeColorway('CW_1', [sv1, sv2, sv1]);
    const batch = {
      getEvents: () => ({
        iterator: () => makeIterator([makeEvent(colorway), makeEvent(sv1), makeEvent(sv2)])
      })
    };
    const calculateStatus = { execute: jest.fn() };

    br.operation0(batch, calculateStatus);

    expect(calculateStatus.execute).toHaveBeenCalledTimes(2);
    expect(calculateStatus.execute).toHaveBeenCalledWith(sv1);
    expect(calculateStatus.execute).toHaveBeenCalledWith(sv2);
  });
});
