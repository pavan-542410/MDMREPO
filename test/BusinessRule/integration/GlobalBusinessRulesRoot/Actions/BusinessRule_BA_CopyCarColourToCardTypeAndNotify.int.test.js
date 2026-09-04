const br = require('../../../../../step-config/BusinessRule/BusinessRule_BA_CopyCarColourToCardTypeAndNotify');

describe('BusinessRule_BA_CopyCarColourToCardTypeAndNotify (integration)', () => {
  test('performs copy-delete-approve workflow and emits approval email', () => {
    const values = {
      CarColour: {
        current: 'Green',
      },
      CardType: {
        current: null,
      },
    };

    const node = {
      getId: jest.fn(() => 'RP_1001'),
      getValue: jest.fn((attrId) => {
        if (attrId === 'CarColour') {
          return {
            getSimpleValue: jest.fn(() => values.CarColour.current),
            deleteCurrent: jest.fn(() => {
              values.CarColour.current = null;
            }),
          };
        }

        if (attrId === 'CardType') {
          return {
            setSimpleValue: jest.fn((newValue) => {
              values.CardType.current = newValue;
            }),
          };
        }

        return {
          getSimpleValue: jest.fn(() => null),
          deleteCurrent: jest.fn(),
          setSimpleValue: jest.fn(),
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

    const logger = { info: jest.fn() };

    br.operation0(node, logger, mailHome);

    expect(values.CardType.current).toBe('Green');
    expect(values.CarColour.current).toBeNull();
    expect(node.approve).toHaveBeenCalledTimes(1);
    expect(sent.to).toBe('abc@gmail.com');
    expect(sent.subject).toBe('Node approved: RP_1001');
    expect(sent.body).toContain('RP_1001');
    expect(sent.sent).toBe(true);
  });
});