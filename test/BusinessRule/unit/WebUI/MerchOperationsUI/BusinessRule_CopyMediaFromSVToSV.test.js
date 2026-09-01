const br = require('../../../../../step-configs/BusinessRule/BusinessRule_CopyMediaFromSVToSV');

function makeSelection(nodes) {
  return {
    size: () => nodes.length,
    get: (idx) => nodes[idx],
    iterator: () => {
      let i = 0;
      return {
        next: () => nodes[i++]
      };
    }
  };
}

function makeReference(id) {
  return {
    getTarget: () => ({ getID: () => id }),
    delete: jest.fn()
  };
}

describe('CopyMediaFromSVToSV', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
  });

  afterEach(() => {
    delete global.logger;
  });

  test('copies media, triggers workflows, and safely handles empty sample_notes', () => {
    const sourceAssetRefs = [makeReference('EA_1')];
    const sourcePrimaryRefs = [makeReference('EA_2')];
    const targetExistingAssetRefs = [makeReference('EA_OLD_1')];
    const targetExistingPrimaryRefs = [makeReference('EA_OLD_2')];

    const source = {
      getID: () => 'SV_SOURCE',
      getName: () => 'SV Source',
      getObjectType: () => ({ getID: () => 'StyleVariant' }),
      queryReferences: (refType) => ({
        asList: () => ({
          toArray: () => (refType.getID() === 'external_asset_reference' ? sourceAssetRefs : sourcePrimaryRefs)
        })
      })
    };

    const notes = { value: '' };
    const target = {
      getID: () => 'SV_TARGET',
      getName: () => 'SV Target',
      getObjectType: () => ({ getID: () => 'StyleVariant' }),
      queryReferences: (refType) => ({
        asList: () => ({
          toArray: () => (refType.getID() === 'external_asset_reference' ? targetExistingAssetRefs : targetExistingPrimaryRefs)
        })
      }),
      createReference: jest.fn(),
      getValue: () => ({
        getSimpleValue: () => notes.value,
        setSimpleValue: (v) => { notes.value = v; }
      }),
      getManager: () => ({
        getCurrentUser: () => ({ getName: () => 'Unit Tester' })
      })
    };

    const ui = {
      getSelection: () => makeSelection([target]),
      getSelectedSetOfNodes: () => makeSelection([source]),
      showAlert: jest.fn()
    };
    const giep = {
      post: () => {
        const req = {
          body: jest.fn(() => req),
          invokeBytes: jest.fn(() => 'ok')
        };
        return req;
      }
    };
    const returnHangtagJSON = {
      evaluate: jest.fn(() => JSON.stringify({ tag: 'sample' }))
    };
    const dt = { nowISO: jest.fn(() => '2026-04-03 10:00:00') };
    const workflowHelpers = { triggerWorkflowEvent: jest.fn() };
    const assetRefType = { getID: () => 'external_asset_reference' };
    const primaryRefType = { getID: () => 'PrimaryProductImage' };

    expect(() => br.operation0(ui, assetRefType, primaryRefType, giep, returnHangtagJSON, dt, workflowHelpers))
      .not.toThrow();

    expect(target.createReference).toHaveBeenCalledTimes(2);
    expect(targetExistingAssetRefs[0].delete).toHaveBeenCalledTimes(1);
    expect(targetExistingPrimaryRefs[0].delete).toHaveBeenCalledTimes(1);
    expect(workflowHelpers.triggerWorkflowEvent).toHaveBeenCalledTimes(2);
    expect(ui.showAlert).toHaveBeenCalledWith('INFO', expect.stringMatching(/Media has been successfully copied/));
    expect(notes.value).toContain('Media has been copied from SV_SOURCE');
  });

  test('does not call hangtag service when notes already contain copy marker', () => {
    const source = {
      getID: () => 'SV_SOURCE',
      getName: () => 'SV Source',
      getObjectType: () => ({ getID: () => 'StyleVariant' }),
      queryReferences: () => ({
        asList: () => ({ toArray: () => [] })
      })
    };
    const notes = { value: 'Media has been copied from SV_123 by User on 2026-03-01 10:00:00' };
    const target = {
      getID: () => 'SV_TARGET',
      getName: () => 'SV Target',
      getObjectType: () => ({ getID: () => 'StyleVariant' }),
      queryReferences: () => ({
        asList: () => ({ toArray: () => [] })
      }),
      createReference: jest.fn(),
      getValue: () => ({
        getSimpleValue: () => notes.value,
        setSimpleValue: (v) => { notes.value = v; }
      }),
      getManager: () => ({
        getCurrentUser: () => ({ getName: () => 'Unit Tester' })
      })
    };
    const ui = {
      getSelection: () => makeSelection([target]),
      getSelectedSetOfNodes: () => makeSelection([source]),
      showAlert: jest.fn()
    };
    const giep = { post: jest.fn() };
    const workflowHelpers = { triggerWorkflowEvent: jest.fn() };

    br.operation0(
      ui,
      { getID: () => 'external_asset_reference' },
      { getID: () => 'PrimaryProductImage' },
      giep,
      { evaluate: () => JSON.stringify({ tag: 'sample' }) },
      { nowISO: () => '2026-04-03 10:00:00' },
      workflowHelpers
    );

    expect(giep.post).not.toHaveBeenCalled();
  });
});
