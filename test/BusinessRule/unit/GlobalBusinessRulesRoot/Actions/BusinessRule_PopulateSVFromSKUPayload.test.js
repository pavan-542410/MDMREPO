const populateSVFromSKUPayload = require('../../../../../step-configs/BusinessRule/BusinessRule_PopulateSVFromSKUPayload');

class ValuePartObjectMock {
  constructor(attributeID) {
    this.attributeID = attributeID;
  }

  getAttributeID() {
    return this.attributeID;
  }
}

function createIterator(items) {
  let index = 0;

  return {
    hasNext: jest.fn(() => index < items.length),
    next: jest.fn(() => items[index++]),
  };
}

function createValueStore(valuesByID) {
  const wrappers = {};

  return jest.fn((attrID) => {
    if (!wrappers[attrID]) {
      wrappers[attrID] = {
        getSimpleValue: jest.fn(() => (Object.prototype.hasOwnProperty.call(valuesByID, attrID) ? valuesByID[attrID] : null)),
        setSimpleValue: jest.fn((value) => {
          valuesByID[attrID] = value;
        }),
      };
    }

    return wrappers[attrID];
  });
}

function createSku(sourceNode) {
  return {
    getID: jest.fn(() => 'SKU_1'),
    getReferencedBy: jest.fn(() => ({
      iterator: jest.fn(() => createIterator(sourceNode ? [{
        getSource: jest.fn(() => sourceNode),
      }] : [])),
    })),
  };
}

function createSv(valuesByID, children, partObjects) {
  return {
    getID: jest.fn(() => 'SV_1'),
    getChildren: jest.fn(() => ({
      iterator: jest.fn(() => createIterator(children || [])),
    })),
    getValue: createValueStore(valuesByID),
    getNonApprovedObjects: jest.fn(() => ({
      iterator: jest.fn(() => createIterator(partObjects || [])),
    })),
    approve: jest.fn(),
    __values: valuesByID,
  };
}

describe('BusinessRule_PopulateSVFromSKUPayload', () => {
  beforeEach(() => {
    global.java = {
      util: {
        HashSet: function HashSet() {
          const values = [];
          return {
            add: jest.fn((value) => values.push(value)),
            isEmpty: jest.fn(() => values.length === 0),
          };
        },
      },
    };
    global.com = {
      stibo: {
        core: {
          domain: {
            partobject: {
              ValuePartObject: ValuePartObjectMock,
            },
            approve: {
              ApproveBulkValidationException: function ApproveBulkValidationException() {},
            },
            synchronize: {
              exception: {
                SynchronizeException: function SynchronizeException() {},
              },
            },
          },
        },
      },
    };
    global.log = {
      info: jest.fn(),
      warning: jest.fn(),
    };
  });

  afterEach(() => {
    delete global.java;
    delete global.com;
    delete global.log;
  });

  test('writes changed SV attributes from sku_payload and partially approves matching part objects', () => {
    const inboundContainer = {
      getID: jest.fn(() => 'MC_1'),
      getValue: jest.fn(() => ({
        getSimpleValue: jest.fn(() => JSON.stringify({
          cost: 10,
          estimated_price: 50,
        })),
      })),
    };
    const sv = createSv({
      cost: '5',
      estimated_price: '50',
    }, [createSku(inboundContainer)], [new ValuePartObjectMock('cost')]);
    const w = {
      writeSimpleValue: jest.fn((node, attrID, value) => {
        node.__values[attrID] = value;
      }),
    };

    populateSVFromSKUPayload.operation0(sv, w);

    expect(w.writeSimpleValue).toHaveBeenCalledWith(sv, 'cost', '10');
    expect(w.writeSimpleValue).not.toHaveBeenCalledWith(sv, 'estimated_price', '50');
    expect(sv.approve).toHaveBeenCalledTimes(1);
    expect(global.log.info).toHaveBeenCalledWith(
      "PopulateSVFromSKUPayload: set 'cost' = '10' on SV SV_1"
    );
  });

  test('returns early when SKU/container/payload are missing or malformed', () => {
    const w = {
      writeSimpleValue: jest.fn(),
    };

    populateSVFromSKUPayload.operation0(createSv({}, [], []), w);
    expect(global.log.info).toHaveBeenCalledWith(
      'PopulateSVFromSKUPayload: no SKU child found for SV SV_1, skipping.'
    );

    populateSVFromSKUPayload.operation0(createSv({}, [createSku(null)], []), w);
    expect(global.log.info).toHaveBeenCalledWith(
      'PopulateSVFromSKUPayload: no incoming PayloadToSKUReference found on SKU SKU_1, skipping.'
    );

    populateSVFromSKUPayload.operation0(createSv({}, [createSku({
      getID: jest.fn(() => 'MC_2'),
      getValue: jest.fn(() => ({
        getSimpleValue: jest.fn(() => '   '),
      })),
    })], []), w);
    expect(global.log.info).toHaveBeenCalledWith(
      'PopulateSVFromSKUPayload: sku_payload is blank on container MC_2 for SKU SKU_1, skipping.'
    );

    populateSVFromSKUPayload.operation0(createSv({}, [createSku({
      getID: jest.fn(() => 'MC_3'),
      getValue: jest.fn(() => ({
        getSimpleValue: jest.fn(() => '{bad-json'),
      })),
    })], []), w);
    expect(global.log.info).toHaveBeenCalledWith(
      expect.stringContaining('PopulateSVFromSKUPayload: failed to parse sku_payload for SKU SKU_1')
    );
  });
});
