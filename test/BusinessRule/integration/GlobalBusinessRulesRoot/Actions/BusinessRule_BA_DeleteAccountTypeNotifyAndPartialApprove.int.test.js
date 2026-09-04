const br = require('../../../../../step-config/BusinessRule/BusinessRule_BA_DeleteAccountTypeNotifyAndPartialApprove');

describe('BusinessRule_BA_DeleteAccountTypeNotifyAndPartialApprove (integration)', () => {
  test('deletes AccountType, sends email, and partially approves AccountType', () => {
    const values = {
      AccountType: 'Retail',
    };

    const node = {
      getId: jest.fn(() => 'BP_1001'),
      getValue: jest.fn((attrId) => {
        if (attrId === 'AccountType') {
          return {
            deleteCurrent: jest.fn(() => {
              values.AccountType = null;
            }),
          };
        }

        return {
          deleteCurrent: jest.fn(),
        };
      }),
      approve: jest.fn(),
    };

    const sent = {
      to: null,
      subject: null,
      body: null,
      sent: false,
    };

    const mailHome = {
      mail: jest.fn(() => ({
        addTo: jest.fn((to) => {
          sent.to = to;
        }),
        subject: jest.fn((subj) => {
          sent.subject = subj;
        }),
        message: jest.fn((msg) => {
          sent.body = msg;
        }),
        send: jest.fn(() => {
          sent.sent = true;
        }),
      })),
    };

    const partialApproveLib = {
      partialApproveFields: jest.fn(),
    };

    br.operation0(node, { info: jest.fn() }, mailHome, partialApproveLib);

    expect(values.AccountType).toBeNull();
    expect(sent.to).toBe('test@gmail.com');
    expect(sent.subject).toBe('AccountType deleted for node: BP_1001');
    expect(sent.body).toContain('BP_1001');
    expect(sent.sent).toBe(true);
    expect(partialApproveLib.partialApproveFields).toHaveBeenCalledWith(node, ['AccountType'], false, false);
    expect(node.approve).not.toHaveBeenCalled();
  });
});