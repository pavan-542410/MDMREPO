const br = require('../../../../../step-configs/BusinessRule/BusinessRule_PopulateCopyMediaReference');

describe('PopulateCopyMediaReference', () => {
  test('creates CopyMedia reference when SV id is found in latest sample note', () => {
    const node = {
      getValue: () => ({ getSimpleValue: () => 'Media has been copied from SV_123 by user on date\nolder note' })
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

    expect(getProductByID).toHaveBeenCalledWith('SV_123');
    expect(source.createReference).toHaveBeenCalledWith(node, refType);
  });

  test('no-ops when note does not contain SV id', () => {
    const node = {
      getValue: () => ({ getSimpleValue: () => 'No copy marker present' })
    };
    const getProductByID = jest.fn();
    const step = {
      getProductHome: () => ({
        getProductByID
      })
    };

    br.operation0(node, step, {});

    expect(getProductByID).not.toHaveBeenCalled();
  });
});
