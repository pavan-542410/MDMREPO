const businessRuleModule = require('../../../../../step-configs/BusinessRule/BusinessRule_returnValuesJSON');

function valueObj(simpleValue, { derived = false, inherited = false } = {}) {
  return {
    isDerived: () => derived,
    isInherited: () => inherited,
    getSimpleValue: () => simpleValue
  };
}

test('filters derived/inherited/null values unless includes are enabled', () => {
  const valuesByAttr = {
    color: valueObj('Red'),
    calc_attr: valueObj('Computed', { derived: true }),
    inherited_attr: valueObj('Inherited', { inherited: true }),
    empty_attr: valueObj(null)
  };

  const obj = { getValue: (attrID) => valuesByAttr[attrID] };

  const parsed = JSON.parse(
    businessRuleModule.operation0(null, null, obj, Object.keys(valuesByAttr), false, false)
  );

  expect(parsed).toEqual([{ attrID: 'color', sValue: 'Red' }]);
});

test('includes derived/inherited when flags are true', () => {
  const valuesByAttr = {
    color: valueObj('Red'),
    calc_attr: valueObj('Computed', { derived: true }),
    inherited_attr: valueObj('Inherited', { inherited: true }),
    empty_attr: valueObj(null)
  };

  const obj = { getValue: (attrID) => valuesByAttr[attrID] };

  const parsed = JSON.parse(
    businessRuleModule.operation0(null, null, obj, Object.keys(valuesByAttr), true, true)
  );

  expect(parsed).toEqual([
    { attrID: 'color', sValue: 'Red' },
    { attrID: 'calc_attr', sValue: 'Computed' },
    { attrID: 'inherited_attr', sValue: 'Inherited' }
  ]);
});
