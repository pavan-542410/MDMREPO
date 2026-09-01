const br = require('../../../../../step-configs/BusinessRule/BusinessRule_CopyMediaWithDefault');

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

describe('CopyMediaWithDefault (integration)', () => {
  test('warns when default source cannot be resolved', () => {
    const target = { getName: () => 'SV Target', approve: jest.fn() };
    const ui = {
      getSelection: () => makeSelection([target]),
      getSelectedSetOfNodes: () => makeSelection([]),
      showAlert: jest.fn()
    };

    br.operation0(
      ui,
      {},
      {},
      {},
      { evaluate: () => JSON.stringify({}) },
      { evaluate: () => null },
      {},
      { copyMedia: jest.fn(), updateNotes: jest.fn(), sendToHangtagService: jest.fn() }
    );

    expect(ui.showAlert).toHaveBeenCalledWith('WARNING', 'No Style Variant appears to be available.');
  });

  test('shows error when copyMedia library returns false', () => {
    const target = { getName: () => 'SV Target', approve: jest.fn() };
    const source = { getName: () => 'SV Source' };
    const ui = {
      getSelection: () => makeSelection([target]),
      getSelectedSetOfNodes: () => makeSelection([]),
      showAlert: jest.fn()
    };

    br.operation0(
      ui,
      {},
      {},
      {},
      { evaluate: () => JSON.stringify({}) },
      { evaluate: () => source },
      {},
      { copyMedia: () => false, updateNotes: jest.fn(), sendToHangtagService: jest.fn() }
    );

    expect(ui.showAlert).toHaveBeenCalledWith(
      'ERROR',
      'Something was borked. Double check that the source SV has media available in PCH.'
    );
    expect(target.approve).not.toHaveBeenCalled();
  });
});
