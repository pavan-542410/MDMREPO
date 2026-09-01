const deduplicationCheckForStyleVariant = require('../../../../../step-configs/BusinessRule/BusinessRule_DeduplicationCheckForStyleVariant');

class ArrayListMock {
  constructor() {
    this.values = [];
  }

  add(value) {
    this.values.push(value);
  }

  size() {
    return this.values.length;
  }

  get(index) {
    return this.values[index];
  }
}

class HashMapMock {
  constructor() {
    this.values = {};
  }

  containsKey(key) {
    return Object.prototype.hasOwnProperty.call(this.values, key);
  }

  put(key, value) {
    this.values[key] = value;
  }

  get(key) {
    return this.values[key];
  }
}

function createIterator(items) {
  let index = 0;

  return {
    hasNext: jest.fn(() => index < items.length),
    next: jest.fn(() => items[index++]),
  };
}

function createObjectType(typeID) {
  return {
    equals: jest.fn((expected) => typeID === expected),
    toString: jest.fn(() => typeID),
  };
}

function createSizeSchemaRef(schemaID) {
  return {
    getTarget: jest.fn(() => ({
      getID: jest.fn(() => schemaID),
    })),
  };
}

function createStyleVariant(id, attrs, sizeSchemaID, parent) {
  return {
    getID: jest.fn(() => id),
    getName: jest.fn(() => id),
    getParent: jest.fn(() => parent || null),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => createObjectType('StyleVariant')),
    })),
    getValue: jest.fn((attrID) => ({
      getSimpleValue: jest.fn(() => attrs[attrID] || null),
    })),
    getManager: jest.fn(() => ({
      getReferenceTypeHome: jest.fn(() => ({
        getReferenceTypeByID: jest.fn(() => 'sizeSchemaRefType'),
      })),
    })),
    queryReferences: jest.fn(() => ({
      asList: jest.fn(() => ({
        toArray: jest.fn(() => (sizeSchemaID ? [createSizeSchemaRef(sizeSchemaID)] : [])),
      })),
    })),
  };
}

function createStyleNode(linkedSvs, parentName) {
  return {
    getName: jest.fn(() => 'Style Node'),
    getParent: jest.fn(() => (parentName
      ? {
        getName: jest.fn(() => parentName),
        getParent: jest.fn(() => null),
      }
      : null)),
    queryClassificationProductLinks: jest.fn(() => ({
      asList: jest.fn(() => ({
        iterator: jest.fn(() => createIterator(linkedSvs.map((svNode) => ({
          getLinkType: jest.fn(() => ({ getID: jest.fn(() => 'StyleVariantToStyleLink') })),
          getProduct: jest.fn(() => svNode),
        })))),
      })),
    })),
  };
}

describe('BusinessRule_DeduplicationCheckForStyleVariant', () => {
  beforeEach(() => {
    global.java = {
      util: {
        ArrayList: ArrayListMock,
        HashMap: HashMapMock,
      },
    };
    global.logger = {
      info: jest.fn(),
    };
  });

  afterEach(() => {
    delete global.java;
    delete global.logger;
  });

  test('returns a duplicate message when two SVs under the same Style share schema and normalized match attributes', () => {
    const duplicateSv = createStyleVariant('SV_DUP', {
      brand_color: 'Blue',
      color: 'Navy',
      dress_length_inches: '10',
      skirt_length_inches: '',
      inseam_inches: '30',
      product_name: 'Duplicate Product',
    }, 'SCHEMA_1');
    const currentSv = createStyleVariant('SV_1', {
      brand_color: ' blue ',
      color: 'NAVY',
      dress_length_inches: '10',
      skirt_length_inches: '',
      inseam_inches: '30',
      product_name: null,
    }, 'SCHEMA_1');
    const styleNode = createStyleNode([duplicateSv, currentSv]);
    currentSv.queryReferencedBy = jest.fn(() => ({
      asList: jest.fn(() => ({
        toArray: jest.fn(() => [{ getSource: jest.fn(() => styleNode) }]),
      })),
    }));

    const result = deduplicationCheckForStyleVariant.operation0(
      currentSv,
      {},
      { info: jest.fn() },
      'candidateSvRefType'
    );

    expect(result).toBe('Duplicate Found between "Duplicate Product" and "SV_1"');
  });

  test('returns a missing-style message when no candidate style references exist', () => {
    const currentSv = createStyleVariant('SV_2', {
      brand_color: 'Blue',
    }, null);
    currentSv.queryReferencedBy = jest.fn(() => ({
      asList: jest.fn(() => ({
        toArray: jest.fn(() => []),
      })),
    }));

    expect(deduplicationCheckForStyleVariant.operation0(
      currentSv,
      {},
      { info: jest.fn() },
      'candidateSvRefType'
    )).toBe('No Style found for SV SV_2');
  });

  test('returns true for non-StyleVariant nodes and ignores SVs under UK parents', () => {
    const skuNode = {
      getObjectType: jest.fn(() => ({
        getID: jest.fn(() => createObjectType('SKUNode')),
      })),
    };
    expect(deduplicationCheckForStyleVariant.operation0(
      skuNode,
      {},
      { info: jest.fn() },
      'candidateSvRefType'
    )).toBe(true);

    const currentSv = createStyleVariant('SV_3', {
      brand_color: 'Blue',
    }, 'SCHEMA_2');
    const ukStyle = createStyleNode([currentSv], 'UK');
    currentSv.queryReferencedBy = jest.fn(() => ({
      asList: jest.fn(() => ({
        toArray: jest.fn(() => [{ getSource: jest.fn(() => ukStyle) }]),
      })),
    }));

    expect(deduplicationCheckForStyleVariant.operation0(
      currentSv,
      {},
      { info: jest.fn() },
      'candidateSvRefType'
    )).toBe(true);
  });
});
