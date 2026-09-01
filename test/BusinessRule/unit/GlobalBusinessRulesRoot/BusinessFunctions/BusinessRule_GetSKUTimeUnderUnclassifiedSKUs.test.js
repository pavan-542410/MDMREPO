const getSKUTimeUnderUnclassifiedSKUs = require('../../../../../step-configs/BusinessRule/BusinessRule_GetSKUTimeUnderUnclassifiedSKUs');

function createRevision(dateValue, parentNode) {
  return {
    getCreatedDate: jest.fn(() => new Date(dateValue)),
    getNode: jest.fn(() => ({
      getParent: jest.fn(() => parentNode),
    })),
  };
}

function createRevisionCollection(revisions) {
  let index = 0;

  return {
    size: jest.fn(() => revisions.length),
    iterator: jest.fn(() => ({
      hasNext: jest.fn(() => index < revisions.length),
      next: jest.fn(() => revisions[index++]),
    })),
  };
}

function createNode(id, typeID, parentNode, revisions) {
  return {
    getID: jest.fn(() => id),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => typeID),
    })),
    getParent: jest.fn(() => parentNode || null),
    getRevisions: jest.fn(() => createRevisionCollection(revisions || [])),
  };
}

describe('BusinessRule_GetSKUTimeUnderUnclassifiedSKUs', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-10T12:00:00.000Z'));
    global.com = {
      stibo: {
        core: {
          domain: {
            Node: function Node() {},
          },
        },
      },
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    delete global.com;
  });

  test('returns cached day counts for SKUs currently or historically under UnclassifiedSKUs', () => {
    const parentNode = {
      getID: jest.fn(() => 'UnclassifiedSKUs'),
      getName: jest.fn(() => 'UnclassifiedSKUs'),
      getParent: jest.fn(() => null),
    };
    const skuNode = createNode('SKU_1', 'SKUNode', parentNode, [
      createRevision('2024-01-08T12:00:00.000Z', parentNode),
    ]);
    const manager = {
      getHome: jest.fn(() => ({
        getObjectByID: jest.fn(() => parentNode),
      })),
    };
    const cacheScope = {};

    expect(getSKUTimeUnderUnclassifiedSKUs.operation0.call(cacheScope, manager, skuNode)).toBe('2.0');
    expect(getSKUTimeUnderUnclassifiedSKUs.operation0.call(cacheScope, manager, skuNode)).toBe('2.0');
    expect(cacheScope.resultCache.SKU_1).toBe('2.0');
  });

  test('returns 0.0 for non-SKUs, SKUs outside UnclassifiedSKUs, and runtime errors', () => {
    const parentNode = {
      getID: jest.fn(() => 'Class_1'),
      getName: jest.fn(() => 'Class 1'),
      getParent: jest.fn(() => null),
    };
    const manager = {
      getHome: jest.fn(() => ({
        getObjectByID: jest.fn(() => null),
      })),
    };
    const cacheScope = {};

    expect(getSKUTimeUnderUnclassifiedSKUs.operation0.call(
      cacheScope,
      manager,
      createNode('SV_1', 'StyleVariant', parentNode, [])
    )).toBe('0.0');

    expect(getSKUTimeUnderUnclassifiedSKUs.operation0.call(
      {},
      manager,
      createNode('SKU_2', 'SKUNode', parentNode, [])
    )).toBe('0.0');

    expect(getSKUTimeUnderUnclassifiedSKUs.operation0.call({}, manager, {
      getID: jest.fn(() => {
        throw new Error('boom');
      }),
    })).toBe('0.0');
  });
});
