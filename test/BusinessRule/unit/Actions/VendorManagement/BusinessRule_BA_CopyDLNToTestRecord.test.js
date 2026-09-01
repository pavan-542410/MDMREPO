const br = require('../../../../../step-config/BusinessRule/BusinessRule_BA_CopyDLNToTestRecord');

function makeNode(sourceValue) {
  const targetSetter = jest.fn();

  return {
    node: {
      getId: jest.fn(() => 'NODE_1'),
      getValue: jest.fn((attrId) => {
        if (attrId === 'a_DLN') {
          return {
            getSimpleValue: jest.fn(() => sourceValue),
          };
        }

        if (attrId === 'a_TestRecord') {
          return {
            setSimpleValue: targetSetter,
          };
        }

        return {
          getSimpleValue: jest.fn(() => null),
          setSimpleValue: jest.fn(),
        };
      }),
    },
    targetSetter,
  };
}

describe('BusinessRule_BA_CopyDLNToTestRecord', () => {
  test('copies a_DLN to a_TestRecord when source has value', () => {
    const { node, targetSetter } = makeNode('DLN-12345');
    const logger = { info: jest.fn() };

    br.operation0(node, logger);

    expect(targetSetter).toHaveBeenCalledTimes(1);
    expect(targetSetter).toHaveBeenCalledWith('DLN-12345');
  });

  test('does not write a_TestRecord when source is null', () => {
    const { node, targetSetter } = makeNode(null);
    const logger = { info: jest.fn() };

    br.operation0(node, logger);

    expect(targetSetter).not.toHaveBeenCalled();
  });

  test('does not write a_TestRecord when source is empty string', () => {
    const { node, targetSetter } = makeNode('');
    const logger = { info: jest.fn() };

    br.operation0(node, logger);

    expect(targetSetter).not.toHaveBeenCalled();
  });
});