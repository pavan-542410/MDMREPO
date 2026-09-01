const br = require('../../../../../step-config/BusinessRule/BusinessRule_BA_CopyCameraToCamera1AndNotify');

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
        if (attrId === 'Camera') {
          return {
            getSimpleValue: jest.fn(() => sourceValue),
            deleteCurrent: sourceDelete,
          };
        }

        if (attrId === 'Camera1') {
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

describe('BusinessRule_BA_CopyCameraToCamera1AndNotify', () => {
  test('copies Camera to Camera1, clears Camera, approves, and sends email', () => {
    const { node, targetSetter, sourceDelete, approve } = makeNode('1080p');
    const mail = makeMail();
    const mailHome = { mail: jest.fn(() => mail) };
    const logger = { info: jest.fn() };

    br.operation0(node, logger, mailHome);

    expect(targetSetter).toHaveBeenCalledTimes(1);
    expect(targetSetter).toHaveBeenCalledWith('1080p');
    expect(sourceDelete).toHaveBeenCalledTimes(1);
    expect(approve).toHaveBeenCalledTimes(1);
    expect(mailHome.mail).toHaveBeenCalledTimes(1);
    expect(mail.addTo).toHaveBeenCalledWith('hbpavan1@gmail.com');
    expect(mail.subject).toHaveBeenCalledWith('Camera attribute update completed');
    expect(mail.send).toHaveBeenCalledTimes(1);
  });

  test('approves and emails even when Camera is empty', () => {
    const { node, targetSetter, sourceDelete, approve } = makeNode('');
    const mail = makeMail();
    const mailHome = { mail: jest.fn(() => mail) };
    const logger = { info: jest.fn() };

    br.operation0(node, logger, mailHome);

    expect(targetSetter).not.toHaveBeenCalled();
    expect(sourceDelete).not.toHaveBeenCalled();
    expect(approve).toHaveBeenCalledTimes(1);
    expect(mail.send).toHaveBeenCalledTimes(1);
  });
});