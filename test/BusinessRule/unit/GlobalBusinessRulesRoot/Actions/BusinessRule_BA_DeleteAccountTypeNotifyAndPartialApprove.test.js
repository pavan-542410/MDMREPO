const br = require('../../../../../step-config/BusinessRule/BusinessRule_BA_DeleteAccountTypeNotifyAndPartialApprove');

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

describe('BusinessRule_BA_DeleteAccountTypeNotifyAndPartialApprove', () => {
  test('deletes AccountType, sends email, and partially approves AccountType', () => {
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
    const { mailHome, addTo, subject, message, send } = makeMailHome();

    br.operation0(node, { info: jest.fn() }, mailHome, partialApproveLib);

    expect(deleteCurrent).toHaveBeenCalledTimes(1);
    expect(addTo).toHaveBeenCalledWith('test@gmail.com');
    expect(subject).toHaveBeenCalledWith('AccountType deleted for node: NODE_1');
    expect(message).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(partialApproveLib.partialApproveFields).toHaveBeenCalledWith(node, ['AccountType'], false, false);
    expect(approve).not.toHaveBeenCalled();
  });

  test('falls back to approve when partial approve library is unavailable', () => {
    const deleteCurrent = jest.fn();
    const approve = jest.fn();
    const node = {
      getId: jest.fn(() => 'NODE_2'),
      getValue: jest.fn(() => ({
        deleteCurrent,
      })),
      approve,
    };
    const { mailHome, send } = makeMailHome();

    br.operation0(node, { info: jest.fn() }, mailHome, null);

    expect(deleteCurrent).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(approve).toHaveBeenCalledTimes(1);
  });

  test('continues and partially approves when email send throws', () => {
    const deleteCurrent = jest.fn();
    const approve = jest.fn();
    const partialApproveLib = {
      partialApproveFields: jest.fn(),
    };
    const node = {
      getId: jest.fn(() => 'NODE_3'),
      getValue: jest.fn(() => ({
        deleteCurrent,
      })),
      approve,
    };
    const mailHome = {
      mail: jest.fn(() => ({
        addTo: jest.fn(),
        subject: jest.fn(),
        message: jest.fn(),
        send: jest.fn(() => {
          throw new Error('mail failure');
        }),
      })),
    };

    br.operation0(node, { info: jest.fn() }, mailHome, partialApproveLib);

    expect(deleteCurrent).toHaveBeenCalledTimes(1);
    expect(partialApproveLib.partialApproveFields).toHaveBeenCalledTimes(1);
    expect(approve).not.toHaveBeenCalled();
  });
});