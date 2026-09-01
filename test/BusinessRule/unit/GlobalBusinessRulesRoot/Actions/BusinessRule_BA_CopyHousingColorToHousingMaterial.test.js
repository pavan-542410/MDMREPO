const br = require('../../../../../step-config/BusinessRule/BusinessRule_BA_CopyHousingColorToHousingMaterial');

function makeNode(sourceValue) {
  const targetSetter = jest.fn();
  const sourceDelete = jest.fn();
  const approve = jest.fn();

  return {
    node: {
      getId: jest.fn(() => 'NODE_1'),
      getValue: jest.fn((attrId) => {
        if (attrId === 'HousingColor') {
          return {
            getSimpleValue: jest.fn(() => sourceValue),
            deleteCurrent: sourceDelete,
          };
        }

        if (attrId === 'HousingMaterial') {
          return {
            setSimpleValue: targetSetter,
          };
        }

        return {
          getSimpleValue: jest.fn(() => null),
          setSimpleValue: jest.fn(),
          deleteCurrent: jest.fn(),
        };
      }),
      approve,
    },
    targetSetter,
    sourceDelete,
    approve,
  };
}

describe('BusinessRule_BA_CopyHousingColorToHousingMaterial', () => {
  test('copies HousingColor to HousingMaterial, clears the source, and approves the node', () => {
    const { node, targetSetter, sourceDelete, approve } = makeNode('Blue');
    const logger = { info: jest.fn() };

    br.operation0(node, logger);

    expect(targetSetter).toHaveBeenCalledTimes(1);
    expect(targetSetter).toHaveBeenCalledWith('Blue');
    expect(sourceDelete).toHaveBeenCalledTimes(1);
    expect(approve).toHaveBeenCalledTimes(1);
  });

  test('still approves the node when HousingColor is empty', () => {
    const { node, targetSetter, sourceDelete, approve } = makeNode('');
    const logger = { info: jest.fn() };

    br.operation0(node, logger);

    expect(targetSetter).not.toHaveBeenCalled();
    expect(sourceDelete).not.toHaveBeenCalled();
    expect(approve).toHaveBeenCalledTimes(1);
  });

  test('still approves the node when HousingColor is null', () => {
    const { node, targetSetter, sourceDelete, approve } = makeNode(null);
    const logger = { info: jest.fn() };

    br.operation0(node, logger);

    expect(targetSetter).not.toHaveBeenCalled();
    expect(sourceDelete).not.toHaveBeenCalled();
    expect(approve).toHaveBeenCalledTimes(1);
  });
});