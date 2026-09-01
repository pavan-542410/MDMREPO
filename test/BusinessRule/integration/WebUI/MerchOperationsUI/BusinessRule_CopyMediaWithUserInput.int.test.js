const br = require('../../../../../step-configs/BusinessRule/BusinessRule_CopyMediaWithUserInput');

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

describe('CopyMediaWithUserInput (integration)', () => {
  test('warns when target selection is not exactly one', () => {
    const ui = {
      getSelection: () => makeSelection([{}, {}]),
      getSelectedSetOfNodes: () => makeSelection([{}]),
      showAlert: jest.fn()
    };

    br.operation0(ui, {}, {}, {}, {}, {}, {}, {}, {});

    expect(ui.showAlert).toHaveBeenCalledWith(
      'WARNING',
      'Only one Style Variant may be selected to receive media from another Style Variant'
    );
  });

  test('shows error and skips approval when copy fails', () => {
    const source = { getName: () => 'SV Source' };
    const target = { getName: () => 'SV Target', approve: jest.fn() };
    const ui = {
      getSelection: () => makeSelection([target]),
      getSelectedSetOfNodes: () => makeSelection([source]),
      showAlert: jest.fn()
    };

    br.operation0(
      ui,
      {},
      {},
      {},
      { evaluate: () => JSON.stringify({}) },
      {},
      {},
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
