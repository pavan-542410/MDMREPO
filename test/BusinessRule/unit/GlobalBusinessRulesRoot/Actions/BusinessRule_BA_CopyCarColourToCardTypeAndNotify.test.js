const br = require('../../../../../step-config/BusinessRule/BusinessRule_BA_CopyCarColourToCardTypeAndNotify');

function makeMail() {
  return {
    addTo: jest.fn(),
    subject: jest.fn(),
    htmlMessage: jest.fn(),
    send: jest.fn(),
  };
}

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

describe('BusinessRule_BA_CopyCarColourToCardTypeAndNotify', () => {
  test('copies CarColour to CardType, clears CarColour, approves, and sends email', () => {
    const { node, targetSetter, sourceDelete, approve } = makeNode('Red');
    const mail = makeMail();
    const mailHome = { mail: jest.fn(() => mail) };
    const logger = { info: jest.fn() };

    br.operation0(node, logger, mailHome);

    expect(targetSetter).toHaveBeenCalledTimes(1);
    expect(targetSetter).toHaveBeenCalledWith('Red');
    expect(sourceDelete).toHaveBeenCalledTimes(1);
    expect(approve).toHaveBeenCalledTimes(1);
    expect(mailHome.mail).toHaveBeenCalledTimes(1);
    expect(mail.addTo).toHaveBeenCalledWith('abc@gmail.com');
    expect(mail.subject).toHaveBeenCalledWith('CarColour to CardType update completed');
    expect(mail.send).toHaveBeenCalledTimes(1);
  });

  test('clears CarColour, approves, and sends email even when CarColour is empty', () => {
    const { node, targetSetter, sourceDelete, approve } = makeNode('');
    const mail = makeMail();
    const mailHome = { mail: jest.fn(() => mail) };
    const logger = { info: jest.fn() };

    br.operation0(node, logger, mailHome);

    expect(targetSetter).not.toHaveBeenCalled();
    expect(sourceDelete).toHaveBeenCalledTimes(1);
    expect(approve).toHaveBeenCalledTimes(1);
    expect(mail.send).toHaveBeenCalledTimes(1);
  });
});