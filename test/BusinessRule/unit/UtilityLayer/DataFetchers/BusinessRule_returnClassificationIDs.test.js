const businessRuleModule = require('../../../../../step-configs/BusinessRule/BusinessRule_returnClassificationIDs');

beforeEach(() => {
  global.com = {
    stibo: {
      core: {
        domain: {
          classificationproductlinktype: {
            ClassificationProductLinkTypeHome: function ClassificationProductLinkTypeHome() {}
          }
        }
      }
    }
  };
});

afterEach(() => {
  delete global.com;
});

test('returns classification IDs from product links for the selected link type', () => {
  const step = {
    getHome: () => ({
      getLinkTypeByID: (id) => ({ getID: () => id })
    })
  };

  const product = {
    queryClassificationProductLinks: (linkType) => ({
      forEach: (cb) => {
        cb({ getClassification: () => ({ getID: () => `CLS_${linkType.getID()}_1` }) });
        cb({ getClassification: () => null });
        cb({ getClassification: () => ({ getID: () => `CLS_${linkType.getID()}_2` }) });
      }
    })
  };

  const parsed = JSON.parse(businessRuleModule.operation0(step, product, 'MyLinkType'));

  expect(parsed).toEqual(['CLS_MyLinkType_1', 'CLS_MyLinkType_2']);
});
