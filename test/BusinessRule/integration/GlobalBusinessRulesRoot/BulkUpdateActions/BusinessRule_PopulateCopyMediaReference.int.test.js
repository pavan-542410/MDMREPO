const br = require('../../../../../step-configs/BusinessRule/BusinessRule_PopulateCopyMediaReference');

describe('PopulateCopyMediaReference (integration)', () => {
  test('uses only most recent sample note line to resolve source SV', () => {
    const node = {
      getValue: () => ({ getSimpleValue: () => 'Media has been copied from SV_777 by user\nMedia has been copied from SV_111 by user' })
    };
    const source = { createReference: jest.fn() };
    const getProductByID = jest.fn(() => source);
    const step = {
      getProductHome: () => ({
        getProductByID
      })
    };
    const refType = { getID: () => 'CopyMedia' };

    br.operation0(node, step, refType);

    expect(getProductByID).toHaveBeenCalledWith('SV_777');
    expect(source.createReference).toHaveBeenCalledWith(node, refType);
  });

  test('null-guard path: missing source SV no-ops without throw', () => {
    const node = {
      getValue: () => ({ getSimpleValue: () => 'Media has been copied from SV_999 by user' })
    };
    const getProductByID = jest.fn(() => null);
    const step = {
      getProductHome: () => ({
        getProductByID
      })
    };

    expect(() => br.operation0(node, step, {})).not.toThrow();
    expect(getProductByID).toHaveBeenCalledWith('SV_999');
  });
});
