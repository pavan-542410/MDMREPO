const skuTimeUnderUnclassifiedSKUsReport = require('../../../../../step-configs/BusinessRule/BusinessRule_SKUTimeUnderUnclassifiedSKUsReport');

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

function createSku(id, name, parentNode, revisions) {
  return {
    getID: jest.fn(() => id),
    getName: jest.fn(() => name),
    getParent: jest.fn(() => parentNode),
    getRevisions: jest.fn(() => createRevisionCollection(revisions)),
  };
}

describe('BusinessRule_SKUTimeUnderUnclassifiedSKUsReport', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-10T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('generates a CSV summary and sends the email placeholder message', () => {
    const logger = {
      info: jest.fn(),
      warning: jest.fn(),
    };
    const unclassifiedNode = {
      getID: jest.fn(() => 'UnclassifiedSKUs'),
      queryNodes: jest.fn(() => ({
        asList: jest.fn(() => ({
          forEach: jest.fn((callback) => {
            callback(createSku('SKU_1', 'Sku, One', unclassifiedNode, [
              createRevision('2024-01-08T12:00:00.000Z', unclassifiedNode),
            ]));
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
      send: jest.fn(),
    };

    const result = skuTimeUnderUnclassifiedSKUsReport.operation0({}, logger, manager, {
      mail: jest.fn(() => mail),
    });

    expect(result).toContain('Successfully generated CSV report for 1 SKUs.');
    expect(result).toContain('"Sku, One"');
    expect(result).toContain('- Email Placeholder -');
    expect(mail.addTo).toHaveBeenCalledWith('sankar.talam@stitchfix.com', 'ST');
    expect(mail.subject).toHaveBeenCalledWith('SKU Time Under UnclassifiedSKUs Report');
    expect(mail.send).toHaveBeenCalledTimes(1);
  });

  test('returns clear error/fallback messages when the folder is missing or has no SKUs', () => {
    const logger = {
      info: jest.fn(),
      warning: jest.fn(),
    };

    expect(skuTimeUnderUnclassifiedSKUsReport.operation0({}, logger, {
      getNodeCollectionHome: jest.fn(() => ({
        getNodeCollectionByID: jest.fn(() => null),
      })),
    }, {
      mail: jest.fn(),
    })).toBe('ERROR: Could not find UnclassifiedSKUs folder with ID: UnclassifiedSKUs');

    expect(skuTimeUnderUnclassifiedSKUsReport.operation0({}, logger, {
      getNodeCollectionHome: jest.fn(() => ({
        getNodeCollectionByID: jest.fn(() => ({
          getID: jest.fn(() => 'UnclassifiedSKUs'),
          queryNodes: jest.fn(() => ({
            asList: jest.fn(() => ({
              forEach: jest.fn(),
            })),
          })),
        })),
      })),
    }, {
      mail: jest.fn(),
    })).toBe('No SKUs found under UnclassifiedSKUs folder');
  });
});
