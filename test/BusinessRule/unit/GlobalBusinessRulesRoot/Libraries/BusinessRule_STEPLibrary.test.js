const stepLibrary = require('../../../../../step-configs/BusinessRule/BusinessRule_STEPLibrary');

function createQuery(matches) {
  return {
    forEach: jest.fn((callback) => {
      matches.forEach(callback);
    }),
  };
}

describe('BusinessRule_STEPLibrary', () => {
  beforeEach(() => {
    global.com = {
      stibo: {
        core: {
          domain: {
            classificationproductlinktype: {
              ClassificationProductLinkTypeHome: function ClassificationProductLinkTypeHome() {},
            },
          },
        },
        lookuptable: {
          domain: {
            LookupTableHome: function LookupTableHome() {},
          },
        },
      },
    };
    global.log = {
      info: jest.fn(),
    };
    global.logger = {
      info: jest.fn(),
    };
    global.message_container = {
      getValue: jest.fn(() => ({
        addValue: jest.fn(),
      })),
    };
  });

  afterEach(() => {
    delete global.com;
    delete global.log;
    delete global.logger;
    delete global.message_container;
  });

  test('returns STEP homes and validates attribute/object-type compatibility', () => {
    const step = {
      getAttributeGroupHome: jest.fn(() => 'attrGroupHome'),
      getProductHome: jest.fn(() => 'productHome'),
      getEntityHome: jest.fn(() => 'entityHome'),
      getClassificationHome: jest.fn(() => 'classificationHome'),
      getReferenceTypeHome: jest.fn(() => 'refTypeHome'),
      getNodeHome: jest.fn(() => 'nodeHome'),
      getHome: jest.fn((homeType) => homeType),
      getAttributeHome: jest.fn(() => 'attributeHome'),
      getListOfValuesHome: jest.fn(() => 'lovHome'),
      getObjectTypeHome: jest.fn(() => 'objectTypeHome'),
    };
    const objType = { id: 'ProductNode' };
    const attr = {
      getValidForObjectTypes: jest.fn(() => {
        const values = [{
          equals: jest.fn(() => false),
        }, {
          equals: jest.fn((candidate) => candidate === objType),
        }];
        let index = 0;

        return {
          iterator: jest.fn(() => ({
            hasNext: jest.fn(() => index < values.length),
            next: jest.fn(() => values[index++]),
          })),
        };
      }),
    };

    expect(stepLibrary.getAllHomes(step)).toEqual({
      attrGroup: 'attrGroupHome',
      product: 'productHome',
      entity: 'entityHome',
      classification: 'classificationHome',
      refType: 'refTypeHome',
      node: 'nodeHome',
      linkType: global.com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome,
      attribute: 'attributeHome',
      lov: 'lovHome',
      lookupTable: global.com.stibo.lookuptable.domain.LookupTableHome,
      objectType: 'objectTypeHome',
    });
    expect(stepLibrary.isAttrValidForObjectType(attr, objType)).toBe(true);
    expect(stepLibrary.isAttrValidForObjectType({
      getValidForObjectTypes: jest.fn(() => ({
        iterator: jest.fn(() => ({
          hasNext: jest.fn(() => false),
        })),
      })),
    }, objType)).toBe(false);
  });

  test('updates classification links and metadata while deleting obsolete links', () => {
    const classificationType = {
      class: 'class com.stibo.core.domain.impl.ClassificationProductLinkTypeImpl',
      getID: jest.fn(() => 'ProductToClassLInk'),
    };
    const keepLink = {
      getProduct: jest.fn(() => ({ getID: jest.fn(() => 'PRD_1') })),
      getClassification: jest.fn(() => ({ getID: jest.fn(() => 'CLASS_KEEP') })),
      delete: jest.fn(),
    };
    const removeLink = {
      getProduct: jest.fn(() => ({ getID: jest.fn(() => 'PRD_1') })),
      getClassification: jest.fn(() => ({ getID: jest.fn(() => 'CLASS_OLD') })),
      delete: jest.fn(),
    };
    const newLinkValue = {
      setSimpleValue: jest.fn(),
    };
    const newLink = {
      getProduct: jest.fn(() => ({ getID: jest.fn(() => 'PRD_1') })),
      getClassification: jest.fn(() => ({ getID: jest.fn(() => 'CLASS_NEW') })),
      getValue: jest.fn(() => newLinkValue),
    };
    const source = {
      getID: jest.fn(() => 'PRD_1'),
      queryClassificationProductLinks: jest.fn(() => createQuery([keepLink, removeLink])),
      createClassificationProductLink: jest.fn(() => newLink),
    };

    const result = stepLibrary.manageLinksOrReferences(
      source,
      classificationType,
      ['CLASS_KEEP', 'CLASS_NEW'],
      (targetID) => ({ id: targetID }),
      { CLASS_NEW: { sequence: '10' } },
      global.logger
    );

    expect(removeLink.delete).toHaveBeenCalledTimes(1);
    expect(source.createClassificationProductLink).toHaveBeenCalledWith({ id: 'CLASS_NEW' }, classificationType);
    expect(newLinkValue.setSimpleValue).toHaveBeenCalledWith('10');
    expect(result.CLASS_KEEP).toBe('CLASS_KEEP');
    expect(result.CLASS_NEW).toBe(newLink);
  });

  test('handles reference updates, unsupported types, and metadata write failures', () => {
    const referenceType = {
      class: 'class com.stibo.core.domain.impl.ReferenceTypeImpl',
      getID: jest.fn(() => 'ProductToLabel'),
    };
    const oldRef = {
      getSource: jest.fn(() => ({ getID: jest.fn(() => 'PRD_1') })),
      getTarget: jest.fn(() => ({ getID: jest.fn(() => 'OLD') })),
      delete: jest.fn(),
    };
    const newRef = {
      getSource: jest.fn(() => ({ getID: jest.fn(() => 'PRD_1') })),
      getTarget: jest.fn(() => ({ getID: jest.fn(() => 'NEW') })),
      getValue: jest.fn(() => {
        throw new Error('metadata write failed');
      }),
    };
    const source = {
      getID: jest.fn(() => 'PRD_1'),
      queryReferences: jest.fn(() => createQuery([oldRef])),
      createReference: jest.fn(() => newRef),
    };
    const addValue = jest.fn();
    global.message_container.getValue.mockReturnValue({
      addValue,
    });

    expect(stepLibrary.manageLinksOrReferences(
      source,
      referenceType,
      ['NEW'],
      (targetID) => ({ id: targetID }),
      { NEW: { note: 'metadata' } },
      null
    ).NEW).toBe(newRef);
    expect(oldRef.delete).toHaveBeenCalledTimes(1);
    expect(addValue).toHaveBeenCalledWith(expect.stringContaining('Attribute Exception: note with value metadata.'));

    expect(() => stepLibrary.getCurrentLinksOrReferences(source, { class: 'Unsupported' }, null))
      .toThrow('Unsupported type');
    expect(() => stepLibrary.addNewLinksOrReferences(source, { class: 'Unsupported' }, ['X'], {}, () => ({ id: 'X' }), null))
      .toThrow('Unsupported type');
  });
});
