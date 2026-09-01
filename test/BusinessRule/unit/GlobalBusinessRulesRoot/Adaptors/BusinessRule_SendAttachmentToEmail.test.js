const sendAttachmentToEmail = require('../../../../../step-configs/BusinessRule/BusinessRule_SendAttachmentToEmail');

function createMailHome(attachmentBuilder, mail) {
  return {
    mail: jest.fn(() => mail || {
      from: jest.fn(),
      addTo: jest.fn(),
      subject: jest.fn(),
      plainMessage: jest.fn(),
      htmlMessage: jest.fn(),
      attachment: jest.fn(() => attachmentBuilder),
      send: jest.fn(),
    }),
  };
}

function createAttachmentBuilder() {
  const builder = {
    name: jest.fn(() => builder),
    description: jest.fn(() => builder),
    fromAsset: jest.fn(() => builder),
    attach: jest.fn(() => builder),
  };

  return builder;
}

describe('BusinessRule_SendAttachmentToEmail', () => {
  test('builds and sends an email with an attachment asset', () => {
    const asset = { id: 'ASSET_1' };
    const step = {
      getAssetHome: jest.fn(() => ({
        getAssetByID: jest.fn(() => asset),
      })),
    };
    const attachmentBuilder = createAttachmentBuilder();
    const mail = {
      from: jest.fn(),
      addTo: jest.fn(),
      subject: jest.fn(),
      plainMessage: jest.fn(),
      htmlMessage: jest.fn(),
      attachment: jest.fn(() => attachmentBuilder),
      send: jest.fn(),
    };
    const mailHome = createMailHome(attachmentBuilder, mail);
    const logger = {
      info: jest.fn(),
    };

    expect(sendAttachmentToEmail.operation0(step, mailHome, logger, JSON.stringify({
      recipients: ['user1@example.com', 'user2@example.com'],
      subject: 'Subject',
      body: '<p>Hello</p>',
      fromEmail: 'sender@example.com',
      fromName: 'Sender Name',
      attachmentAssetId: ' ASSET_1 ',
      attachmentName: 'asset.csv',
      attachmentDescription: 'Generated attachment',
      debug: true,
    }))).toBe(true);

    expect(mail.from).toHaveBeenCalledWith('sender@example.com', 'Sender Name');
    expect(mail.addTo).toHaveBeenCalledWith('user1@example.com');
    expect(mail.addTo).toHaveBeenCalledWith('user2@example.com');
    expect(mail.subject).toHaveBeenCalledWith('Subject');
    expect(mail.plainMessage).toHaveBeenCalledWith('<p>Hello</p>');
    expect(mail.htmlMessage).toHaveBeenCalledWith('<p>Hello</p>');
    expect(attachmentBuilder.name).toHaveBeenCalledWith('asset.csv');
    expect(attachmentBuilder.description).toHaveBeenCalledWith('Generated attachment');
    expect(attachmentBuilder.fromAsset).toHaveBeenCalledWith(asset);
    expect(attachmentBuilder.attach).toHaveBeenCalledTimes(1);
    expect(mail.send).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      'SendAttachmentToEmail: start recipients=user1@example.com,user2@example.com'
    );
    expect(logger.info).toHaveBeenCalledWith(
      'SendAttachmentToEmail: email send() completed to user1@example.com,user2@example.com'
    );
  });

  test('rejects malformed options and invalid send inputs', () => {
    const step = {
      getAssetHome: jest.fn(() => ({
        getAssetByID: jest.fn(() => null),
      })),
    };
    const mailHome = createMailHome(createAttachmentBuilder());

    expect(() => sendAttachmentToEmail.operation0(step, mailHome, null, '{bad-json'))
      .toThrow(expect.stringContaining('SendAttachmentToEmail: invalid optionsJson.'));

    expect(() => sendAttachmentToEmail.operation0(step, mailHome, null, JSON.stringify({
      attachmentAssetId: 'ASSET_1',
    }))).toThrow('SendAttachmentToEmail: no recipients provided.');

    expect(() => sendAttachmentToEmail.operation0(step, mailHome, null, JSON.stringify({
      recipients: ['user@example.com'],
      attachmentAssetId: '   ',
    }))).toThrow('SendAttachmentToEmail: attachmentAssetId is required.');

    expect(() => sendAttachmentToEmail.operation0(step, mailHome, null, JSON.stringify({
      recipients: ['user@example.com'],
      attachmentAssetId: 'MISSING',
    }))).toThrow('SendAttachmentToEmail: attachment asset not found for id=MISSING');
  });
});
