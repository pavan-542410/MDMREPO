const writeOperationsLibrary = require('../../../../../step-configs/BusinessRule/BusinessRule_WriteOperationsLibrary');

function createValueHolder() {
  return {
    setSimpleValue: jest.fn(),
  };
}

function createIterator(items) {
  let index = 0;

  return {
    hasNext: jest.fn(() => index < items.length),
    next: jest.fn(() => items[index++]),
  };
}

function createHashSetMock() {
  const values = [];

  return {
    add: jest.fn((value) => {
      values.push(value);
    }),
    isEmpty: jest.fn(() => values.length === 0),
    size: jest.fn(() => values.length),
    values,
  };
}

describe('BusinessRule_WriteOperationsLibrary', () => {
  beforeEach(() => {
    global.logger = {
      info: jest.fn(),
    };

    global.Packages = {
      com: {
        stibo: {
          core: {
            domain: {
              classificationproductlinktype: {
                ClassificationProductLinkTypeHome: function ClassificationProductLinkTypeHome() {},
              },
            },
          },
        },
      },
    };

    const ReferencePartObject = function ReferencePartObject() {};
    const ApproveBulkValidationException = function ApproveBulkValidationException(message) {
      this.message = message;
      this.getMessage = function () {
        return message;
      };
    };
    const SynchronizeException = function SynchronizeException(message) {
      this.message = message;
      this.getMessage = function () {
        return message;
      };
    };

    global.com = {
      stibo: {
        core: {
          domain: {
            partobject: {
              ReferencePartObject,
            },
            approve: {
              ApproveBulkValidationException,
            },
            synchronize: {
              exception: {
                SynchronizeException,
              },
            },
          },
        },
      },
    };

    global.java = {
      util: {
        HashSet: jest.fn(() => createHashSetMock()),
      },
    };
  });

  afterEach(() => {
    delete global.logger;
    delete global.Packages;
    delete global.com;
    delete global.java;
  });

  it('writes simple values, deletes empty values, and writes multiple payload values', () => {
    const nameValue = createValueHolder();
    const statusValue = createValueHolder();
    const node = {
      getValue: jest.fn((attributeID) => {
        if (attributeID === 'name') {
          return nameValue;
        }
        return statusValue;
      }),
    };

    writeOperationsLibrary.writeSimpleValue(node, 'name', 'Slim Shirt');
    writeOperationsLibrary.writeSimpleValue(node, 'status', '');
    writeOperationsLibrary.writeMultipleSimpleValues(node, {
      name: 'Updated Shirt',
      status: null,
    });
    writeOperationsLibrary.writeMultipleSimpleValues(node, null);

    expect(nameValue.setSimpleValue).toHaveBeenCalledWith('Slim Shirt');
    expect(nameValue.setSimpleValue).toHaveBeenCalledWith('Updated Shirt');
    expect(statusValue.setSimpleValue).toHaveBeenCalledWith('');
  });

  it('creates and deletes references, links, products, entities, classifications, and assets', () => {
    const refType = { id: 'MaterialRef' };
    const linkType = { id: 'MaterialLink' };
    const createdReference = { id: 'ref-1' };
    const createdLink = { id: 'link-1' };
    const referenceObject = {
      delete: jest.fn(),
    };
    const linkObject = {
      delete: jest.fn(),
    };
    const manager = {
      getReferenceTypeHome: jest.fn(() => ({
        getReferenceTypeByID: jest.fn(() => refType),
      })),
      getHome: jest.fn(() => ({
        getLinkTypeByID: jest.fn(() => linkType),
      })),
    };
    const targetNode = { id: 'target' };
    const sourceNode = {
      createReference: jest.fn(() => createdReference),
    };
    const productNode = {
      createClassificationProductLink: jest.fn(() => createdLink),
      createProduct: jest.fn((id, objectTypeID) => ({ id, objectTypeID })),
    };
    const entityNode = {
      createEntity: jest.fn((id, objectTypeID) => ({ id, objectTypeID })),
    };
    const classificationNode = {
      createClassification: jest.fn((id, objectTypeID) => ({ id, objectTypeID })),
      createAsset: jest.fn((id, objectTypeID) => ({ id, objectTypeID })),
    };

    expect(
      writeOperationsLibrary.createReference(manager, sourceNode, targetNode, 'MaterialRef')
    ).toBe(createdReference);
    expect(writeOperationsLibrary.createLink(manager, productNode, targetNode, 'MaterialLink')).toBe(
      createdLink
    );
    expect(writeOperationsLibrary.createProduct(productNode, 'prod-1', 'ProductNode')).toEqual({
      id: 'prod-1',
      objectTypeID: 'ProductNode',
    });
    expect(writeOperationsLibrary.createEntity(entityNode, 'entity-1', 'EntityType')).toEqual({
      id: 'entity-1',
      objectTypeID: 'EntityType',
    });
    expect(
      writeOperationsLibrary.createClassification(
        classificationNode,
        'class-1',
        'ClassificationType'
      )
    ).toEqual({
      id: 'class-1',
      objectTypeID: 'ClassificationType',
    });
    expect(writeOperationsLibrary.createAsset(classificationNode, 'asset-1', 'AssetType')).toEqual({
      id: 'asset-1',
      objectTypeID: 'AssetType',
    });

    writeOperationsLibrary.deleteReference(referenceObject);
    writeOperationsLibrary.deleteLink(linkObject);

    expect(referenceObject.delete).toHaveBeenCalledTimes(1);
    expect(linkObject.delete).toHaveBeenCalledTimes(1);
  });

  it('deletes references only for matching target IDs', () => {
    const deletedRef = {
      getTarget: jest.fn(() => ({
        getID: jest.fn(() => 'keep-me'),
      })),
      delete: jest.fn(),
    };
    const untouchedRef = {
      getTarget: jest.fn(() => ({
        getID: jest.fn(() => 'remove-me'),
      })),
      delete: jest.fn(),
    };
    const sourceNode = {
      queryReferences: jest.fn(() => ({
        asList: jest.fn(() => ({
          toArray: jest.fn(() => [deletedRef, untouchedRef]),
        })),
      })),
    };

    expect(
      writeOperationsLibrary.deleteReferencesByTargetIds(sourceNode, { id: 'MaterialRef' }, [
        'remove-me',
      ])
    ).toBe(1);
    expect(untouchedRef.delete).toHaveBeenCalledTimes(1);
    expect(deletedRef.delete).not.toHaveBeenCalled();
    expect(
      writeOperationsLibrary.deleteReferencesByTargetIds(sourceNode, { id: 'MaterialRef' }, [])
    ).toBe(0);
  });

  it('approves pending reference part objects with optional ref-type filtering and ignores empty sets', () => {
    const matchingPart = new global.com.stibo.core.domain.partobject.ReferencePartObject();
    matchingPart.getReferenceType = jest.fn(() => ({
      getID: jest.fn(() => 'PrimaryImage'),
    }));

    const fallbackPart = new global.com.stibo.core.domain.partobject.ReferencePartObject();
    fallbackPart.getReferenceType = jest.fn(() => {
      throw new Error('No reference type object');
    });
    fallbackPart.getReferenceTypeID = jest.fn(() => 'SecondaryImage');

    const ignoredPart = {
      getReferenceType: jest.fn(),
    };

    const node = {
      getID: jest.fn(() => 'node-1'),
      getNonApprovedObjects: jest.fn(() => ({
        iterator: jest.fn(() => createIterator([matchingPart, fallbackPart, ignoredPart])),
      })),
      approve: jest.fn(),
    };

    expect(writeOperationsLibrary.approveReferences(node, ['SecondaryImage'])).toBe(1);
    expect(node.approve).toHaveBeenCalledTimes(1);

    node.approve.mockClear();
    expect(writeOperationsLibrary.approveReferences(node, ['UnknownRefType'])).toBe(0);
    expect(node.approve).not.toHaveBeenCalled();
  });

  it('returns script rejection messages when triggering mapped workflow events', () => {
    const rejectedTask = {
      triggerByID: jest.fn(() => ({
        isRejectedByScript: jest.fn(() => true),
        getScriptMessage: jest.fn(() => 'Rejected by script'),
      })),
    };
    const node = {
      getName: jest.fn(() => 'Style Variant A'),
      getWorkflowInstanceByID: jest.fn((workflowID) => {
        if (workflowID !== 'ProductMaintenance') {
          return null;
        }
        return {
          getTaskByID: jest.fn((stateID) => {
            if (stateID === 'ReadyForApproval') {
              return rejectedTask;
            }
            return null;
          }),
        };
      }),
    };

    expect(writeOperationsLibrary.triggerWorkflowEventsByMap(node, null, 'Message')).toBeNull();
    expect(
      writeOperationsLibrary.triggerWorkflowEventsByMap(
        node,
        {
          ProductMaintenance: {
            ReadyForApproval: 'Approve',
            MissingState: 'Approve',
          },
          MissingWorkflow: {
            ReadyForApproval: 'Approve',
          },
        },
        'Mapped trigger'
      )
    ).toEqual(['Style Variant A Rejected by script']);
  });

  it('triggers ProductMaintenance approval only when the workflow task exists and is not rejected', () => {
    const approvedTask = {
      triggerByID: jest.fn(() => ({
        isRejectedByScript: jest.fn(() => false),
      })),
    };
    const rejectedTask = {
      triggerByID: jest.fn(() => ({
        isRejectedByScript: jest.fn(() => true),
      })),
    };

    const approvedNode = {
      getWorkflowInstanceByID: jest.fn(() => ({
        getTaskByID: jest.fn(() => approvedTask),
      })),
    };
    const rejectedNode = {
      getWorkflowInstanceByID: jest.fn(() => ({
        getTaskByID: jest.fn(() => rejectedTask),
      })),
    };
    const noWorkflowNode = {
      getWorkflowInstanceByID: jest.fn(() => null),
    };
    const noTaskNode = {
      getWorkflowInstanceByID: jest.fn(() => ({
        getTaskByID: jest.fn(() => null),
      })),
    };

    expect(writeOperationsLibrary.triggerProductMaintenanceApprove(approvedNode)).toBe(true);
    expect(writeOperationsLibrary.triggerProductMaintenanceApprove(rejectedNode)).toBe(false);
    expect(writeOperationsLibrary.triggerProductMaintenanceApprove(noWorkflowNode)).toBe(false);
    expect(writeOperationsLibrary.triggerProductMaintenanceApprove(noTaskNode)).toBe(false);
  });
});
