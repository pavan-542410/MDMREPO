const isFabricContent100 = require('../../../../../step-configs/BusinessRule/BusinessRule_isFabricContent100');

class MetricBusinessFunctionResultMock {
  constructor() {
    this.score = null;
  }

  withScore(score) {
    this.score = score;
    return this;
  }
}

function createIterator(items) {
  let index = 0;

  return {
    hasNext: jest.fn(() => index < items.length),
    next: jest.fn(() => items[index++]),
  };
}

function createMaterialRef(materialType, materialPct) {
  return {
    getValue: jest.fn((attrID) => ({
      getSimpleValue: jest.fn(() => (attrID === 'material_type' ? materialType : materialPct)),
    })),
  };
}

describe('BusinessRule_isFabricContent100', () => {
  beforeEach(() => {
    global.com = {
      stibo: {
        completenessscore: {
          domain: {
            metricresult: {
              MetricBusinessFunctionResult: MetricBusinessFunctionResultMock,
            },
          },
        },
      },
    };
  });

  afterEach(() => {
    delete global.com;
  });

  test('returns full score for apparel samples with complete material percentages, quantity, and SV reference', () => {
    const styleVariant = {
      getID: jest.fn(() => 'SV_1'),
    };
    const node = {
      queryReferences: jest.fn((refType) => ({
        asList: jest.fn(() => {
          if (refType === 'sampleRef') {
            return {
              toArray: jest.fn(() => [{ getTarget: jest.fn(() => styleVariant) }]),
            };
          }

          return {
            size: jest.fn(() => 2),
            forEach: jest.fn((callback) => {
              [
                createMaterialRef('Shell', '60 %'),
                createMaterialRef('Shell', '40 %'),
              ].forEach(callback);
            }),
          };
        }),
      })),
      getManager: jest.fn(() => ({
        getReferenceTypeHome: jest.fn(() => ({
          getReferenceTypeByID: jest.fn(() => 'sampleToMaterialRefType'),
        })),
      })),
      getValue: jest.fn((attrID) => ({
        getSimpleValue: jest.fn(() => ({
          Quantity: '12',
          material_1: '100 %',
        }[attrID] || null)),
      })),
    };
    const result = isFabricContent100.operation0(
      {
        getAttributes: jest.fn(() => ({
          iterator: jest.fn(() => createIterator([
            { getID: jest.fn(() => 'material_1') },
          ])),
        })),
      },
      {},
      { getID: jest.fn(() => 'Quantity') },
      'sampleRef',
      {
        evaluate: jest.fn(() => ({
          getID: jest.fn(() => 'SFMPH_DIV_102678'),
        })),
      },
      node
    );

    expect(result.score).toBe(100);
  });

  test('returns zero when there is no style variant reference and defaults fabrication score for non-apparel', () => {
    const noRefResult = isFabricContent100.operation0(
      {
        getAttributes: jest.fn(),
      },
      {},
      { getID: jest.fn(() => 'Quantity') },
      'sampleRef',
      {
        evaluate: jest.fn(),
      },
      {
        queryReferences: jest.fn(() => ({
          asList: jest.fn(() => ({
            toArray: jest.fn(() => []),
          })),
        })),
      }
    );
    expect(noRefResult.score).toBe(0);

    const nonApparelResult = isFabricContent100.operation0(
      {
        getAttributes: jest.fn(),
      },
      {},
      { getID: jest.fn(() => 'Quantity') },
      'sampleRef',
      {
        evaluate: jest.fn(() => ({
          getID: jest.fn(() => 'OTHER_DIV'),
        })),
      },
      {
        queryReferences: jest.fn(() => ({
          asList: jest.fn(() => ({
            toArray: jest.fn(() => [{ getTarget: jest.fn(() => ({ getID: jest.fn(() => 'SV_2') })) }]),
          })),
        })),
        getValue: jest.fn(() => ({
          getSimpleValue: jest.fn(() => null),
        })),
      }
    );

    expect(nonApparelResult.score).toBe(75);
  });
});
