const businessRuleModule = require('../../../../../step-configs/BusinessRule/BusinessRule_returnValueSearchResultsJSON');

function condition(label, parts = []) {
  return {
    label,
    parts,
    and(other) {
      return condition('and', this.parts.concat([this, other]));
    }
  };
}

beforeEach(() => {
  global.returnValues = true;

  global.Packages = {
    com: {
      stibo: {
        query: {
          home: { QueryHome: function QueryHome() {} },
          condition: {
            Conditions: {
              valueOf: (attr) => ({
                eq: (val) => condition(`eq:${attr.getID()}=${val}`)
              })
            }
          }
        },
        core: {
          domain: {
            Product: function Product() {},
            Classification: function Classification() {},
            Asset: function Asset() {},
            entity: {
              Entity: function Entity() {}
            }
          }
        }
      }
    }
  };
});

afterEach(() => {
  delete global.Packages;
  delete global.returnValues;
});

test('throws for invalid superObjectType', () => {
  const manager = {
    getHome: () => ({ queryFor: () => ({}) }),
    getAttributeHome: () => ({ getAttributeByID: (id) => ({ getID: () => id }) })
  };

  expect(() => businessRuleModule.operation0(null, null, manager, '{}', 'unknownType')).toThrow(
    'Invalid or missing superObjectType: unknownType'
  );
});

test('queries nodes by criteria and returns IDs plus values', () => {
  const nodes = [
    {
      getID: () => 'NODE_1',
      getValues: () => ({
        toArray: () => [
          {
            getAttribute: () => ({ getID: () => 'color' }),
            getSimpleValue: () => 'Red'
          },
          {
            getAttribute: () => ({ getID: () => 'empty_attr' }),
            getSimpleValue: () => null
          }
        ]
      })
    }
  ];

  const whereSpy = jest.fn();
  const query = {
    where: whereSpy,
    execute: () => ({ asList: () => ({ forEach: (cb) => nodes.forEach(cb) }) })
  };

  const manager = {
    getHome: () => ({ queryFor: () => query }),
    getAttributeHome: () => ({ getAttributeByID: (id) => ({ getID: () => id }) })
  };

  const criteria = JSON.stringify({ color: 'Red', size: 'M' });
  const parsed = JSON.parse(businessRuleModule.operation0(null, null, manager, criteria, 'product'));

  expect(whereSpy).toHaveBeenCalledTimes(1);
  expect(parsed).toEqual([
    {
      id: 'NODE_1',
      values: {
        color: 'Red'
      }
    }
  ]);
});
