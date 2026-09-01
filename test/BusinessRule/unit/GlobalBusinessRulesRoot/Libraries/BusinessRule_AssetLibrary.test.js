const assetLibrary = require('../../../../../step-configs/BusinessRule/BusinessRule_AssetLibrary');

function createValueHolder(initialValue) {
  return {
    currentValue: initialValue,
    getSimpleValue() {
      return this.currentValue;
    },
    setSimpleValue(nextValue) {
      this.currentValue = nextValue;
    }
  };
}

function createRef(target, deleteFn) {
  return {
    getTarget: () => target,
    delete: deleteFn || jest.fn()
  };
}

function createRefQuery(refs) {
  return {
    asList: () => ({
      toArray: () => refs.slice()
    })
  };
}

function createRefList(refs) {
  return {
    size: () => refs.length,
    get: (index) => refs[index],
    iterator: () => {
      let index = 0;
      return {
        hasNext: () => index < refs.length,
        next: () => refs[index++]
      };
    }
  };
}

function createNode(id, name, values, parent) {
  const attrs = {};
  Object.keys(values || {}).forEach((attrID) => {
    attrs[attrID] = createValueHolder(values[attrID]);
  });

  return {
    getID: () => id,
    getName: () => name,
    getParent: () => parent || null,
    getValue: (attrID) => {
      if (!attrs[attrID]) {
        attrs[attrID] = createValueHolder(null);
      }
      return attrs[attrID];
    },
    createReference: jest.fn(),
    approve: jest.fn(),
    delete: jest.fn(),
    getReferences: jest.fn(() => createRefList([])),
    queryReferences: jest.fn(() => createRefQuery([])),
    queryReferencedBy: jest.fn(() => createRefQuery([])),
    getManager: jest.fn(() => ({
      getReferenceTypeHome: () => ({
        getReferenceTypeByID: (refTypeID) => ({ getID: () => refTypeID })
      })
    }))
  };
}

describe('BusinessRule_AssetLibrary', () => {
  beforeEach(() => {
    global.coreLogic = {
      getPrimaryStyleVariant: jest.fn((cw) => cw.getChildren()[0]),
      getPrimaryColorway: jest.fn((prd) => prd.getChildren()[0])
    };
    global.u = {
      smartReferenceCreate: jest.fn()
    };
    global.wf = {
      triggerWfFromMapNoWebUI: jest.fn(() => null)
    };
    global.w = {
      approveReferences: jest.fn()
    };

    jest.useFakeTimers().setSystemTime(new Date('2024-01-02T03:04:05.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    delete global.coreLogic;
    delete global.u;
    delete global.wf;
    delete global.w;
  });

  test('creates developmental asset references and approves the SV/product hierarchy', () => {
    const prd = createNode('PRD_1', 'Product', {});
    const cw = createNode('VAR_1', 'Colorway', {}, prd);
    const sv = createNode('SV_1', 'Style Variant', {}, cw);
    const ea = createNode('EA_DEV', 'Dev Asset', {
      developmental: 'true',
      action_code: 'UPSERT',
      is_style_variant_primary_image: 'true'
    });
    prd.getChildren = () => [cw];
    cw.getChildren = () => [sv];

    const step = {
      getReferenceTypeHome: () => ({
        getReferenceTypeByID: (refTypeID) => ({ getID: () => refTypeID })
      })
    };
    const primaryRefType = { getID: () => 'PrimaryProductImage' };
    const log = { info: jest.fn(), warning: jest.fn() };

    assetLibrary.handleEA(ea, sv, step, primaryRefType, log);

    expect(sv.createReference).toHaveBeenCalledWith(
      ea,
      expect.objectContaining({ getID: expect.any(Function) })
    );
    expect(global.wf.triggerWfFromMapNoWebUI).toHaveBeenCalledWith(
      sv,
      expect.objectContaining({
        ProductAttributionAndApproval: expect.any(Object),
        SampleAndMedia: expect.any(Object)
      }),
      'Triggered from External Asset Post Processor business rule.',
      log
    );
    expect(ea.approve).toHaveBeenCalledTimes(1);
    expect(global.w.approveReferences).toHaveBeenCalledWith(sv, [
      'external_asset_reference',
      'PrimaryProductImage',
      'developmental_asset_reference'
    ]);
    expect(global.w.approveReferences).toHaveBeenCalledWith(cw, ['PrimaryProductImage']);
    expect(global.w.approveReferences).toHaveBeenCalledWith(prd, [
      'PrimaryProductImage',
      'developmental_asset_reference'
    ]);
  });

  test('deletes external and primary refs and deletes the EA when action code is DELETE', () => {
    const prd = createNode('PRD_1', 'Product', {});
    const cw = createNode('VAR_1', 'Colorway', {}, prd);
    const sv = createNode('SV_1', 'Style Variant', {}, cw);
    const ea = createNode('EA_DELETE', 'Delete Asset', {
      developmental: 'false',
      action_code: 'DELETE',
      is_style_variant_primary_image: 'false'
    });
    const extDelete = jest.fn();
    const primaryDelete = jest.fn();

    ea.queryReferencedBy = jest.fn((refType) => {
      if (refType.getID() === 'external_asset_reference') {
        return createRefQuery([createRef(sv, extDelete)]);
      }
      return createRefQuery([createRef(sv, primaryDelete)]);
    });

    assetLibrary.handleEA(
      ea,
      sv,
      {
        getReferenceTypeHome: () => ({
          getReferenceTypeByID: (refTypeID) => ({ getID: () => refTypeID })
        })
      },
      { getID: () => 'PrimaryProductImage' },
      { info: jest.fn() }
    );

    expect(extDelete).toHaveBeenCalledTimes(1);
    expect(primaryDelete).toHaveBeenCalledTimes(1);
    expect(ea.delete).toHaveBeenCalledTimes(1);
  });

  test('currently fails old-primary reset because resetOldPrimaryImage approves using an undefined referenceType variable', () => {
    const oldPrimaryEA = createNode('EA_OLD', 'Old EA', {
      is_style_variant_primary_image: 'true'
    });
    const newPrimaryEA = createNode('EA_NEW', 'New EA', {
      is_style_variant_primary_image: 'true',
      developmental: 'false'
    });
    const sv = createNode('SV_1', 'Style Variant', {
      first_media_available_at: null
    });
    const primaryRefType = { getID: () => 'PrimaryProductImage' };
    const externalRefType = { getID: () => 'external_asset_reference' };
    const deletePrimary = jest.fn();
    const deleteExternal = jest.fn();
    const log = { info: jest.fn(), warning: jest.fn() };

    sv.queryReferences = jest.fn((refType) => {
      if (refType.getID() === 'PrimaryProductImage') {
        return createRefQuery([createRef(oldPrimaryEA, deletePrimary)]);
      }
      return createRefQuery([
        createRef(oldPrimaryEA, deleteExternal),
        createRef(newPrimaryEA, jest.fn())
      ]);
    });
    sv.getReferences = jest.fn(() => createRefList([]));

    expect(() => {
      assetLibrary.resetOldPrimaryImage(newPrimaryEA, sv, externalRefType, primaryRefType, log);
    }).toThrow('referenceType is not defined');

    assetLibrary.createSmartReference(sv, newPrimaryEA, primaryRefType, false, log);
    assetLibrary.setFirstMediaAvailableDate(sv);
    assetLibrary.setFirstMediaAvailableDate(sv);

    expect(deletePrimary).toHaveBeenCalledTimes(1);
    expect(oldPrimaryEA.getValue('is_style_variant_primary_image').getSimpleValue()).toBe('false');
    expect(oldPrimaryEA.approve).toHaveBeenCalledTimes(1);
    expect(sv.createReference).toHaveBeenCalledWith(newPrimaryEA, primaryRefType);
    expect(sv.getValue('first_media_available_at').getSimpleValue()).toBe('2024-01-02 03:04:05');
  });

  test('finds primary EA from SV references and evaluates asset flags', () => {
    const primaryEA = createNode('EA_PRIMARY', 'Primary', {
      is_style_variant_primary_image: 'true',
      developmental: 'true',
      action_code: 'DELETE'
    });
    const nonPrimaryEA = createNode('EA_OTHER', 'Other', {
      is_style_variant_primary_image: 'false'
    });
    const sv = createNode('SV_1', 'Style Variant', {});

    sv.getReferences = jest.fn(() => createRefList([
      createRef(nonPrimaryEA),
      createRef(primaryEA)
    ]));

    expect(assetLibrary.getPrimaryEAfromSV(sv)).toBe(primaryEA);
    expect(assetLibrary.isPrimary(primaryEA)).toBe(true);
    expect(assetLibrary.isDevelopmental(primaryEA)).toBe(true);
    expect(assetLibrary.isDeleted(primaryEA)).toBe(true);
  });
});
