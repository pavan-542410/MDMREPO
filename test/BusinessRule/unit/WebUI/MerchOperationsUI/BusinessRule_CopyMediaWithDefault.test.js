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

describe('CopyMediaWithDefault', () => {
  test('warns when target selection is not exactly one', () => {
    const ui = {
      getSelection: () => makeSelection([{}, {}]),
      getSelectedSetOfNodes: () => makeSelection([]),
      showAlert: jest.fn()
    };

    br.operation0(ui, {}, {}, {}, {}, {}, {}, {});

    expect(ui.showAlert).toHaveBeenCalledWith(
      'WARNING',
      'Only one Style Variant may be selected to receive media from another Style Variant'
    );
  });

  test('happy path copies media, updates notes, sends hangtag request, and approves target', () => {
    const target = { getName: () => 'SV Target', approve: jest.fn() };
    const source = { getName: () => 'SV Source' };
    const ui = {
      getSelection: () => makeSelection([target]),
      getSelectedSetOfNodes: () => makeSelection([]),
      showAlert: jest.fn()
    };
    const returnSVtoCopyMediaFrom = { evaluate: jest.fn(() => source) };
    const mopLib = {
      copyMedia: jest.fn(() => true),
      updateNotes: jest.fn(),
      sendToHangtagService: jest.fn()
    };
    const returnHangtagJSON = { evaluate: jest.fn(() => JSON.stringify({ sample: 'ok' })) };

    br.operation0(ui, {}, {}, {}, returnHangtagJSON, returnSVtoCopyMediaFrom, {}, mopLib);

    expect(mopLib.copyMedia).toHaveBeenCalledWith(source, target, {});
    expect(mopLib.updateNotes).toHaveBeenCalledWith(source, target, {});
    expect(mopLib.sendToHangtagService).toHaveBeenCalledTimes(1);
    expect(target.approve).toHaveBeenCalledTimes(1);
    expect(ui.showAlert).toHaveBeenCalledWith('INFO', expect.stringMatching(/Media has been successfully copied/));
  });
});
