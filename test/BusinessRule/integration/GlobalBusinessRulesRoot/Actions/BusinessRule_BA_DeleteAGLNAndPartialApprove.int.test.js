const br = require('../../../../../step-config/BusinessRule/BusinessRule_BA_DeleteAGLNAndPartialApprove');

describe('BusinessRule_BA_DeleteAGLNAndPartialApprove (integration)', () => {
  test('deletes a_GLN and partially approves only the a_GLN field', () => {
    const values = {
      a_GLN: '1234567890123',
    };

    const node = {
      getId: jest.fn(() => 'SUP_1001'),
      getValue: jest.fn((attrId) => {
        if (attrId === 'a_GLN') {
          return {
            deleteCurrent: jest.fn(() => {
              values.a_GLN = null;
            }),
          };
        }

        return {
          deleteCurrent: jest.fn(),
        };
      }),
      approve: jest.fn(),
    };

    const partialApproveLib = {
      partialApproveFields: jest.fn(),
    };

    br.operation0(node, { info: jest.fn() }, partialApproveLib);

    expect(values.a_GLN).toBeNull();
    expect(partialApproveLib.partialApproveFields).toHaveBeenCalledTimes(1);
    expect(partialApproveLib.partialApproveFields).toHaveBeenCalledWith(node, ['a_GLN'], false, false);
    expect(node.approve).not.toHaveBeenCalled();
  });
});