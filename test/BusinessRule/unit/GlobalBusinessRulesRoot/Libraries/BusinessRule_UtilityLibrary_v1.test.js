const utilityLibrary = require('../../../../../step-configs/BusinessRule/BusinessRule_UtilityLibrary_v1');

describe('BusinessRule_UtilityLibrary_v1', () => {
  beforeEach(() => {
    global.com = {
      stibo: {
        lookuptable: {
          domain: {
            LookupTableHome: function LookupTableHome() {},
          },
        },
        core: {
          domain: {
            classificationproductlinktype: {
              ClassificationProductLinkTypeHome: function ClassificationProductLinkTypeHome() {},
            },
          },
        },
      },
    };
  });

  afterEach(() => {
    delete global.com;
  });

  test('initializes homes/caches and memoizes each fetcher result', () => {
    const attribute = { getID: jest.fn(() => 'color_family') };
    const classification = { getID: jest.fn(() => 'CLS_1') };
    const product = { getID: jest.fn(() => 'PRD_1') };
    const refType = { getID: jest.fn(() => 'REF_1') };
    const linkType = { getID: jest.fn(() => 'LINK_1') };
    const objectByKey = { getID: jest.fn(() => 'NODE_1') };
    const childList = [{ id: 'C1' }, { id: 'C2' }];
    const node = {
      getValue: jest.fn(() => ({
        getSimpleValue: jest.fn(() => 'Blue'),
      })),
      getChildren: jest.fn(() => ({
        toArray: jest.fn(() => childList),
      })),
      getObjectType: jest.fn(() => ({
        getID: jest.fn(() => 'StyleVariant'),
      })),
    };
    const attrHome = {
      getAttributeByID: jest.fn(() => attribute),
    };
    const lookUpTableHome = {
      getLookupTableValue: jest.fn(() => 'mapped_attr'),
    };
    const classHome = {
      getClassificationByID: jest.fn(() => classification),
    };
    const prodHome = {
      getProductByID: jest.fn(() => product),
    };
    const refTypeHome = {
      getReferenceTypeByID: jest.fn(() => refType),
    };
    const linkTypeHome = {
      getLinkTypeByID: jest.fn(() => linkType),
    };
    const nodeHome = {
      getObjectByKey: jest.fn(() => objectByKey),
    };
    const step = {
      getAttributeHome: jest.fn(() => attrHome),
      getClassificationHome: jest.fn(() => classHome),
      getProductHome: jest.fn(() => prodHome),
      getReferenceTypeHome: jest.fn(() => refTypeHome),
      getNodeHome: jest.fn(() => nodeHome),
      getHome: jest.fn((homeType) => (
        homeType === global.com.stibo.lookuptable.domain.LookupTableHome
          ? lookUpTableHome
          : linkTypeHome
      )),
    };

    const context = utilityLibrary.initialize(step);

    expect(context.attrHome).toBe(attrHome);
    expect(context.lookUpTableHome).toBe(lookUpTableHome);
    expect(context.linkTypeHome).toBe(linkTypeHome);

    expect(utilityLibrary.getAttr('color_family', context.attrCache, context.attrHome)).toBe(attribute);
    expect(utilityLibrary.getAttr('color_family', context.attrCache, context.attrHome)).toBe(attribute);
    expect(attrHome.getAttributeByID).toHaveBeenCalledTimes(1);

    expect(utilityLibrary.getLookUpAttr('ft_color_family', context.lookUpAttrCache, context.lookUpTableHome)).toBe('mapped_attr');
    expect(utilityLibrary.getLookUpAttr('ft_color_family', context.lookUpAttrCache, context.lookUpTableHome)).toBe('mapped_attr');
    expect(lookUpTableHome.getLookupTableValue).toHaveBeenCalledTimes(1);

    expect(utilityLibrary.getClassification('CLS_1', context.classHome, context.classCache)).toBe(classification);
    expect(utilityLibrary.getClassification('CLS_1', context.classHome, context.classCache)).toBe(classification);
    expect(classHome.getClassificationByID).toHaveBeenCalledTimes(1);

    expect(utilityLibrary.getProduct('PRD_1', context.prodHome, context.prodCache)).toBe(product);
    expect(utilityLibrary.getProduct('PRD_1', context.prodHome, context.prodCache)).toBe(product);
    expect(prodHome.getProductByID).toHaveBeenCalledTimes(1);

    expect(utilityLibrary.getRefType('REF_1', context.refTypeHome, context.refTypeCache)).toBe(refType);
    expect(utilityLibrary.getRefType('REF_1', context.refTypeHome, context.refTypeCache)).toBe(refType);
    expect(refTypeHome.getReferenceTypeByID).toHaveBeenCalledTimes(1);

    expect(utilityLibrary.getLinkType('LINK_1', context.linkTypeHome, context.linkTypeCache)).toBe(linkType);
    expect(utilityLibrary.getLinkType('LINK_1', context.linkTypeHome, context.linkTypeCache)).toBe(linkType);
    expect(linkTypeHome.getLinkTypeByID).toHaveBeenCalledTimes(1);

    expect(utilityLibrary.getObjectByKey('NODE_1', 'SKU_ID', context.nodeHome, context.nodeCache)).toBe(objectByKey);
    expect(utilityLibrary.getObjectByKey('NODE_1', 'SKU_ID', context.nodeHome, context.nodeCache)).toBe(objectByKey);
    expect(nodeHome.getObjectByKey).toHaveBeenCalledTimes(1);

    expect(utilityLibrary.getCachedValue('SV_1', 'color_family', node, context.valueCache)).toBe('Blue');
    expect(utilityLibrary.getCachedValue('SV_1', 'color_family', node, context.valueCache)).toBe('Blue');
    expect(node.getValue).toHaveBeenCalledTimes(1);

    expect(utilityLibrary.getChildrenCached(node, 'SV_1', context.childCache)).toBe(childList);
    expect(utilityLibrary.getChildrenCached(node, 'SV_1', context.childCache)).toBe(childList);
    expect(node.getChildren).toHaveBeenCalledTimes(1);

    expect(utilityLibrary.getObjectTypeID(node, 'SV_1', context.objectTypeIDCache)).toBe('StyleVariant');
    expect(utilityLibrary.getObjectTypeID(node, 'SV_1', context.objectTypeIDCache)).toBe('StyleVariant');
    expect(node.getObjectType).toHaveBeenCalledTimes(1);
  });
});
