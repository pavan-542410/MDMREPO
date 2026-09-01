const merchOps = require('../../../../../step-configs/BusinessRule/BusinessRule_merchOperationsLibrary');

function makeValueBag(initial) {
  const state = Object.assign({}, initial || {});
  const calls = {};

  return {
    state,
    calls,
    getValue: (attrID) => {
      if (!calls[attrID]) calls[attrID] = jest.fn();
      return {
        getSimpleValue: () => state[attrID],
        setSimpleValue: (val) => {
          calls[attrID](val);
          state[attrID] = val;
        }
      };
    }
  };
}

describe('BusinessRule_merchOperationsLibrary.setFirstMediaAvailableIfMissing', () => {
  beforeEach(() => {
    global.dt = { nowISO: jest.fn(() => '2026-02-26 10:00:00') };
  });

  afterEach(() => {
    delete global.dt;
    delete global.u;
    delete global.wf;
  });

  test('sets first_media_available_at when empty', () => {
    const node = makeValueBag({
      first_media_available_at: ''
    });

    merchOps.setFirstMediaAvailableIfMissing(node);

    expect(global.dt.nowISO).toHaveBeenCalledTimes(1);
    expect(node.calls.first_media_available_at).toHaveBeenCalledWith('2026-02-26 10:00:00');
  });

  test('does not overwrite existing first_media_available_at value', () => {
    const node = makeValueBag({
      first_media_available_at: '2026-01-01 01:02:03'
    });

    merchOps.setFirstMediaAvailableIfMissing(node);

    expect(global.dt.nowISO).not.toHaveBeenCalled();
    expect(node.calls.first_media_available_at).not.toHaveBeenCalled();
    expect(node.state.first_media_available_at).toBe('2026-01-01 01:02:03');
  });
});

describe('BusinessRule_merchOperationsLibrary.copyMedia', () => {
  beforeEach(() => {
    global.dt = { nowISO: jest.fn(() => '2026-02-26 10:00:00') };
    global.u = { smartReferenceCreate: jest.fn() };
    global.wf = { triggerWfFromMapNoWebUI: jest.fn() };
  });

  afterEach(() => {
    delete global.dt;
    delete global.u;
    delete global.wf;
  });

  test('updates notes and sets sample fields on target when missing', () => {
    const externalRefType = { getID: () => 'external_asset_reference' };
    const primaryRefType = { getID: () => 'PrimaryProductImage' };
    const copyMediaRefType = { getID: () => 'CopyMedia' };

    const step = {
      getReferenceTypeHome: () => ({
        getReferenceTypeByID: (id) => {
          if (id === 'external_asset_reference') return externalRefType;
          if (id === 'PrimaryProductImage') return primaryRefType;
          if (id === 'CopyMedia') return copyMediaRefType;
          return null;
        }
      }),
      getCurrentUser: () => ({ getName: () => 'Test User' })
    };

    const sourceBag = makeValueBag({
      sample_notes: 'source note',
      primary_photo_asset_id: 'PHOTO_1'
    });

    const targetBag = makeValueBag({
      sample_notes: 'target note',
      primary_photo_asset_id: '',
      first_media_available_at: ''
    });

    const sourceAssetRefs = [
      { getTarget: () => ({ getID: () => 'EA_1' }) }
    ];

    const sourcePrimaryRefs = [
      { getTarget: () => ({ getID: () => 'EA_1' }) }
    ];

    const sourceCopyMediaRefs = [
      { delete: jest.fn() }
    ];

    const source = {
      getID: () => 'SV_SOURCE',
      getObjectType: () => ({ getID: () => 'StyleVariant' }),
      getValue: sourceBag.getValue,
      queryReferences: (refType) => {
        const id = refType.getID();
        if (id === 'external_asset_reference') {
          return { asList: () => ({ toArray: () => sourceAssetRefs }) };
        }
        if (id === 'PrimaryProductImage') {
          return { asList: () => ({ toArray: () => sourcePrimaryRefs }) };
        }
        if (id === 'CopyMedia') {
          return { asList: () => ({ toArray: () => sourceCopyMediaRefs }) };
        }
        return { asList: () => ({ toArray: () => [] }) };
      }
    };

    const deletedRefs = [];

    const target = {
      getID: () => 'SV_TARGET',
      getObjectType: () => ({ getID: () => 'StyleVariant' }),
      getValue: targetBag.getValue,
      queryReferences: () => ({
        asList: () => ({
          toArray: () => [
            { delete: () => deletedRefs.push(true) }
          ]
        })
      }),
      createReference: jest.fn()
    };

    const result = merchOps.copyMedia(source, target, step);

    expect(result).toBe(true);
    expect(target.createReference).toHaveBeenCalledTimes(2);
    expect(global.wf.triggerWfFromMapNoWebUI).toHaveBeenCalledTimes(1);
    expect(sourceCopyMediaRefs[0].delete).toHaveBeenCalledTimes(1);
    expect(global.u.smartReferenceCreate).toHaveBeenCalledWith(source, copyMediaRefType, target);

    expect(targetBag.state.sample_notes).toContain('Media has been copied from SV_SOURCE');
    expect(sourceBag.state.sample_notes).toContain('Media has been copied to SV_TARGET');

    expect(targetBag.state.first_media_available_at).toBe('2026-02-26 10:00:00');
  });
});
