const generateUnclassifiedSKUsReport = require('../../../../../step-configs/BusinessRule/BusinessRule_GenerateUnclassifiedSKUsReport');

function createRevision(dateValue, parentNode) {
  return {
    getCreatedDate: jest.fn(() => new Date(dateValue)),
    getNode: jest.fn(() => ({
      getParent: jest.fn(() => parentNode),
    })),
  };
}

function createRevisionCollection(revisions) {
  let index = 0;

  return {
    size: jest.fn(() => revisions.length),
    iterator: jest.fn(() => ({
      hasNext: jest.fn(() => index < revisions.length),
      next: jest.fn(() => revisions[index++]),
    })),
  };
}

describe('BusinessRule_GenerateUnclassifiedSKUsReport', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-10T12:00:00.000Z'));
    global.java = {
      lang: {
        String: function JavaString(value) {
          this.getBytes = jest.fn(() => Buffer.from(value, 'utf8'));
        },
      },
      io: {
        ByteArrayInputStream: function ByteArrayInputStream(bytes) {
          this.bytes = bytes;
        },
      },
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    delete global.java;
  });

  test('generates CSV output and sends it as a mail attachment', () => {
    const logger = {
      info: jest.fn(),
      warning: jest.fn(),
    };
    const unclassifiedNode = {
      getID: jest.fn(() => 'UnclassifiedSKUs'),
      queryNodes: jest.fn(() => ({
        asList: jest.fn(() => ({
          forEach: jest.fn((callback) => {
            callback({
              getID: jest.fn(() => 'SKU_1'),
              getName: jest.fn(() => 'SKU 1'),
              getParent: jest.fn(() => unclassifiedNode),
              getRevisions: jest.fn(() => createRevisionCollection([
                createRevision('2024-01-09T12:00:00.000Z', unclassifiedNode),
              ])),
            });
          }),
        })),
      })),
    };
    const manager = {
      getNodeCollectionHome: jest.fn(() => ({
        getNodeCollectionByID: jest.fn(() => unclassifiedNode),
      })),
    };
    const mail = {
      addTo: jest.fn(),
      subject: jest.fn(),
      htmlMessage: jest.fn(),
      addAttachment: jest.fn(),
      send: jest.fn(),
    };

    const result = generateUnclassifiedSKUsReport.operation0({}, logger, manager, {
      mail: jest.fn(() => mail),
    });

    expect(result).toContain('Successfully generated CSV report for 1 SKUs.');
    expect(result).toContain('Email result: Email sent successfully');
    expect(mail.addTo).toHaveBeenCalledWith('sankar.talam@stitchfix.com');
    expect(mail.addAttachment).toHaveBeenCalledWith(
      'SKU_Time_Report.csv',
      expect.objectContaining({
        bytes: expect.any(Buffer),
      }),
      'text/csv'
    );
    expect(mail.send).toHaveBeenCalledTimes(1);
  });

  test('returns fallback/error text when no SKUs are found or email send fails', () => {
    const logger = {
      info: jest.fn(),
      warning: jest.fn(),
    };
    const emptyUnclassifiedNode = {
      getID: jest.fn(() => 'UnclassifiedSKUs'),
      queryNodes: jest.fn(() => ({
        asList: jest.fn(() => ({
          forEach: jest.fn(),
        })),
      })),
    };

    expect(generateUnclassifiedSKUsReport.operation0({}, logger, {
      getNodeCollectionHome: jest.fn(() => ({
        getNodeCollectionByID: jest.fn(() => emptyUnclassifiedNode),
      })),
    }, {
      mail: jest.fn(),
    })).toBe('No SKUs found under UnclassifiedSKUs folder');

    const reportNode = {
      getID: jest.fn(() => 'UnclassifiedSKUs'),
      queryNodes: jest.fn(() => ({
        asList: jest.fn(() => ({
          forEach: jest.fn((callback) => {
            callback({
              getID: jest.fn(() => 'SKU_ERR'),
              getName: jest.fn(() => 'SKU ERR'),
              getParent: jest.fn(() => reportNode),
              getRevisions: jest.fn(() => createRevisionCollection([])),
            });
          }),
        })),
      })),
    };

    const result = generateUnclassifiedSKUsReport.operation0({}, logger, {
      getNodeCollectionHome: jest.fn(() => ({
        getNodeCollectionByID: jest.fn(() => reportNode),
      })),
    }, {
      mail: jest.fn(() => {
        throw new Error('smtp down');
      }),
    });

    expect(result).toContain('Successfully generated CSV report for 1 SKUs.');
    expect(result).toContain('Email result: Error sending email: Error: smtp down');
    expect(logger.warning).toHaveBeenCalledWith('Error sending email: Error: smtp down');
  });
});
