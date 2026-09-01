const executeInstructionPlan = require('../../../../../step-configs/BusinessRule/BusinessRule_ExecuteInstructionPlan');

function createRef(targetID) {
  return {
    getTarget: jest.fn(() => ({
      getID: jest.fn(() => targetID),
    })),
  };
}

function createNode(id, refsByType) {
  return {
    getID: jest.fn(() => id),
    queryReferences: jest.fn((refType) => ({
      asList: jest.fn(() => ({
        toArray: jest.fn(() => refsByType[refType.getID()] || []),
      })),
    })),
  };
}

function createStep(nodesByDomain, refTypesByID) {
  return {
    getProductHome: jest.fn(() => ({
      getProductByID: jest.fn((id) => nodesByDomain.Product[id] || null),
    })),
    getAssetHome: jest.fn(() => ({
      getAssetByID: jest.fn((id) => nodesByDomain.Asset[id] || null),
    })),
    getClassificationHome: jest.fn(() => ({
      getClassificationByID: jest.fn((id) => nodesByDomain.Classification[id] || null),
    })),
    getEntityHome: jest.fn(() => ({
      getEntityByID: jest.fn((id) => nodesByDomain.Entity[id] || null),
    })),
    getReferenceTypeHome: jest.fn(() => ({
      getReferenceTypeByID: jest.fn((id) => refTypesByID[id] || null),
    })),
  };
}

describe('BusinessRule_ExecuteInstructionPlan', () => {
  beforeEach(() => {
    global.logger = {
      info: jest.fn(),
    };
  });

  afterEach(() => {
    delete global.logger;
  });

  test('executes delete, value upsert, and single-reference operations across supported domains', () => {
    const staleRef = createRef('OLD_STYLE');
    const keepRef = createRef('STYLE_1');
    const product = createNode('PRD_1', {
      ProductToStyle: [staleRef, keepRef],
    });
    const style = createNode('STYLE_1', {});
    const asset = createNode('ASSET_1', {});
    const classification = createNode('CLASS_1', {});
    const entity = createNode('ENTITY_1', {});
    const productToStyle = { getID: jest.fn(() => 'ProductToStyle') };
    const productToAsset = { getID: jest.fn(() => 'ProductToAsset') };
    const w = {
      deleteReferencesByTargetIds: jest.fn(),
      writeSimpleValue: jest.fn(),
      deleteReference: jest.fn(),
      createReference: jest.fn(),
    };
    const step = createStep(
      {
        Product: { PRD_1: product },
        Asset: { ASSET_1: asset },
        Classification: { STYLE_1: style, CLASS_1: classification },
        Entity: { ENTITY_1: entity },
      },
      {
        ProductToStyle: productToStyle,
        ProductToAsset: productToAsset,
      }
    );

    const result = executeInstructionPlan.operation0(
      step,
      JSON.stringify({
        ops: [
          {
            op: 'deleteReferencesByTargetIds',
            source: { domain: 'Entity', id: 'ENTITY_1' },
            refTypeID: 'ProductToAsset',
            targetIds: ['ASSET_1'],
          },
          {
            op: 'upsertSimpleValue',
            target: { domain: 'Product', id: 'PRD_1' },
            attrID: 'display_name',
            value: 'Updated Name',
          },
          {
            op: 'ensureSingleReference',
            source: { domain: 'Product', id: 'PRD_1' },
            target: { domain: 'Classification', id: 'STYLE_1' },
            refTypeID: 'ProductToStyle',
          },
        ],
      }),
      w
    );

    expect(JSON.parse(result)).toEqual({
      ok: true,
      executed: 3,
    });
    expect(w.deleteReferencesByTargetIds).toHaveBeenCalledWith(entity, productToAsset, ['ASSET_1']);
    expect(w.writeSimpleValue).toHaveBeenCalledWith(product, 'display_name', 'Updated Name');
    expect(w.deleteReference).toHaveBeenCalledWith(staleRef);
    expect(w.createReference).not.toHaveBeenCalled();
    expect(global.logger.info).toHaveBeenCalledWith('ExecuteInstructionPlan: executed ops=3');
  });

  test('creates a missing single reference and rejects invalid or unsupported operations', () => {
    const product = createNode('PRD_2', {
      ProductToStyle: [],
    });
    const style = createNode('STYLE_2', {});
    const productToStyle = { getID: jest.fn(() => 'ProductToStyle') };
    const w = {
      deleteReferencesByTargetIds: jest.fn(),
      writeSimpleValue: jest.fn(),
      deleteReference: jest.fn(),
      createReference: jest.fn(),
    };
    const step = createStep(
      {
        Product: { PRD_2: product },
        Asset: {},
        Classification: { STYLE_2: style },
        Entity: {},
      },
      {
        ProductToStyle: productToStyle,
      }
    );

    expect(() => executeInstructionPlan.operation0(
      step,
      JSON.stringify({
        ops: [{
          op: 'upsertSimpleValue',
          target: { domain: 'Product', id: '' },
          attrID: 'display_name',
          value: 'x',
        }],
      }),
      w
    )).toThrow('ExecuteInstructionPlan: target not found for upsertSimpleValue');

    expect(() => executeInstructionPlan.operation0(
      step,
      JSON.stringify({
        ops: [{
          op: 'noop',
        }],
      }),
      w
    )).toThrow('ExecuteInstructionPlan: unsupported op type: noop');

    expect(JSON.parse(executeInstructionPlan.operation0(
      step,
      JSON.stringify({
        ops: [{
          op: 'ensureSingleReference',
          source: { domain: 'Product', id: 'PRD_2' },
          target: { domain: 'Classification', id: 'STYLE_2' },
          refTypeID: 'ProductToStyle',
        }],
      }),
      w
    ))).toEqual({
      ok: true,
      executed: 1,
    });
    expect(w.createReference).toHaveBeenCalledWith(step, product, style, 'ProductToStyle');
  });
});
