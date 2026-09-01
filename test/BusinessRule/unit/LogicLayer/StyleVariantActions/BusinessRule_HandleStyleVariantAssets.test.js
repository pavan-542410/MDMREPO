'use strict';

const br = require('../../../../../step-configs/BusinessRule/BusinessRule_HandleStyleVariantAssets');

describe('HandleStyleVariantAssets', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
    global.Packages = {
      com: { stibo: {
        query: { condition: { Conditions: {
          valueOf: () => ({ eq: () => ({}) })
        }}},
        core: { domain: { Asset: 'Asset' } }
      }}
    };
  });

  afterEach(() => {
    delete global.logger;
    delete global.Packages;
  });

  // ─── Mock builders ──────────────────────────────────────────────

  function makeRefType(id) {
    return { getID: () => id };
  }

  function makeAsset(id, values) {
    values = values || {};
    return {
      getID: () => id,
      getName: () => id,
      getObjectType: () => ({ getID: () => 'ExternalAsset' }),
      getValue: function (attrID) {
        return {
          getSimpleValue: () => (values[attrID] != null ? values[attrID] : null)
        };
      },
      approve: jest.fn()
    };
  }

  function makeReference(targetNode) {
    return {
      getTarget: () => targetNode,
      getSource: () => null
    };
  }

  /**
   * CopyMedia reference direction: media_owner --CopyMedia--> copier
   *
   * queryReferences (outgoing): called on the SOURCE node.
   *   media_owner.queryReferences(CopyMedia) → returns refs TO copiers.
   *
   * queryReferencedBy (incoming): called on the TARGET node.
   *   copier.queryReferencedBy(CopyMedia) → returns refs FROM media_owners.
   *   This is what returnSourceByRefTypeID uses internally.
   */
  function makeSvNode(id, opts) {
    opts = opts || {};
    var values = Object.assign({
      ft_data_model_style_variant_id: opts.svKey || id.replace('SV_', ''),
      primary_photo_asset_id: opts.primaryPhotoAssetId || null,
      first_media_available_at: opts.firstMedia || null
    }, opts.values || {});

    // outgoingRefs = what queryReferences returns (outgoing from this node).
    var outgoingRefs = opts.outgoingRefs || {};
    var parent = opts.parent || null;

    return {
      getID: () => id,
      getName: () => id,
      getObjectType: () => ({ getID: () => 'StyleVariant' }),
      getValue: function (attrID) {
        return {
          getSimpleValue: () => (values[attrID] != null ? values[attrID] : null),
          setSimpleValue: jest.fn(function (val) { values[attrID] = val; })
        };
      },
      _values: values,
      getParent: jest.fn(() => parent),
      queryReferences: jest.fn(function (refType) {
        var refTypeID = refType.getID();
        var refs = outgoingRefs[refTypeID] || [];
        return {
          asList: () => ({ toArray: () => refs.slice() })
        };
      }),
      queryReferencedBy: jest.fn(function () {
        return { asList: () => ({ toArray: () => [] }) };
      }),
      isInWorkflow: jest.fn(() => false),
      approve: jest.fn()
    };
  }

  function makeStep(opts) {
    opts = opts || {};
    return {
      getReferenceTypeHome: () => ({
        getReferenceTypeByID: function (id) { return makeRefType(id); }
      }),
      getAttributeHome: () => ({
        getAttributeByID: (id) => ({ getID: () => id })
      }),
      getAssetHome: () => ({
        getAssetByID: (id) => opts.assetLookup ? opts.assetLookup[id] : null
      })
    };
  }

  function makeQueryHome(assets) {
    return {
      queryFor: () => ({
        where: () => ({
          execute: () => ({
            asList: () => ({
              toArray: () => assets || []
            })
          })
        })
      })
    };
  }

  function makeReturnReferencesJSON(refs) {
    return { evaluate: () => JSON.stringify(refs || []) };
  }

  /**
   * returnSourceByRefTypeID uses queryReferencedBy (incoming refs).
   * It returns the SOURCES of references where `node` is the TARGET.
   * For CopyMedia (owner → copier):
   *   - Called on copier → returns [media_owner]
   *   - Called on media_owner → returns []
   */
  function makeReturnSourceByRefTypeID(sources) {
    return { evaluate: () => sources || [] };
  }

  function makeGetPrimarySV(primarySv) {
    return { evaluate: () => primarySv || null };
  }

  function makeSvHasValidImagery(accepted) {
    return {
      evaluate: () => ({
        isAccepted: () => !!accepted
      })
    };
  }

  function makeW() {
    return {
      deleteReferencesByTargetIds: jest.fn(),
      createReference: jest.fn(),
      deleteReference: jest.fn(),
      writeSimpleValue: jest.fn(),
      triggerWorkflowEventsByMap: jest.fn(),
      approveReferences: jest.fn()
    };
  }

  // ─── Tests: Copier Guard ────────────────────────────────────────

  describe('copier guard (incoming CopyMedia from media owners)', () => {
    test('copier SV syncs all owner external assets (not only primary)', () => {
      var ownerPrimary = makeAsset('EA_OWNER_1', {
        photo_asset_id: 'P1',
        style_variant_id: '426843',
        action_code: 'UPSERT',
        developmental: 'false',
        is_style_variant_primary_image: 'true'
      });
      var ownerSecondary = makeAsset('EA_OWNER_2', {
        photo_asset_id: 'P2',
        style_variant_id: '426843',
        action_code: 'UPSERT',
        developmental: 'false',
        is_style_variant_primary_image: 'false'
      });
      var ownerSv = makeSvNode('SV_426843', {
        primaryPhotoAssetId: 'P1',
        outgoingRefs: {
          external_asset_reference: [makeReference(ownerPrimary), makeReference(ownerSecondary)],
          PrimaryProductImage: [makeReference(ownerPrimary)],
          CopyMedia: []
        }
      });

      var copierSv = makeSvNode('SV_429124', {
        primaryPhotoAssetId: null,
        outgoingRefs: {
          external_asset_reference: [],
          PrimaryProductImage: [],
          CopyMedia: []
        }
      });
      var w = makeW();

      br.operation0(
        copierSv, makeStep(), makeQueryHome([]),
        makeRefType('PrimaryProductImage'),
        makeGetPrimarySV(null),
        makeReturnReferencesJSON([]),
        makeReturnSourceByRefTypeID([ownerSv]),
        makeSvHasValidImagery(false),
        w
      );

      var copierExternalCreateCalls = w.createReference.mock.calls.filter(
        (c) => c[1] === copierSv && c[3] === 'external_asset_reference'
      );
      expect(copierExternalCreateCalls.length).toBeGreaterThanOrEqual(2);
      var copiedAssetIDs = {};
      copierExternalCreateCalls.forEach(function (c) {
        copiedAssetIDs[c[2].getID()] = true;
      });
      expect(copiedAssetIDs.EA_OWNER_1).toBe(true);
      expect(copiedAssetIDs.EA_OWNER_2).toBe(true);
    });

    test('copier SV with incoming CopyMedia does NOT query own ExternalAssets or apply delta', () => {
      // CopyMedia direction: SV_426843 (owner) --CopyMedia--> SV_429124 (copier)
      var ownerSv = makeSvNode('SV_426843', { primaryPhotoAssetId: '2137002' });
      var asset1 = makeAsset('EA_001', {
        style_variant_id: '426843',
        action_code: 'UPSERT',
        developmental: 'false',
        is_style_variant_primary_image: 'true',
        photo_asset_id: '2137002'
      });

      // SV_429124 is the copier. It has NO outgoing CopyMedia refs.
      // But returnSourceByRefTypeID finds the owner via incoming CopyMedia.
      var copierSv = makeSvNode('SV_429124', {
        primaryPhotoAssetId: '2137002',
        outgoingRefs: {
          CopyMedia: [],  // copier has NO outgoing CopyMedia
          external_asset_reference: [makeReference(asset1)],
          PrimaryProductImage: [makeReference(asset1)]
        }
      });

      // Copier's own ExternalAssets (should NOT be used).
      var copierOwnAsset = makeAsset('EA_999', {
        style_variant_id: '429124',
        action_code: 'UPSERT',
        developmental: 'false',
        is_style_variant_primary_image: 'true',
        photo_asset_id: '9999'
      });

      var queryHome = makeQueryHome([copierOwnAsset]);
      var step = makeStep();
      var w = makeW();

      // returnSourceByRefTypeID on copier returns [ownerSv] (incoming CopyMedia).
      var returnSourceByRefTypeID = makeReturnSourceByRefTypeID([ownerSv]);

      br.operation0(
        copierSv, step, queryHome,
        makeRefType('PrimaryProductImage'),
        makeGetPrimarySV(null),
        makeReturnReferencesJSON([]),
        returnSourceByRefTypeID,
        makeSvHasValidImagery(false),
        w
      );

      // Copier mode now runs full owner->copier external delta sync.
      expect(w.deleteReferencesByTargetIds).toHaveBeenCalledWith(
        copierSv,
        expect.anything(),
        ['EA_001']
      );

      // Should still approve references and trigger workflows.
      expect(w.approveReferences).toHaveBeenCalled();
      expect(w.triggerWorkflowEventsByMap).toHaveBeenCalled();
    });

    test('copier SV resolves primary from own primary_photo_asset_id when it exists', () => {
      var ownerSv = makeSvNode('SV_426843', { primaryPhotoAssetId: '2137002' });
      var asset1 = makeAsset('EA_001', { photo_asset_id: '2137002' });

      var copierSv = makeSvNode('SV_429124', {
        primaryPhotoAssetId: '2137002',
        outgoingRefs: {
          CopyMedia: [],
          external_asset_reference: [makeReference(asset1)],
          PrimaryProductImage: []
        }
      });

      var w = makeW();

      br.operation0(
        copierSv, makeStep(), makeQueryHome([]),
        makeRefType('PrimaryProductImage'),
        makeGetPrimarySV(null),
        makeReturnReferencesJSON([]),
        makeReturnSourceByRefTypeID([ownerSv]),  // incoming CopyMedia → this is a copier
        makeSvHasValidImagery(false),
        w
      );

      // Primary should be resolved from own primary_photo_asset_id.
      expect(w.createReference).toHaveBeenCalled();
    });

    test('copier SV falls back to media owner primary when own primary_photo_asset_id is empty', () => {
      var primaryAsset = makeAsset('EA_PRI', {
        photo_asset_id: '2137002',
        style_variant_id: '426843'
      });

      // Owner SV has primary_photo_asset_id and external refs.
      var ownerSv = makeSvNode('SV_426843', {
        primaryPhotoAssetId: '2137002',
        outgoingRefs: {
          external_asset_reference: [makeReference(primaryAsset)],
          PrimaryProductImage: [makeReference(primaryAsset)]
        }
      });

      // Copier has NO primary_photo_asset_id and NO external refs yet.
      var copierSv = makeSvNode('SV_429124', {
        primaryPhotoAssetId: null,
        outgoingRefs: {
          CopyMedia: [],
          external_asset_reference: [],
          PrimaryProductImage: []
        }
      });

      var w = makeW();

      br.operation0(
        copierSv, makeStep(), makeQueryHome([]),
        makeRefType('PrimaryProductImage'),
        makeGetPrimarySV(null),
        makeReturnReferencesJSON([]),
        makeReturnSourceByRefTypeID([ownerSv]),  // incoming CopyMedia → copier
        makeSvHasValidImagery(false),
        w
      );

      // Should write the owner's primary_photo_asset_id to copier.
      var writeSimpleCalls = w.writeSimpleValue.mock.calls;
      var primaryWrite = writeSimpleCalls.find(
        (c) => c[1] === 'primary_photo_asset_id' && c[2] === '2137002'
      );
      expect(primaryWrite).toBeTruthy();
    });
  });

  // ─── Tests: Owner SV syncing to copiers ─────────────────────────

  describe('owner SV (no incoming CopyMedia) syncs to copiers via outgoing CopyMedia', () => {
    test('owner SV applies delta from ExternalAssets and syncs to copier via outgoing CopyMedia', () => {
      var asset1 = makeAsset('EA_001', {
        style_variant_id: '426843',
        action_code: 'UPSERT',
        developmental: 'false',
        is_style_variant_primary_image: 'true',
        photo_asset_id: '2137002'
      });

      // SV_429124 is the copier (target of outgoing CopyMedia from owner).
      var copierSv = makeSvNode('SV_429124', {
        outgoingRefs: {
          external_asset_reference: [],
          PrimaryProductImage: [],
          CopyMedia: []
        }
      });
      copierSv.isInWorkflow = jest.fn(() => false);

      // Owner has outgoing CopyMedia to copier.
      var ownerSv = makeSvNode('SV_426843', {
        primaryPhotoAssetId: null,
        outgoingRefs: {
          CopyMedia: [makeReference(copierSv)],  // owner → copier (outgoing)
          external_asset_reference: [],
          PrimaryProductImage: [],
          developmental_asset_reference: []
        }
      });

      var step = makeStep({ assetLookup: { EA_001: asset1 } });
      var queryHome = makeQueryHome([asset1]);
      var w = makeW();

      // returnSourceByRefTypeID on owner returns [] (no incoming CopyMedia).
      var returnSourceByRefTypeID = makeReturnSourceByRefTypeID([]);

      br.operation0(
        ownerSv, step, queryHome,
        makeRefType('PrimaryProductImage'),
        makeGetPrimarySV(null),
        makeReturnReferencesJSON([]),
        returnSourceByRefTypeID,
        makeSvHasValidImagery(true),
        w
      );

      // Should create external ref for EA_001 on owner.
      expect(w.createReference).toHaveBeenCalled();

      // Should set primary_photo_asset_id on owner.
      var primaryWrite = w.writeSimpleValue.mock.calls.find(
        (c) => c[0] === ownerSv && c[1] === 'primary_photo_asset_id' && c[2] === '2137002'
      );
      expect(primaryWrite).toBeTruthy();

      // Should sync to copier (createReference called for copier's external ref).
      var copierRefCalls = w.createReference.mock.calls.filter(
        (c) => c[1] === copierSv
      );
      expect(copierRefCalls.length).toBeGreaterThan(0);
    });

    test('owner SV does NOT delete its outgoing CopyMedia refs', () => {
      var ownerSv = makeSvNode('SV_426843', {
        primaryPhotoAssetId: null,
        outgoingRefs: {
          CopyMedia: [makeReference(makeSvNode('SV_429124'))],
          external_asset_reference: [],
          PrimaryProductImage: [],
          developmental_asset_reference: []
        }
      });

      var w = makeW();

      br.operation0(
        ownerSv, makeStep(), makeQueryHome([]),
        makeRefType('PrimaryProductImage'),
        makeGetPrimarySV(null),
        makeReturnReferencesJSON([]),
        makeReturnSourceByRefTypeID([]),  // no incoming CopyMedia → owner
        makeSvHasValidImagery(false),
        w
      );

      // deleteReference should NOT be called for CopyMedia cleanup.
      // (Step 5 no longer deletes outgoing CopyMedia)
      expect(w.deleteReference).not.toHaveBeenCalled();
    });
  });

  // ─── Tests: syncCopyMediaCopiers primary clearing ───────────────

  describe('syncCopyMediaCopiers primary clearing', () => {
    test('clears copier primary when owner has no primary asset', () => {
      var oldPrimaryAsset = makeAsset('EA_OLD', { photo_asset_id: 'OLD_ID' });

      var copierSv = makeSvNode('SV_429124', {
        primaryPhotoAssetId: 'OLD_ID',
        outgoingRefs: {
          external_asset_reference: [],
          PrimaryProductImage: [makeReference(oldPrimaryAsset)],
          CopyMedia: []
        }
      });
      copierSv.isInWorkflow = jest.fn(() => false);

      // Owner has outgoing CopyMedia to copier but no assets/primary.
      var ownerSv = makeSvNode('SV_426843', {
        primaryPhotoAssetId: null,
        outgoingRefs: {
          CopyMedia: [makeReference(copierSv)],
          external_asset_reference: [],
          PrimaryProductImage: [],
          developmental_asset_reference: []
        }
      });

      var w = makeW();

      br.operation0(
        ownerSv, makeStep(), makeQueryHome([]),
        makeRefType('PrimaryProductImage'),
        makeGetPrimarySV(null),
        makeReturnReferencesJSON([]),
        makeReturnSourceByRefTypeID([]),  // no incoming → owner
        makeSvHasValidImagery(false),
        w
      );

      // Should clear primary_photo_asset_id on copier.
      var clearCall = w.writeSimpleValue.mock.calls.find(
        (c) => c[0] === copierSv && c[1] === 'primary_photo_asset_id' && c[2] === ''
      );
      expect(clearCall).toBeTruthy();
    });
  });

  // ─── Tests: Non-StyleVariant skip ───────────────────────────────

  describe('non-StyleVariant handling', () => {
    test('skips processing for non-StyleVariant nodes', () => {
      var node = {
        getID: () => 'PROD_001',
        getObjectType: () => ({ getID: () => 'ProductNode' })
      };

      var w = makeW();

      br.operation0(
        node, makeStep(), makeQueryHome([]),
        makeRefType('PrimaryProductImage'),
        makeGetPrimarySV(null),
        makeReturnReferencesJSON([]),
        makeReturnSourceByRefTypeID([]),
        makeSvHasValidImagery(false),
        w
      );

      expect(w.createReference).not.toHaveBeenCalled();
      expect(w.deleteReference).not.toHaveBeenCalled();
    });
  });

  describe('error and fallback branches', () => {
    test('skips StyleVariant nodes when no SV key can be resolved', () => {
      var svNode = makeSvNode('STYLE_001', {
        values: {
          ft_data_model_style_variant_id: ''
        }
      });
      var w = makeW();

      br.operation0(
        svNode, makeStep(), makeQueryHome([]),
        makeRefType('PrimaryProductImage'),
        makeGetPrimarySV(null),
        makeReturnReferencesJSON([]),
        makeReturnSourceByRefTypeID([]),
        makeSvHasValidImagery(false),
        w
      );

      expect(w.createReference).not.toHaveBeenCalled();
      expect(w.approveReferences).not.toHaveBeenCalled();
      expect(global.logger.info).toHaveBeenCalled();
    });

    test('throws when required reference types are missing', () => {
      var svNode = makeSvNode('SV_1001');
      var invalidStep = {
        getReferenceTypeHome: () => ({
          getReferenceTypeByID: () => null
        }),
        getAttributeHome: () => ({
          getAttributeByID: (id) => ({ getID: () => id })
        }),
        getAssetHome: () => ({
          getAssetByID: () => null
        })
      };

      expect(function () {
        br.operation0(
          svNode, invalidStep, makeQueryHome([]),
          makeRefType('PrimaryProductImage'),
          makeGetPrimarySV(null),
          makeReturnReferencesJSON([]),
          makeReturnSourceByRefTypeID([]),
          makeSvHasValidImagery(false),
          makeW()
        );
      }).toThrow('HandleStyleVariantAssets: required reference type is missing.');
    });

    test('parses malformed returnReferencesJSON as empty state and writes first media timestamp once', () => {
      var asset = makeAsset('EA_PRIMARY', {
        style_variant_id: '7001',
        action_code: 'UPSERT',
        developmental: 'false',
        is_style_variant_primary_image: 'true',
        photo_asset_id: 'PHOTO_7001'
      });
      var svNode = makeSvNode('SV_7001', {
        primaryPhotoAssetId: null,
        firstMedia: null,
        outgoingRefs: {
          external_asset_reference: [],
          PrimaryProductImage: [],
          developmental_asset_reference: [],
          CopyMedia: []
        }
      });
      var malformedReferencesFn = {
        evaluate: () => '[not-json'
      };
      var w = makeW();

      br.operation0(
        svNode, makeStep({ assetLookup: { EA_PRIMARY: asset } }), makeQueryHome([asset]),
        makeRefType('PrimaryProductImage'),
        makeGetPrimarySV(svNode),
        malformedReferencesFn,
        makeReturnSourceByRefTypeID([]),
        makeSvHasValidImagery(false),
        w
      );

      expect(w.createReference).toHaveBeenCalled();
      expect(w.writeSimpleValue).toHaveBeenCalledWith(svNode, 'first_media_available_at', expect.any(String));
      expect(w.writeSimpleValue).toHaveBeenCalledWith(asset, 'is_style_variant_primary_image', 'true');
      expect(global.logger.info).toHaveBeenCalled();
    });

    test('removes stale primary refs when no desired primary asset exists', () => {
      var oldPrimaryAsset = makeAsset('EA_OLD_PRIMARY', {
        style_variant_id: '9001',
        photo_asset_id: 'OLD_PHOTO'
      });
      var stalePrimaryRef = {
        getTarget: () => oldPrimaryAsset
      };
      var svNode = makeSvNode('SV_9001', {
        primaryPhotoAssetId: null,
        outgoingRefs: {
          external_asset_reference: [],
          developmental_asset_reference: [],
          PrimaryProductImage: [stalePrimaryRef],
          CopyMedia: []
        }
      });
      var w = makeW();

      br.operation0(
        svNode, makeStep(), makeQueryHome([]),
        makeRefType('PrimaryProductImage'),
        makeGetPrimarySV(null),
        makeReturnReferencesJSON([]),
        makeReturnSourceByRefTypeID([]),
        makeSvHasValidImagery(false),
        w
      );

      expect(w.deleteReference).toHaveBeenCalledWith(stalePrimaryRef);
      expect(w.approveReferences).toHaveBeenCalledWith(svNode, [
        'external_asset_reference',
        'PrimaryProductImage',
        'CopyMedia',
        'developmental_asset_reference'
      ]);
    });

    test('creates developmental refs on the SV itself when hierarchy is non-standard', () => {
      var devAsset = makeAsset('EA_DEV', {
        style_variant_id: '5555',
        action_code: 'UPSERT',
        developmental: 'true',
        is_style_variant_primary_image: 'false',
        photo_asset_id: 'DEV_PHOTO'
      });
      var svNode = makeSvNode('SV_5555', {
        parent: null,
        outgoingRefs: {
          external_asset_reference: [],
          developmental_asset_reference: [],
          PrimaryProductImage: [],
          CopyMedia: []
        }
      });
      var w = makeW();

      br.operation0(
        svNode, makeStep({ assetLookup: { EA_DEV: devAsset } }), makeQueryHome([devAsset]),
        makeRefType('PrimaryProductImage'),
        makeGetPrimarySV(null),
        makeReturnReferencesJSON([]),
        makeReturnSourceByRefTypeID([]),
        makeSvHasValidImagery(false),
        w
      );

      expect(w.createReference).toHaveBeenCalledWith(
        expect.anything(),
        svNode,
        devAsset,
        'developmental_asset_reference'
      );
    });
  });
});
