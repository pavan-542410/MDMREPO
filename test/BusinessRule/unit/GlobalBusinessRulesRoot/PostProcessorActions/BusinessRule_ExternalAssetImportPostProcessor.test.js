const externalAssetImportPostProcessor = require('../../../../../step-configs/BusinessRule/BusinessRule_ExternalAssetImportPostProcessor');

function createValueStore(initialValues) {
  const values = { ...initialValues };
  const wrappers = {};

  return {
    getValue: jest.fn((attrID) => {
      if (!wrappers[attrID]) {
        wrappers[attrID] = {
          getSimpleValue: jest.fn(() => (Object.prototype.hasOwnProperty.call(values, attrID) ? values[attrID] : null)),
          setSimpleValue: jest.fn((value) => {
            values[attrID] = value;
          }),
        };
      }

      return wrappers[attrID];
    }),
    values,
  };
}

function createReference(source, target) {
  return {
    getSource: jest.fn(() => source),
    getTarget: jest.fn(() => target),
    delete: jest.fn(),
  };
}

function createNode(id, valuesByID, parent) {
  const valueStore = createValueStore(valuesByID);
  const refsByType = {};
  const referencedByByType = {};

  return {
    getID: jest.fn(() => id),
    getName: jest.fn(() => id),
    getParent: jest.fn(() => parent || null),
    getValue: valueStore.getValue,
    createReference: jest.fn((target, refType) => {
      const ref = createReference({ getID: jest.fn(() => id) }, target);
      const typeID = refType.getID();
      if (!refsByType[typeID]) refsByType[typeID] = [];
      refsByType[typeID].push(ref);
      return ref;
    }),
    queryReferences: jest.fn((refType) => ({
      asList: jest.fn(() => ({
        toArray: jest.fn(() => refsByType[refType.getID()] || []),
      })),
    })),
    queryReferencedBy: jest.fn((refType) => ({
      asList: jest.fn(() => ({
        toArray: jest.fn(() => referencedByByType[refType.getID()] || []),
      })),
    })),
    __refsByType: refsByType,
    __referencedByByType: referencedByByType,
    __values: valueStore.values,
  };
}

describe('BusinessRule_ExternalAssetImportPostProcessor', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-02T03:04:05.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('creates/deletes EA and primary-image references and updates first media date', () => {
    const product = createNode('PRD_1', {}, null);
    const colorway = createNode('VAR_1', {}, product);
    const sv = createNode('SV_1', {
      first_media_available_at: null,
    }, colorway);
    const previousPrimaryAsset = createNode('EA_OLD', {}, null);
    const incomingAsset = createNode('EA_NEW', {
      style_variant_id: '1',
      action_code: 'UPSERT',
      developmental: 'false',
      asset_type: 'hero',
    }, null);
    const primaryRefType = { getID: jest.fn(() => 'PrimaryProductImage') };
    const externalRefType = { getID: jest.fn(() => 'external_asset_reference') };
    const devRefType = { getID: jest.fn(() => 'developmental_asset_reference') };
    const oldPrimaryRef = createReference(sv, previousPrimaryAsset);
    previousPrimaryAsset.__referencedByByType.PrimaryProductImage = [oldPrimaryRef];
    sv.__refsByType.PrimaryProductImage = [oldPrimaryRef];
    const step = {
      getReferenceTypeHome: jest.fn(() => ({
        getReferenceTypeByID: jest.fn((id) => ({
          PrimaryProductImage: primaryRefType,
          external_asset_reference: externalRefType,
          developmental_asset_reference: devRefType,
        }[id])),
      })),
    };
    const util = {
      initialize: jest.fn(() => ({
        prodHome: 'prodHome',
        prodCache: {},
      })),
      getProduct: jest.fn(() => sv),
    };
    const wf = {
      triggerWfFromMapNoWebUI: jest.fn(),
    };
    const isAlreadyRefd = {
      evaluate: jest.fn(() => false),
    };

    externalAssetImportPostProcessor.operation0(incomingAsset, step, { info: jest.fn() }, isAlreadyRefd, util, wf);

    expect(sv.createReference).toHaveBeenCalledWith(incomingAsset, externalRefType);
    expect(product.createReference).toHaveBeenCalledWith(incomingAsset, primaryRefType);
    expect(colorway.createReference).toHaveBeenCalledWith(incomingAsset, primaryRefType);
    expect(sv.__values.first_media_available_at).toBe('2024-01-02 03:04:05');
    expect(oldPrimaryRef.delete).toHaveBeenCalledTimes(1);
    expect(wf.triggerWfFromMapNoWebUI).toHaveBeenCalledWith(
      sv,
      expect.objectContaining({
        ColorwayEnrichment: expect.any(Object),
      }),
      'Triggered from External Asset Post Processor business rule.'
    );

    const deleteAsset = createNode('EA_DEV', {
      style_variant_id: '1',
      action_code: 'DELETE',
      developmental: 'true',
      asset_type: 'non-hero',
    }, null);
    const devRef = createReference({ getID: jest.fn(() => 'SV_1') }, deleteAsset);
    const stalePrimaryRef = createReference({ getID: jest.fn(() => 'SV_1') }, deleteAsset);
    deleteAsset.__referencedByByType.developmental_asset_reference = [devRef];
    deleteAsset.__referencedByByType.PrimaryProductImage = [stalePrimaryRef];

    externalAssetImportPostProcessor.operation0(deleteAsset, step, { info: jest.fn() }, isAlreadyRefd, util, wf);

    expect(devRef.delete).toHaveBeenCalledTimes(1);
    expect(stalePrimaryRef.delete).toHaveBeenCalledTimes(1);
  });

  test('logs missing style variants and skips duplicate references', () => {
    const logger = {
      info: jest.fn(),
    };
    const asset = createNode('EA_2', {
      style_variant_id: '404',
      action_code: 'UPSERT',
      developmental: 'false',
      asset_type: 'hero',
    }, null);
    const step = {
      getReferenceTypeHome: jest.fn(() => ({
        getReferenceTypeByID: jest.fn((id) => ({ getID: jest.fn(() => id) })),
      })),
    };
    const util = {
      initialize: jest.fn(() => ({
        prodHome: 'prodHome',
        prodCache: {},
      })),
      getProduct: jest.fn(() => null),
    };

    externalAssetImportPostProcessor.operation0(asset, step, logger, {
      evaluate: jest.fn(() => true),
    }, util, {
      triggerWfFromMapNoWebUI: jest.fn(),
    });

    expect(logger.info).toHaveBeenCalledWith(
      'Style Variant : 404 not found to associate with EA : EA_2'
    );
  });
});
