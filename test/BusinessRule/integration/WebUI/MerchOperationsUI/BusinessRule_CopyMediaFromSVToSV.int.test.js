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

describe('CopyMediaFromSVToSV (integration)', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
  });

  afterEach(() => {
    delete global.logger;
  });

  test('guard path: warns when multiple targets are selected', () => {
    const ui = {
      getSelection: () => makeSelection([{}, {}]),
      getSelectedSetOfNodes: () => makeSelection([{}]),
      showAlert: jest.fn()
    };

    br.operation0(ui, {}, {}, {}, {}, {}, {});

    expect(ui.showAlert).toHaveBeenCalledWith(
      'WARNING',
      'Only one Style Variant may be selected to receive media from another Style Variant'
    );
  });

  test('shows error when copy operation cannot execute due to object types', () => {
    const source = {
      getID: () => 'EA_1',
      getName: () => 'EA 1',
      getObjectType: () => ({ getID: () => 'ExternalAsset' }),
      queryReferences: () => ({ asList: () => ({ toArray: () => [] }) })
    };
    const target = {
      getID: () => 'SV_1',
      getName: () => 'SV 1',
      getObjectType: () => ({ getID: () => 'StyleVariant' }),
      queryReferences: () => ({ asList: () => ({ toArray: () => [] }) }),
      createReference: jest.fn(),
      getValue: () => ({ getSimpleValue: () => '', setSimpleValue: jest.fn() }),
      getManager: () => ({ getCurrentUser: () => ({ getName: () => 'Tester' }) })
    };
    const ui = {
      getSelection: () => makeSelection([target]),
      getSelectedSetOfNodes: () => makeSelection([source]),
      showAlert: jest.fn()
    };

    br.operation0(
      ui,
      { getID: () => 'external_asset_reference' },
      { getID: () => 'PrimaryProductImage' },
      { post: jest.fn() },
      { evaluate: () => JSON.stringify({}) },
      { nowISO: () => '2026-04-03 11:00:00' },
      { triggerWorkflowEvent: jest.fn() }
    );

    expect(ui.showAlert).toHaveBeenCalledWith(
      'ERROR',
      'Something was borked. Please reach out to the PCH Eng team.'
    );
  });
});
