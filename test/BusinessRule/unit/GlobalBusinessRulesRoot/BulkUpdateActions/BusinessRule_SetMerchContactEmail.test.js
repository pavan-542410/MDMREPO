const setMerchContactEmail = require('../../../../../step-configs/BusinessRule/BusinessRule_SetMerchContactEmail');

function createValueObject(valuesByID, children, refs) {
  return {
    getValue: jest.fn((attrID) => ({
      getSimpleValue: jest.fn(() => valuesByID[attrID] || null),
      setSimpleValue: jest.fn((value) => {
        valuesByID[attrID] = value;
      }),
    })),
    getChildren: jest.fn(() => {
      let index = 0;

      return {
        iterator: jest.fn(() => ({
          hasNext: jest.fn(() => index < (children || []).length),
          next: jest.fn(() => children[index++]),
        })),
      };
    }),
    queryReferences: jest.fn(() => ({
      asList: jest.fn(() => ({
        toArray: jest.fn(() => refs || []),
      })),
    })),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => valuesByID.objectTypeID),
    })),
    toString: jest.fn(() => valuesByID.id || 'obj'),
    __values: valuesByID,
  };
}

describe('BusinessRule_SetMerchContactEmail', () => {
  beforeEach(() => {
    global.logger = {
      info: jest.fn(),
    };
    global.com = {
      stibo: {
        core: {
          domain: {
            entity: {
              Entity: function Entity() {},
            },
          },
        },
        query: {
          condition: {
            Conditions: {
              objectType: jest.fn(() => ({
                and: jest.fn(() => 'combined-condition'),
              })),
              hierarchy: jest.fn(() => ({
                simpleBelow: jest.fn(() => 'hierarchy-condition'),
              })),
            },
          },
        },
      },
    };
  });

  afterEach(() => {
    delete global.logger;
    delete global.com;
  });

  test('sets merch_contact_email when hierarchy and attribute criteria pass', () => {
    const hierarchyTarget = {
      getID: jest.fn(() => 'CLASS_1'),
    };
    const attrCrit = createValueObject({
      id: 'attr-crit',
      objectTypeID: 'AttributeCriteria',
      Attribute: 'gender_intent',
      Values: 'Female',
    }, []);
    const hierCrit = createValueObject({
      id: 'hier-crit',
      objectTypeID: 'HierarchyCriteria',
    }, [], [{
      getTarget: jest.fn(() => hierarchyTarget),
    }]);
    const critGroup = createValueObject({
      id: 'crit-group',
      CriteriaGroupingOffset: '1',
    }, [attrCrit, hierCrit]);
    const valueObject = createValueObject({
      id: 'mapping-1',
      RuleSetExecutionOrder: '10',
      ValueToSet: 'merch@example.com',
    }, [critGroup]);
    const svValues = {
      gender_intent: 'Female',
      merch_contact_email: null,
    };
    const node = {
      getID: jest.fn(() => 'SV_1'),
      getValue: jest.fn((attrID) => ({
        getSimpleValue: jest.fn(() => svValues[attrID] || null),
        setSimpleValue: jest.fn((value) => {
          svValues[attrID] = value;
        }),
      })),
    };
    const step = {
      getNodeHome: jest.fn(() => ({
        getObjectByKey: jest.fn(() => ({ id: 'mappingRoot' })),
      })),
      getObjectTypeHome: jest.fn(() => ({
        getObjectTypeByID: jest.fn(() => ({ id: 'ValueToSet' })),
      })),
      getReferenceTypeHome: jest.fn(() => ({
        getReferenceTypeByID: jest.fn(() => ({ id: 'HierarchyCriteriaReference' })),
      })),
      getClassificationHome: jest.fn(() => ({
        getClassificationByID: jest.fn(() => hierarchyTarget),
      })),
    };
    const qh = {
      queryFor: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn(() => ({
            asList: jest.fn(() => ({
              toArray: jest.fn(() => [valueObject]),
            })),
          })),
        })),
      })),
    };
    const isBelowF = {
      evaluate: jest.fn(() => ({
        booleanValue: jest.fn(() => true),
      })),
    };

    setMerchContactEmail.operation0(node, step, global.logger, qh, isBelowF);

    expect(svValues.merch_contact_email).toBe('merch@example.com');
    expect(isBelowF.evaluate).toHaveBeenCalledWith({
      productNode: node,
      itemTypeNode: hierarchyTarget,
    });
  });

  test('sets fallback merch_contact_email when criteria do not match', () => {
    const attrCrit = createValueObject({
      id: 'attr-crit',
      objectTypeID: 'AttributeCriteria',
      Attribute: 'gender_intent',
      Values: 'Male',
    }, []);
    const critGroup = createValueObject({
      id: 'crit-group',
      CriteriaGroupingOffset: '1',
    }, [attrCrit]);
    const valueObject = createValueObject({
      id: 'mapping-1',
      RuleSetExecutionOrder: '10',
      ValueToSet: 'merch@example.com',
    }, [critGroup]);
    const svValues = {
      gender_intent: 'Female',
      merch_contact_email: null,
    };
    const node = {
      getValue: jest.fn((attrID) => ({
        getSimpleValue: jest.fn(() => svValues[attrID] || null),
        setSimpleValue: jest.fn((value) => {
          svValues[attrID] = value;
        }),
      })),
    };
    const step = {
      getNodeHome: jest.fn(() => ({
        getObjectByKey: jest.fn(() => ({ id: 'mappingRoot' })),
      })),
      getObjectTypeHome: jest.fn(() => ({
        getObjectTypeByID: jest.fn(() => ({ id: 'ValueToSet' })),
      })),
    };
    const qh = {
      queryFor: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn(() => ({
            asList: jest.fn(() => ({
              toArray: jest.fn(() => [valueObject]),
            })),
          })),
        })),
      })),
    };

    setMerchContactEmail.operation0(node, step, global.logger, qh, {
      evaluate: jest.fn(),
    });

    expect(svValues.merch_contact_email).toBe('merch@example.com');
  });

  test('does not overwrite existing merch_contact_email when no criteria match', () => {
    const attrCrit = createValueObject({
      id: 'attr-crit',
      objectTypeID: 'AttributeCriteria',
      Attribute: 'gender_intent',
      Values: 'Male',
    }, []);
    const critGroup = createValueObject({
      id: 'crit-group',
      CriteriaGroupingOffset: '1',
    }, [attrCrit]);
    const valueObject = createValueObject({
      id: 'mapping-1',
      RuleSetExecutionOrder: '10',
      ValueToSet: 'fallback@example.com',
    }, [critGroup]);
    const svValues = {
      gender_intent: 'Female',
      merch_contact_email: 'already@stitchfix.com',
    };
    const node = {
      getValue: jest.fn((attrID) => ({
        getSimpleValue: jest.fn(() => svValues[attrID] || null),
        setSimpleValue: jest.fn((value) => {
          svValues[attrID] = value;
        }),
      })),
    };
    const step = {
      getNodeHome: jest.fn(() => ({
        getObjectByKey: jest.fn(() => ({ id: 'mappingRoot' })),
      })),
      getObjectTypeHome: jest.fn(() => ({
        getObjectTypeByID: jest.fn(() => ({ id: 'ValueToSet' })),
      })),
    };
    const qh = {
      queryFor: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn(() => ({
            asList: jest.fn(() => ({
              toArray: jest.fn(() => [valueObject]),
            })),
          })),
        })),
      })),
    };

    setMerchContactEmail.operation0(node, step, global.logger, qh, {
      evaluate: jest.fn(),
    });

    expect(svValues.merch_contact_email).toBe('already@stitchfix.com');
  });
});
