const businessRuleModule = require('../../../../../step-configs/BusinessRule/BusinessRule_returnAllValuesJSON');

function valueObj(simpleValue, { derived = false, inherited = false } = {}) {
  return {
    isDerived: () => derived,
    isInherited: () => inherited,
    getSimpleValue: () => simpleValue
  };
}

test('respects blacklist and include flags', () => {
  const obj = {
    getValue: (attrID) => {
      const map = {
        keep_me: valueObj('v1'),
        blacklist_me: valueObj('v2'),
        derived_attr: valueObj('v3', { derived: true }),
        inherited_attr: valueObj('v4', { inherited: true })
      };
      return map[attrID];
    }
  };

  const returnAllValidAttributeIDs = {
    evaluate: jest.fn(() => ['keep_me', 'blacklist_me', 'derived_attr', 'inherited_attr'])
  };

  const parsed = JSON.parse(
    businessRuleModule.operation0(
      null,
      returnAllValidAttributeIDs,
      obj,
      ['blacklist_me'],
      false,
      false
    )
  );

  expect(returnAllValidAttributeIDs.evaluate).toHaveBeenCalledWith({
    obj,
    returnClassificationLinks: true,
    returnProductLinks: true
  });
  expect(parsed).toEqual([{ attrID: 'keep_me', sValue: 'v1' }]);
});

test('includes derived/inherited when enabled and omits falsy simple values', () => {
  const obj = {
    getValue: (attrID) => {
      const map = {
        keep_me: valueObj('v1'),
        derived_attr: valueObj('v2', { derived: true }),
        inherited_attr: valueObj('v3', { inherited: true }),
        empty_attr: valueObj('')
      };
      return map[attrID];
    }
  };

  const returnAllValidAttributeIDs = {
    evaluate: jest.fn(() => ['keep_me', 'derived_attr', 'inherited_attr', 'empty_attr'])
  };

  const parsed = JSON.parse(
    businessRuleModule.operation0(null, returnAllValidAttributeIDs, obj, [], true, true)
  );

  expect(parsed).toEqual([
    { attrID: 'keep_me', sValue: 'v1' },
    { attrID: 'derived_attr', sValue: 'v2' },
    { attrID: 'inherited_attr', sValue: 'v3' }
  ]);
});
