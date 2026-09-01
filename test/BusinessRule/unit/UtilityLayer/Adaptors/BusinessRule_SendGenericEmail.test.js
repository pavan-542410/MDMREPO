const { operation0 } = require('../../../../../step-configs/BusinessRule/BusinessRule_SendGenericEmail');

describe("BusinessRule_SendGenericEmail", () => {
    test("sends an email using the canonical payload with multiple recipient types and attachments", () => {
        const assetA = { getID: jest.fn(() => "ASSET_A") };
        const assetB = { getID: jest.fn(() => "ASSET_B") };
        const sentMails = [];
        const attachmentRecords = [];
        const step = {
            getAssetHome: jest.fn(() => ({
                getAssetByID: jest.fn((assetId) => ({
                    ASSET_A: assetA,
                    ASSET_B: assetB
                })[assetId] || null)
            }))
        };
        const mailHome = {
            mail: jest.fn(() => createMailMock(sentMails, attachmentRecords))
        };
        const logger = { info: jest.fn() };

        const result = operation0(step, mailHome, logger, JSON.stringify({
            to: ["to-1@example.com", "to-2@example.com"],
            cc: ["cc@example.com"],
            bcc: ["bcc@example.com"],
            fromEmail: "sender@example.com",
            fromName: "STEP Sender",
            subject: "Subject",
            plainBody: "Plain body",
            htmlBody: "<p>HTML body</p>",
            attachments: [
                {
                    assetId: "ASSET_A",
                    name: "file-a.csv",
                    description: "File A"
                },
                {
                    assetId: "ASSET_B",
                    description: "File B"
                }
            ]
        }));

        expect(result).toBe(true);
        expect(mailHome.mail).toHaveBeenCalledTimes(1);
        expect(sentMails).toEqual([
            {
                from: ["sender@example.com", "STEP Sender"],
                to: ["to-1@example.com", "to-2@example.com"],
                cc: ["cc@example.com"],
                bcc: ["bcc@example.com"],
                subject: "Subject",
                plain: "Plain body",
                html: "<p>HTML body</p>",
                sent: true
            }
        ]);
        expect(attachmentRecords).toEqual([
            {
                name: "file-a.csv",
                description: "File A",
                asset: assetA,
                attached: true
            },
            {
                name: "",
                description: "File B",
                asset: assetB,
                attached: true
            }
        ]);
        expect(logger.info).toHaveBeenCalledWith("SendGenericEmail: email send() completed to to-1@example.com,to-2@example.com");
    });

    test("accepts the legacy SendAttachmentToEmail payload shape for future convergence", () => {
        const asset = { getID: jest.fn(() => "LEGACY_ASSET") };
        const sentMails = [];
        const attachmentRecords = [];
        const step = {
            getAssetHome: jest.fn(() => ({
                getAssetByID: jest.fn((assetId) => assetId === "LEGACY_ASSET" ? asset : null)
            }))
        };
        const mailHome = {
            mail: jest.fn(() => createMailMock(sentMails, attachmentRecords))
        };

        operation0(step, mailHome, null, JSON.stringify({
            recipients: ["legacy-to@example.com"],
            subject: "Legacy subject",
            body: "Legacy body",
            attachmentAssetId: "LEGACY_ASSET",
            attachmentName: "legacy.csv",
            attachmentDescription: "Legacy attachment"
        }));

        expect(sentMails[0].to).toEqual(["legacy-to@example.com"]);
        expect(sentMails[0].plain).toBe("Legacy body");
        expect(sentMails[0].html).toBe("Legacy body");
        expect(attachmentRecords).toEqual([
            {
                name: "legacy.csv",
                description: "Legacy attachment",
                asset: asset,
                attached: true
            }
        ]);
    });

    test("sends an email without attachments", () => {
        const sentMails = [];
        const attachmentRecords = [];
        const mailHome = {
            mail: jest.fn(() => createMailMock(sentMails, attachmentRecords))
        };

        operation0(null, mailHome, null, JSON.stringify({
            to: ["alerts@example.com"],
            subject: "No attachments",
            plainBody: "Body only"
        }));

        expect(sentMails).toHaveLength(1);
        expect(sentMails[0].to).toEqual(["alerts@example.com"]);
        expect(sentMails[0].html).toBe("Body only");
        expect(attachmentRecords).toEqual([]);
    });

    test("throws when no recipient is provided", () => {
        expect(() => operation0(null, { mail: jest.fn() }, null, JSON.stringify({
            subject: "Missing recipient"
        }))).toThrow("SendGenericEmail: at least one recipient in to/recipients is required.");
    });

    test("throws when an attachment asset is missing", () => {
        const step = {
            getAssetHome: jest.fn(() => ({
                getAssetByID: jest.fn(() => null)
            }))
        };
        const mailHome = {
            mail: jest.fn(() => createMailMock([], []))
        };

        expect(() => operation0(step, mailHome, null, JSON.stringify({
            to: ["alerts@example.com"],
            subject: "Missing asset",
            attachments: [{ assetId: "MISSING" }]
        }))).toThrow("SendGenericEmail: attachment asset not found for id=MISSING");
    });

    test("throws when canonical attachments omit assetId", () => {
        expect(() => operation0(null, { mail: jest.fn() }, null, JSON.stringify({
            to: ["alerts@example.com"],
            attachments: [{ name: "missing.csv" }]
        }))).toThrow("SendGenericEmail: attachments[0].assetId is required.");
    });
});

function createMailMock(sentMails, attachmentRecords) {
    const mailRecord = {
        from: [],
        to: [],
        cc: [],
        bcc: [],
        subject: "",
        plain: "",
        html: "",
        sent: false
    };

    return {
        from: jest.fn((email, name) => {
            mailRecord.from = typeof name === "undefined" ? [email] : [email, name];
        }),
        addTo: jest.fn((value) => mailRecord.to.push(value)),
        addCc: jest.fn((value) => mailRecord.cc.push(value)),
        addBcc: jest.fn((value) => mailRecord.bcc.push(value)),
        subject: jest.fn((value) => {
            mailRecord.subject = value;
        }),
        plainMessage: jest.fn((value) => {
            mailRecord.plain = value;
        }),
        htmlMessage: jest.fn((value) => {
            mailRecord.html = value;
        }),
        attachment: jest.fn(() => createAttachmentBuilder(attachmentRecords)),
        send: jest.fn(() => {
            mailRecord.sent = true;
            sentMails.push(mailRecord);
        })
    };
}

function createAttachmentBuilder(attachmentRecords) {
    const record = {
        name: "",
        description: "",
        asset: null,
        attached: false
    };
    const builder = {
        name: jest.fn((value) => {
            record.name = value;
            return builder;
        }),
        description: jest.fn((value) => {
            record.description = value;
            return builder;
        }),
        fromAsset: jest.fn((asset) => {
            record.asset = asset;
            return builder;
        }),
        attach: jest.fn(() => {
            record.attached = true;
            attachmentRecords.push(record);
            return builder;
        })
    };

    return builder;
}
