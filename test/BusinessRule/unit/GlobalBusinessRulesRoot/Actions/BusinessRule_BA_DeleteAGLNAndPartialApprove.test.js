const br = require('../../../../../step-config/BusinessRule/BusinessRule_BA_DeleteAGLNAndPartialApprove');

describe('BusinessRule_BA_DeleteAGLNAndPartialApprove', () => {
  test('deletes a_GLN and uses PartialApproveField library to partially approve a_GLN', () => {
    const deleteCurrent = jest.fn();
    const approve = jest.fn();
    const partialApproveLib = {
      partialApproveFields: jest.fn(),
    };
    const node = {
      getId: jest.fn(() => 'NODE_1'),
      getValue: jest.fn(() => ({
        deleteCurrent,
      })),
      approve,
    };

    br.operation0(node, { info: jest.fn() }, partialApproveLib);

    expect(deleteCurrent).toHaveBeenCalledTimes(1);
    expect(partialApproveLib.partialApproveFields).toHaveBeenCalledTimes(1);
    expect(partialApproveLib.partialApproveFields).toHaveBeenCalledWith(node, ['a_GLN'], false, false);
    expect(approve).not.toHaveBeenCalled();
  });

  test('falls back to standard approve when partial approve library is unavailable', () => {
    const deleteCurrent = jest.fn();
    const approve = jest.fn();
    const node = {
      getId: jest.fn(() => 'NODE_2'),
      getValue: jest.fn(() => ({
        deleteCurrent,
      })),
      approve,
    };

    br.operation0(node, { info: jest.fn() }, null);

    expect(deleteCurrent).toHaveBeenCalledTimes(1);
    expect(approve).toHaveBeenCalledTimes(1);
    expect(approve.mock.calls[0]).toHaveLength(0);
  });

  test('falls back to standard approve when partialApproveFields function is missing', () => {
    const deleteCurrent = jest.fn();
    const approve = jest.fn();
    const node = {
      getId: jest.fn(() => 'NODE_3'),
      getValue: jest.fn(() => ({
        deleteCurrent,
      })),
      approve,
    };

    br.operation0(node, { info: jest.fn() }, {});

    expect(deleteCurrent).toHaveBeenCalledTimes(1);
    expect(approve).toHaveBeenCalledTimes(1);
  });
});