const util = require('../../../../../step-configs/BusinessRule/BusinessRule_UtilityLibrary');

describe('BusinessRule_UtilityLibrary', () => {
  beforeEach(() => {
    global.com = {
      stibo: {
        lookuptable: {
          domain: {
            LookupTableHome: function LookupTableHome() {}
          }
        },
        core: {
          domain: {
            classificationproductlinktype: {
              ClassificationProductLinkTypeHome: function ClassificationProductLinkTypeHome() {}
            }
          }
        }
      }
    };
    global.logger = {
      warning: jest.fn()
    };
  });

  afterEach(() => {
    delete global.com;
    delete global.logger;
  });

  test('initialize returns STEP homes and empty caches', () => {
    const step = {
      getAttributeHome: () => 'attrHome',
      getAttributeGroupHome: () => 'attrGroupHome',
      getListOfValuesHome: () => 'lovHome',
      getHome: (homeType) => homeType,
      getClassificationHome: () => 'classHome',
      getProductHome: () => 'prodHome',
      getReferenceTypeHome: () => 'refTypeHome',
      getNodeHome: () => 'nodeHome'
    };

    const context = util.initialize(step);

    expect(context.attrHome).toBe('attrHome');
    expect(context.attrGroupHome).toBe('attrGroupHome');
    expect(context.lovHome).toBe('lovHome');
    expect(context.lookUpTableHome).toBe(global.com.stibo.lookuptable.domain.LookupTableHome);
    expect(context.linkTypeHome).toBe(global.com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome);
    expect(context.classHome).toBe('classHome');
    expect(context.prodHome).toBe('prodHome');
    expect(context.refTypeHome).toBe('refTypeHome');
    expect(context.nodeHome).toBe('nodeHome');
    expect(context.attrCache).toEqual({});
    expect(context.objectTypeIDCache).toEqual({});
  });

  test('cache helpers call each STEP home once per ID', () => {
    const attrHome = { getAttributeByID: jest.fn((id) => ({ id })) };
    const lookUpTableHome = { getLookupTableValue: jest.fn((tableID, id) => `${tableID}:${id}`) };
    const classHome = { getClassificationByID: jest.fn((id) => ({ id })) };
    const prodHome = { getProductByID: jest.fn((id) => ({ id })) };
    const refTypeHome = { getReferenceTypeByID: jest.fn((id) => ({ id })) };
    const linkTypeHome = { getLinkTypeByID: jest.fn((id) => ({ id })) };
    const nodeHome = { getObjectByKey: jest.fn((key, id) => ({ key, id })) };

    const attrCache = {};
    const lookUpAttrCache = {};
    const classCache = {};
    const prodCache = {};
    const refTypeCache = {};
    const linkTypeCache = {};
    const nodeCache = {};
    const valueCache = {};
    const childCache = {};
    const objectTypeIDCache = {};

    const node = {
      getValue: () => ({ getSimpleValue: () => 'cached-value' }),
      getChildren: () => ({ toArray: () => ['child-1'] }),
      getObjectType: () => ({ getID: () => 'SKUNode' })
    };

    expect(util.getAttr('attr1', attrCache, attrHome)).toEqual({ id: 'attr1' });
    expect(util.getAttr('attr1', attrCache, attrHome)).toEqual({ id: 'attr1' });
    expect(attrHome.getAttributeByID).toHaveBeenCalledTimes(1);

    expect(util.getLookUpAttr('legacy_attr', lookUpAttrCache, lookUpTableHome)).toBe('ft_attr_map:legacy_attr');
    expect(util.getLookUpAttr('legacy_attr', lookUpAttrCache, lookUpTableHome)).toBe('ft_attr_map:legacy_attr');
    expect(lookUpTableHome.getLookupTableValue).toHaveBeenCalledTimes(1);

    expect(util.getClassification('CLS_1', classHome, classCache)).toEqual({ id: 'CLS_1' });
    expect(util.getClassification('CLS_1', classHome, classCache)).toEqual({ id: 'CLS_1' });
    expect(classHome.getClassificationByID).toHaveBeenCalledTimes(1);

    expect(util.getProduct('PRD_1', prodHome, prodCache)).toEqual({ id: 'PRD_1' });
    expect(util.getProduct('PRD_1', prodHome, prodCache)).toEqual({ id: 'PRD_1' });
    expect(prodHome.getProductByID).toHaveBeenCalledTimes(1);

    expect(util.getRefType('RefType', refTypeHome, refTypeCache)).toEqual({ id: 'RefType' });
    expect(util.getRefType('RefType', refTypeHome, refTypeCache)).toEqual({ id: 'RefType' });
    expect(refTypeHome.getReferenceTypeByID).toHaveBeenCalledTimes(1);

    expect(util.getLinkType('LinkType', linkTypeHome, linkTypeCache)).toEqual({ id: 'LinkType' });
    expect(util.getLinkType('LinkType', linkTypeHome, linkTypeCache)).toEqual({ id: 'LinkType' });
    expect(linkTypeHome.getLinkTypeByID).toHaveBeenCalledTimes(1);

    expect(util.getObjectByKey('Node_1', 'SFMPHNameKey', nodeHome, nodeCache)).toEqual({
      key: 'SFMPHNameKey',
      id: 'Node_1'
    });
    expect(util.getObjectByKey('Node_1', 'SFMPHNameKey', nodeHome, nodeCache)).toEqual({
      key: 'SFMPHNameKey',
      id: 'Node_1'
    });
    expect(nodeHome.getObjectByKey).toHaveBeenCalledTimes(1);

    expect(util.getCachedValue('SKU_1', 'attr1', node, valueCache)).toBe('cached-value');
    expect(util.getCachedValue('SKU_1', 'attr1', node, valueCache)).toBe('cached-value');
    expect(valueCache).toEqual({ SKU_1attr1: 'cached-value' });

    expect(util.getChildrenCached(node, 'PARENT_1', childCache)).toEqual(['child-1']);
    expect(util.getChildrenCached(node, 'PARENT_1', childCache)).toEqual(['child-1']);

    expect(util.getObjectTypeID(node, 'SKU_1', objectTypeIDCache)).toBe('SKUNode');
    expect(util.getObjectTypeID(node, 'SKU_1', objectTypeIDCache)).toBe('SKUNode');
  });

  test('smartReferenceCreate deletes obsolete refs and creates missing refs', () => {
    const refType = {
      getID: () => 'ProductToLabel'
    };
    const newTarget = {
      getID: () => 'NEW'
    };
    const obsoleteReference = {
      getTarget: () => ({
        getID: () => 'OLD'
      }),
      delete: jest.fn()
    };
    const createReference = jest.fn();

    const currentIdsMap = util.smartReferenceCreate({
      queryReferences: () => ({
        forEach: (callback) => {
          callback(obsoleteReference);
        }
      }),
      createReference
    }, refType, newTarget);

    expect(obsoleteReference.delete).toHaveBeenCalledTimes(1);
    expect(createReference).toHaveBeenCalledWith(newTarget, refType);
    expect(currentIdsMap).toEqual({});
  });

  test('smartReferenceCreate keeps existing desired refs and avoids duplicate creation', () => {
    const refType = {
      getID: () => 'ProductToLabel'
    };
    const target = {
      getID: () => 'KEEP'
    };
    const existingReference = {
      getTarget: () => target,
      delete: jest.fn()
    };
    const createReference = jest.fn();

    const currentIdsMap = util.smartReferenceCreate({
      queryReferences: () => ({
        forEach: (callback) => {
          callback(existingReference);
        }
      }),
      createReference
    }, refType, target);

    expect(existingReference.delete).not.toHaveBeenCalled();
    expect(createReference).not.toHaveBeenCalled();
    expect(currentIdsMap).toEqual({
      KEEP: true
    });
  });

  test('smartReferenceCreate logs delete/create failures without throwing', () => {
    const refType = {
      getID: () => 'ProductToLabel'
    };
    const target = {
      getID: () => 'TARGET'
    };

    expect(util.smartReferenceCreate({
      queryReferences: () => ({
        forEach: (callback) => {
          callback({
            getTarget: () => ({
              getID: () => 'OLD'
            }),
            delete: () => {
              throw new Error('delete failed');
            }
          });
        }
      }),
      createReference: () => {
        throw new Error('create failed');
      }
    }, refType, target)).toEqual({});

    expect(global.logger.warning).toHaveBeenCalledWith(expect.stringContaining('Failed to delete reference to OLD'));
    expect(global.logger.warning).toHaveBeenCalledWith(expect.stringContaining('Failed to create reference to TARGET'));
  });
});
