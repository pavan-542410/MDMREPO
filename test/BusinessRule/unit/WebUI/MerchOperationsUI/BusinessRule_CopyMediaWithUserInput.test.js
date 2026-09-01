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

describe('CopyMediaWithUserInput', () => {
  test('warns when source selection is not exactly one', () => {
    const ui = {
      getSelection: () => makeSelection([{}]),
      getSelectedSetOfNodes: () => makeSelection([{}, {}]),
      showAlert: jest.fn()
    };

    br.operation0(ui, {}, {}, {}, {}, {}, {}, {}, {});

    expect(ui.showAlert).toHaveBeenCalledWith(
      'WARNING',
      'Only one Style Variant may be selected to copy media from another Style Variant'
    );
  });

  test('happy path orchestrates copy and approval', () => {
    const source = { getName: () => 'SV Source' };
    const target = { getName: () => 'SV Target', approve: jest.fn() };
    const ui = {
      getSelection: () => makeSelection([target]),
      getSelectedSetOfNodes: () => makeSelection([source]),
      showAlert: jest.fn()
    };
    const mopLib = {
      copyMedia: jest.fn(() => true),
      updateNotes: jest.fn(),
      sendToHangtagService: jest.fn()
    };

    br.operation0(
      ui,
      {},
      {},
      {},
      { evaluate: () => JSON.stringify({ sample: 'ok' }) },
      {},
      {},
      {},
      mopLib
    );

    expect(mopLib.copyMedia).toHaveBeenCalledWith(source, target, {});
    expect(mopLib.updateNotes).toHaveBeenCalledWith(source, target, {});
    expect(mopLib.sendToHangtagService).toHaveBeenCalledTimes(1);
    expect(target.approve).toHaveBeenCalledTimes(1);
  });
});
