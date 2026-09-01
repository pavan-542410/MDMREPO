const partiallyApproveCoreReferences = require('../../../../../step-configs/BusinessRule/BusinessRule_PartiallyApproveCoreReferences');

class HashSetMock {
  constructor() {
    this.values = [];
  }

  add(value) {
    this.values.push(value);
  }

  isEmpty() {
    return this.values.length === 0;
  }

  size() {
    return this.values.length;
  }
}

class ApproveBulkValidationExceptionMock {
  constructor(message) {
    this.message = message;
  }

  getMessage() {
    return this.message;
  }
}

class SynchronizeExceptionMock {
  constructor(message) {
    this.message = message;
  }

  getMessage() {
    return this.message;
  }
}

function createIterator(items) {
  let index = 0;
  return {
    hasNext: jest.fn(() => index < items.length),
    next: jest.fn(() => items[index++]),
  };
}

function createLinkPart(linkTypeID) {
  return {
    getLinkType: jest.fn(() => ({
      getID: jest.fn(() => linkTypeID),
    })),
  };
}

function createLinkPartUsingFallback(linkTypeID) {
  return {
    getLinkType: jest.fn(() => {
      throw new Error('No link type object');
    }),
    getLinkTypeID: jest.fn(() => linkTypeID),
  };
}

function createClassificationLinkPart(linkTypeID) {
  return {
    getClassificationProductLinkType: jest.fn(() => ({
      getID: jest.fn(() => linkTypeID),
    })),
  };
}

describe('BusinessRule_PartiallyApproveCoreReferences', () => {
  beforeEach(() => {
    global.logger = {
      info: jest.fn(),
    };

    global.java = {
      util: {
        HashSet: HashSetMock,
      },
    };

    global.com = {
      stibo: {
        core: {
          domain: {
            approve: {
              ApproveBulkValidationException: ApproveBulkValidationExceptionMock,
            },
            synchronize: {
              exception: {
                SynchronizeException: SynchronizeExceptionMock,
              },
            },
          },
        },
      },
    };
  });

  afterEach(() => {
    delete global.logger;
    delete global.java;
    delete global.com;
  });

  test('approves configured reference types through WriteOperationsLibrary and configured link types directly', () => {
    const node = {
      getID: jest.fn(() => 'SV-101'),
      getNonApprovedObjects: jest.fn(() => ({
        iterator: jest.fn(() =>
          createIterator([
            createLinkPart('ProductToClassLInk'),
            createLinkPartUsingFallback('ProductToVendorLink'),
            createClassificationLinkPart('ProductToBrandLink'),
            createLinkPart('IgnoredLinkType'),
            { notALinkPart: true },
          ])
        ),
      })),
      approve: jest.fn(),
    };
    const writeLibrary = {
      approveReferences: jest.fn(() => 2),
    };

    partiallyApproveCoreReferences.operation0(node, writeLibrary);

    expect(writeLibrary.approveReferences).toHaveBeenCalledWith(node, [
      'product_to_classification',
      'StyleVariantToSizeSchemaReference',
    ]);
    expect(node.approve).toHaveBeenCalledTimes(1);
    expect(node.approve.mock.calls[0][0].values).toHaveLength(3);
    expect(global.logger.info).toHaveBeenCalledWith(
      expect.stringContaining('totalApprovedReferencePartsViaLibrary=2 totalApprovedFallbackParts=3')
    );
  });

  test('does not call node.approve when no matching link parts are pending', () => {
    const node = {
      getID: jest.fn(() => 'SV-102'),
      getNonApprovedObjects: jest.fn(() => ({
        iterator: jest.fn(() =>
          createIterator([
            createLinkPart('UnknownLink'),
            { getLinkTypeID: jest.fn(() => 'AnotherUnknownLink') },
          ])
        ),
      })),
      approve: jest.fn(),
    };
    const writeLibrary = {
      approveReferences: jest.fn(() => 0),
    };

    partiallyApproveCoreReferences.operation0(node, writeLibrary);

    expect(node.approve).not.toHaveBeenCalled();
    expect(global.logger.info).toHaveBeenCalledWith(
      expect.stringContaining('totalApprovedReferencePartsViaLibrary=0 totalApprovedFallbackParts=0')
    );
  });

  test('swallows expected synchronize exceptions from partial link approval', () => {
    const node = {
      getID: jest.fn(() => 'SV-103'),
      getNonApprovedObjects: jest.fn(() => ({
        iterator: jest.fn(() =>
          createIterator([
            createLinkPart('ProductToBrandLink'),
          ])
        ),
      })),
      approve: jest.fn(() => {
        throw {
          javaException: new SynchronizeExceptionMock('Sync failed'),
        };
      }),
    };
    const writeLibrary = {
      approveReferences: jest.fn(() => 1),
    };

    expect(() => partiallyApproveCoreReferences.operation0(node, writeLibrary)).not.toThrow();
    expect(global.logger.info).toHaveBeenCalledWith(
      expect.stringContaining('warning while approving fallback parts: Sync failed')
    );
  });

  test('rethrows unexpected errors from partial link approval', () => {
    const node = {
      getID: jest.fn(() => 'SV-104'),
      getNonApprovedObjects: jest.fn(() => ({
        iterator: jest.fn(() =>
          createIterator([
            createLinkPart('ProductToBrandLink'),
          ])
        ),
      })),
      approve: jest.fn(() => {
        throw new Error('Unexpected approval failure');
      }),
    };
    const writeLibrary = {
      approveReferences: jest.fn(() => 0),
    };

    expect(() => partiallyApproveCoreReferences.operation0(node, writeLibrary)).toThrow(
      'Unexpected approval failure'
    );
  });

  test('also scans parent nodes so approvals work when references are pending above current node', () => {
    const parent = {
      getID: jest.fn(() => 'STYLE-201'),
      getParent: jest.fn(() => null),
      getNonApprovedObjects: jest.fn(() => ({
        iterator: jest.fn(() =>
          createIterator([
            createClassificationLinkPart('ProductToBrandLink'),
          ])
        ),
      })),
      approve: jest.fn(),
    };
    const node = {
      getID: jest.fn(() => 'SV-201'),
      getParent: jest.fn(() => parent),
      getNonApprovedObjects: jest.fn(() => ({
        iterator: jest.fn(() => createIterator([])),
      })),
      approve: jest.fn(),
    };
    const writeLibrary = {
      approveReferences: jest.fn(() => 0),
    };

    partiallyApproveCoreReferences.operation0(node, writeLibrary);

    expect(writeLibrary.approveReferences).toHaveBeenCalledTimes(2);
    expect(node.approve).not.toHaveBeenCalled();
    expect(parent.approve).toHaveBeenCalledTimes(1);
    expect(global.logger.info).toHaveBeenCalledWith(
      expect.stringContaining('totalApprovedReferencePartsViaLibrary=0 totalApprovedFallbackParts=1')
    );
  });
});
