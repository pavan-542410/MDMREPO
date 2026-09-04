const br = require('../../../../../step-config/BusinessRule/BusinessRule_BA_CopyCarColourToCardTypeAndNotify');

function makeNode(sourceValue) {
  const targetSetter = jest.fn();
  const sourceDelete = jest.fn();
  const approve = jest.fn();

  return {
    node: {
      getId: jest.fn(() => 'NODE_1'),
      getValue: jest.fn((attrId) => {
        if (attrId === 'CarColour') {
          return {
            getSimpleValue: jest.fn(() => sourceValue),
            deleteCurrent: sourceDelete,
          };
        }

        if (attrId === 'CardType') {
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

function makeMailHome() {
  const addTo = jest.fn();
  const subject = jest.fn();
  const message = jest.fn();
  const send = jest.fn();

  return {
    mailHome: {
      mail: jest.fn(() => ({
        addTo,
        subject,
        message,
        send,
      })),
    },
    addTo,
    subject,
    message,
    send,
  };
}

describe('BusinessRule_BA_CopyCarColourToCardTypeAndNotify', () => {
  test('copies CarColour to CardType, clears source, approves, and sends email', () => {
    const { node, targetSetter, sourceDelete, approve } = makeNode('Red');
    const { mailHome, addTo, subject, message, send } = makeMailHome();
    const logger = { info: jest.fn() };

    br.operation0(node, logger, mailHome);

    expect(targetSetter).toHaveBeenCalledTimes(1);
    expect(targetSetter).toHaveBeenCalledWith('Red');
    expect(sourceDelete).toHaveBeenCalledTimes(1);
    expect(approve).toHaveBeenCalledTimes(1);
    expect(addTo).toHaveBeenCalledWith('abc@gmail.com');
    expect(subject).toHaveBeenCalledWith('Node approved: NODE_1');
    expect(message).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
  });

  test('skips copy/delete when CarColour is empty but still approves and sends email', () => {
    const { node, targetSetter, sourceDelete, approve } = makeNode('');
    const { mailHome, send } = makeMailHome();
    const logger = { info: jest.fn() };

    br.operation0(node, logger, mailHome);

    expect(targetSetter).not.toHaveBeenCalled();
    expect(sourceDelete).not.toHaveBeenCalled();
    expect(approve).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
  });

  test('skips copy/delete when CarColour is null but still approves and sends email', () => {
    const { node, targetSetter, sourceDelete, approve } = makeNode(null);
    const { mailHome, send } = makeMailHome();
    const logger = { info: jest.fn() };

    br.operation0(node, logger, mailHome);

    expect(targetSetter).not.toHaveBeenCalled();
    expect(sourceDelete).not.toHaveBeenCalled();
    expect(approve).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
  });
});