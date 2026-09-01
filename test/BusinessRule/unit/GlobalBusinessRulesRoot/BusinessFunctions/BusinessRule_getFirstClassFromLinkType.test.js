const getFirstClassFromLinkType = require('../../../../../step-configs/BusinessRule/BusinessRule_getFirstClassFromLinkType');

describe('BusinessRule_getFirstClassFromLinkType', () => {
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
      },
    };
  });

  afterEach(() => {
    delete global.com;
  });

  test('returns the first linked classification when a link type and links are available', () => {
    const classification = { id: 'CLASS_1' };
    const linkType = { id: 'SKUToSizeSchemaLink' };
    const man = {
      getHome: jest.fn(() => ({
        getLinkTypeByID: jest.fn(() => linkType),
      })),
    };
    const curObj = {
      queryClassificationProductLinks: jest.fn(() => ({
        asList: jest.fn(() => ({
          size: jest.fn(() => 1),
          get: jest.fn(() => ({
            getClassification: jest.fn(() => classification),
          })),
        })),
      })),
    };

    expect(getFirstClassFromLinkType.operation0(man, curObj, 'SKUToSizeSchemaLink')).toBe(classification);
  });

  test('returns null when no link type or no classification link exists', () => {
    const manWithoutLinkType = {
      getHome: jest.fn(() => ({
        getLinkTypeByID: jest.fn(() => null),
      })),
    };
    const manWithLinkType = {
      getHome: jest.fn(() => ({
        getLinkTypeByID: jest.fn(() => ({ id: 'ProductToBrandLink' })),
      })),
    };
    const curObj = {
      queryClassificationProductLinks: jest.fn(() => ({
        asList: jest.fn(() => ({
          size: jest.fn(() => 0),
        })),
      })),
    };

    expect(getFirstClassFromLinkType.operation0(manWithoutLinkType, curObj, 'MissingLinkType')).toBeNull();
    expect(getFirstClassFromLinkType.operation0(manWithLinkType, curObj, 'ProductToBrandLink')).toBeNull();
  });
});
