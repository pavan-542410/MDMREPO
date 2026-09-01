const businessRuleModule = require('../../../../../step-configs/BusinessRule/BusinessRule_returnLinksJSON');

function arrCollection(arr) {
  return {
    size: () => arr.length,
    toArray: () => arr
  };
}

function val(attrID, simpleValue) {
  return {
    getAttribute: () => ({ getID: () => attrID }),
    getSimpleValue: () => simpleValue
  };
}

beforeEach(() => {
  global.Packages = {
    com: {
      stibo: {
        core: {
          domain: {
            classificationproductlinktype: {
              ClassificationProductLinkTypeHome: function ClassificationProductLinkTypeHome() {}
            }
          }
        }
      }
    }
  };
});

afterEach(() => {
  delete global.Packages;
});

test('returns classification links and omits blacklisted link types', () => {
  const keptType = { getID: () => 'LinkTypeKeep' };
  const skippedType = { getID: () => 'LinkTypeSkip' };

  const manager = {
    getHome: () => ({
      getLinkTypes: () => arrCollection([keptType, skippedType])
    })
  };

  const obj = {
    queryClassificationProductLinks: (linkType) => ({
      asList: (_limit) => {
        if (linkType.getID() === 'LinkTypeKeep') {
          return arrCollection([
            {
              getClassification: () => ({ getID: () => 'CLS_1' }),
              getValues: () => arrCollection([val('link_meta', 'X'), val('blank_meta', '')])
            },
            {
              getClassification: () => null,
              getValues: () => arrCollection([])
            }
          ]);
        }
        return arrCollection([
          {
            getClassification: () => ({ getID: () => 'CLS_2' }),
            getValues: () => arrCollection([])
          }
        ]);
      }
    })
  };

  const parsed = JSON.parse(businessRuleModule.operation0(manager, obj, ['LinkTypeSkip']));

  expect(parsed).toEqual([
    {
      linkTypeID: 'LinkTypeKeep',
      linkTarget: 'CLS_1',
      linkMetaData: [{ attrID: 'link_meta', sValue: 'X' }]
    }
  ]);
});
