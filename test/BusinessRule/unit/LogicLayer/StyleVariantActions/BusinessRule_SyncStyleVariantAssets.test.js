const br = require('../../../../../step-configs/BusinessRule/BusinessRule_SyncStyleVariantAssets');

function createValueHolder(initialValue) {
  let currentValue = initialValue;

  return {
    getSimpleValue: jest.fn(() => currentValue),
    setSimpleValue: jest.fn((nextValue) => {
      currentValue = nextValue;
    }),
  };
}

function createReference(target) {
  return {
    getTarget: jest.fn(() => target),
  };
}

function createAsset(id, values) {
  const attrs = {};
  Object.keys(values || {}).forEach((attrID) => {
    attrs[attrID] = createValueHolder(values[attrID]);
  });

  return {
    getID: jest.fn(() => id),
    getValue: jest.fn((attrID) => {
      if (!attrs[attrID]) {
        attrs[attrID] = createValueHolder('');
      }
      return attrs[attrID];
    }),
  };
}

function createStyleVariantNode(id, values, refsByType, workflowInstance) {
  const attrs = {};
  Object.keys(values || {}).forEach((attrID) => {
    attrs[attrID] = createValueHolder(values[attrID]);
  });

  return {
    getID: jest.fn(() => id),
    getValue: jest.fn((attrID) => {
      if (!attrs[attrID]) {
        attrs[attrID] = createValueHolder('');
      }
      return attrs[attrID];
    }),
    queryReferences: jest.fn((refType) => ({
      asList: jest.fn(() => ({
        toArray: jest.fn(() => (refsByType[refType.getID()] || []).slice()),
      })),
    })),
    getWorkflowInstanceByID: jest.fn(() => workflowInstance || null),
  };
}

function createStep(refTypesByID, assetsByID, productsByID) {
  return {
    getReferenceTypeHome: jest.fn(() => ({
      getReferenceTypeByID: jest.fn((refTypeID) => refTypesByID[refTypeID] || null),
    })),
    getAssetHome: jest.fn(() => ({
      getAssetByID: jest.fn((assetID) => assetsByID[assetID] || null),
    })),
    getProductHome: jest.fn(() => ({
      getProductByID: jest.fn((productID) => productsByID[productID] || null),
    })),
  };
}

describe('BusinessRule_SyncStyleVariantAssets', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
  });

  afterEach(() => {
    delete global.logger;
  });

  it('cleans copied refs, syncs primary EA, and triggers ProductMaintenance approval', () => {
    const eaOriginal = createAsset('EA_ORIG', {
      style_variant_id: '111',
      photo_asset_id: 'PHOTO_ORIG',
    });
    const eaCopied = createAsset('EA_COPY', {
      style_variant_id: '222',
      photo_asset_id: 'PHOTO_COPY',
    });
    const stalePrimaryRef = createReference(eaCopied);
    const node = createStyleVariantNode(
      'SV_111',
      {
        ft_data_model_style_variant_id: '111',
        primary_photo_asset_id: 'PHOTO_ORIG',
      },
      {
        external_asset_reference: [createReference(eaOriginal), createReference(eaCopied)],
        CopyMedia: [createReference(createStyleVariantNode('SV_SOURCE', {}, {}, null))],
        PrimaryProductImage: [stalePrimaryRef],
      },
      {
        getTaskByID: jest.fn(() => ({
          triggerByID: jest.fn(() => ({
            isRejectedByScript: jest.fn(() => false),
          })),
        })),
      }
    );
    const w = {
      deleteReferencesByTargetIds: jest.fn(() => 1),
      deleteReference: jest.fn(),
      writeSimpleValue: jest.fn(),
      createReference: jest.fn(),
    };

    br.operation0(
      node,
      createStep(
        {
          external_asset_reference: { getID: jest.fn(() => 'external_asset_reference') },
          CopyMedia: { getID: jest.fn(() => 'CopyMedia') },
          PrimaryProductImage: { getID: jest.fn(() => 'PrimaryProductImage') },
        },
        {
          EA_ORIG: eaOriginal,
          EA_COPY: eaCopied,
        },
        {}
      ),
      {
        evaluate: jest.fn(() => JSON.stringify([
          { refTypeID: 'external_asset_reference', refTarget: 'EA_ORIG' },
          { refTypeID: 'external_asset_reference', refTarget: 'EA_COPY' },
          { refTypeID: 'CopyMedia', refTarget: 'SV_SOURCE' },
          { refTypeID: 'PrimaryProductImage', refTarget: 'EA_IGNORED' },
          { refTypeID: '', refTarget: '' },
        ])),
      },
      w
    );

    expect(w.deleteReferencesByTargetIds).toHaveBeenCalledWith(
      node,
      expect.anything(),
      ['EA_COPY']
    );
    expect(w.deleteReference).toHaveBeenCalledWith(stalePrimaryRef);
    expect(w.writeSimpleValue).toHaveBeenCalledWith(eaOriginal, 'is_style_variant_primary_image', 'true');
    expect(w.writeSimpleValue).toHaveBeenCalledWith(eaCopied, 'is_style_variant_primary_image', 'false');
    expect(w.writeSimpleValue).toHaveBeenCalledWith(node, 'primary_photo_asset_id', 'PHOTO_ORIG');
  });

  it('inherits desired primary_photo_asset_id from CopyMedia source SV when current SV has no value', () => {
    const eaCopied = createAsset('EA_FROM_SOURCE', {
      style_variant_id: '999',
      photo_asset_id: 'PHOTO_FROM_SOURCE',
    });
    const sourceSV = createStyleVariantNode('SV_SOURCE', {
      primary_photo_asset_id: 'PHOTO_FROM_SOURCE',
    }, {}, null);
    const node = createStyleVariantNode('SV_1000', {
      ft_data_model_style_variant_id: '1000',
      primary_photo_asset_id: '',
    }, {
      external_asset_reference: [createReference(eaCopied)],
      CopyMedia: [],
      PrimaryProductImage: [],
    }, null);
    const w = {
      deleteReferencesByTargetIds: jest.fn(),
      deleteReference: jest.fn(),
      writeSimpleValue: jest.fn(),
      createReference: jest.fn(),
    };

    br.operation0(
      node,
      createStep(
        {
          external_asset_reference: { getID: jest.fn(() => 'external_asset_reference') },
          PrimaryProductImage: { getID: jest.fn(() => 'PrimaryProductImage') },
        },
        {
          EA_FROM_SOURCE: eaCopied,
        },
        {
          SV_SOURCE: sourceSV,
        }
      ),
      {
        evaluate: jest.fn(() => JSON.stringify([
          { refTypeID: 'CopyMedia', refTarget: 'SV_SOURCE' },
          { refTypeID: 'external_asset_reference', refTarget: 'EA_FROM_SOURCE' },
        ])),
      },
      w
    );

    expect(w.writeSimpleValue).toHaveBeenCalledWith(node, 'primary_photo_asset_id', 'PHOTO_FROM_SOURCE');
    expect(w.createReference).toHaveBeenCalledWith(
      expect.anything(),
      node,
      eaCopied,
      'PrimaryProductImage'
    );
  });

  it('returns early when no desired primary asset can be resolved', () => {
    const node = createStyleVariantNode('SV_3000', {
      ft_data_model_style_variant_id: '3000',
      primary_photo_asset_id: '',
    }, {
      external_asset_reference: [],
      CopyMedia: [],
      PrimaryProductImage: [],
    }, null);
    const w = {
      deleteReferencesByTargetIds: jest.fn(),
      deleteReference: jest.fn(),
      writeSimpleValue: jest.fn(),
      createReference: jest.fn(),
    };

    br.operation0(
      node,
      createStep(
        {
          external_asset_reference: { getID: jest.fn(() => 'external_asset_reference') },
        },
        {},
        {}
      ),
      {
        evaluate: jest.fn(() => JSON.stringify([])),
      },
      w
    );

    expect(w.writeSimpleValue).not.toHaveBeenCalled();
    expect(w.createReference).not.toHaveBeenCalled();
  });

  it('throws when external_asset_reference type cannot be resolved', () => {
    const node = createStyleVariantNode('SV_4000', {
      ft_data_model_style_variant_id: '4000',
      primary_photo_asset_id: 'PHOTO_4000',
    }, {}, null);

    expect(() => {
      br.operation0(
        node,
        createStep({}, {}, {}),
        {
          evaluate: jest.fn(() => JSON.stringify([])),
        },
        {
          deleteReferencesByTargetIds: jest.fn(),
          deleteReference: jest.fn(),
          writeSimpleValue: jest.fn(),
          createReference: jest.fn(),
        }
      );
    }).toThrow('SyncStyleVariantAssets: ReferenceType not found: external_asset_reference');
  });
});
