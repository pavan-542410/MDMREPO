const checkMandatoryAttributesBeforeApprove = require('../../../../../step-configs/BusinessRule/BusinessRule_CheckMandatoryAttributesBeforeApprove');

class ArrayListMock {
  constructor() {
    this.values = [];
  }

  add(value) {
    this.values.push(value);
  }

  isEmpty() {
    return this.values.length === 0;
  }

  toArray() {
    return this.values.slice();
  }
}

class StringBuilderMock {
  constructor() {
    this.parts = [];
  }

  append(value) {
    this.parts.push(value);
  }

  toString() {
    return this.parts.join('');
  }
}

function createIterator(items) {
  let index = 0;

  return {
    hasNext: jest.fn(() => index < items.length),
    next: jest.fn(() => items[index++]),
  };
}

function createAttribute(attributeID, attributeName, validTypeIDs) {
  return {
    getID: jest.fn(() => attributeID),
    getName: jest.fn(() => attributeName),
    getValidForObjectTypes: jest.fn(() => ({
      toArray: jest.fn(() => (validTypeIDs || []).map((typeID) => ({
        getID: jest.fn(() => typeID),
      }))),
    })),
  };
}

function createNode(valuesByID, mandatoryByID, materialRefs, classLinks) {
  return {
    getID: jest.fn(() => 'SV_1'),
    getName: jest.fn(() => 'Style Variant 1'),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => 'StyleVariant'),
    })),
    getValue: jest.fn((attrID) => ({
      getSimpleValue: jest.fn(() => (Object.prototype.hasOwnProperty.call(valuesByID, attrID) ? valuesByID[attrID] : null)),
      isMandatory: jest.fn(() => Boolean(mandatoryByID[attrID])),
    })),
    queryClassificationProductLinks: jest.fn(() => ({
      asList: jest.fn(() => ({
        size: jest.fn(() => (classLinks || []).length),
      })),
    })),
    getReferences: jest.fn(() => ({
      isEmpty: jest.fn(() => !(materialRefs || []).length),
      iterator: jest.fn(() => createIterator(materialRefs || [])),
    })),
  };
}

describe('BusinessRule_CheckMandatoryAttributesBeforeApprove', () => {
  beforeEach(() => {
    global.java = {
      util: {
        ArrayList: ArrayListMock,
      },
      lang: {
        StringBuilder: StringBuilderMock,
      },
    };
    global.com = {
      stibo: {
        core: {
          domain: {
            businessrule: {
              BusinessRuleException: function BusinessRuleException(error) {
                this.error = error;
              },
            },
          },
        },
      },
    };
    global.logger = {
      info: jest.fn(),
      warning: jest.fn(),
      severe: jest.fn(),
    };
  });

  afterEach(() => {
    delete global.java;
    delete global.com;
    delete global.logger;
  });

  test('returns true when mandatory enforcement is disabled', () => {
    expect(checkMandatoryAttributesBeforeApprove.operation0(
      createNode({}, {}, [], [{}]),
      {
        getAllAttributes: jest.fn(),
      },
      {
        getValue: jest.fn(() => ({
          getSimpleValue: jest.fn(() => 'false'),
        })),
      },
      {},
      {},
      null,
      {},
      {},
      {}
    )).toBe(true);
  });

  test('returns validation messages for maternity inconsistency, media, materials, size schema, and mandatory attrs when class links exist', () => {
    const materialNode = {
      getName: jest.fn(() => ''),
      getID: jest.fn(() => 'MAT_1'),
    };
    const node = createNode({
      primary_client_focus: 'maternity',
      is_maternity: 'false',
      maternity_status: 'General',
      status: 'Active',
      brand_id: '',
    }, {
      color_family: true,
    }, [{
      getTarget: jest.fn(() => materialNode),
      getValue: jest.fn(() => ({
        getSimpleValue: jest.fn(() => ''),
      })),
    }], [{}]);
    const result = checkMandatoryAttributesBeforeApprove.operation0(
      node,
      {
        getAllAttributes: jest.fn(() => ({
          iterator: jest.fn(() => createIterator([
            createAttribute('color_family', 'Color Family', ['StyleVariant']),
          ])),
        })),
      },
      {
        getValue: jest.fn(() => ({
          getSimpleValue: jest.fn(() => 'true'),
        })),
      },
      {},
      {},
      null,
      {
        evaluate: jest.fn(() => ({
          isRejected: jest.fn(() => true),
          getLocalizableMessages: jest.fn(() => ({
            toArray: jest.fn(() => ['Missing imagery']),
          })),
        })),
      },
      {},
      {
        evaluate: jest.fn(() => ({
          isRejected: jest.fn(() => true),
          getLocalizableMessages: jest.fn(() => ({
            toArray: jest.fn(() => ['Missing size schema']),
          })),
        })),
      }
    );

    expect(result).toContain('Style Variant 1 has below validation failures');
    expect(result).toContain('For maternity primary client focus, is_maternity must be true');
    expect(result).toContain('Media validation failed: Missing imagery');
    expect(result).toContain('Below materials missing percentage values:');
    expect(result).toContain('MAT_1');
    expect(result).toContain('Missing size schema');
    expect(result).toContain('Missing below mandatory attributes:');
    expect(result).toContain('Color Family');
    expect(result).toContain('brand_id');
  });

  test('returns a class validation message when style variant has no class links', () => {
    const result = checkMandatoryAttributesBeforeApprove.operation0(
      createNode({}, {}, [], []),
      {
        getAllAttributes: jest.fn(),
      },
      {
        getValue: jest.fn(() => ({
          getSimpleValue: jest.fn(() => 'true'),
        })),
      },
      {},
      {},
      null,
      {
        evaluate: jest.fn(),
      },
      {},
      {
        evaluate: jest.fn(),
      }
    );

    expect(result).toBe("Style Variant 1 is missing Item Type Class, can't proceed further.");
  });
});
