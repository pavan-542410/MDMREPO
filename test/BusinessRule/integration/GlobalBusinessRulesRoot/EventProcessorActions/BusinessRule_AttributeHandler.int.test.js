const br = require('../../../../../step-configs/BusinessRule/BusinessRule_AttributeHandler');

function makeJavaSet() {
  function JsSet() {
    this._list = [];
  }
  JsSet.prototype.add = function add(value) {
    if (this._list.indexOf(value) === -1) {
      this._list.push(value);
    }
  };
  JsSet.prototype.iterator = function iterator() {
    let idx = 0;
    const items = this._list.slice();
    return {
      hasNext: () => idx < items.length,
      next: () => items[idx++]
    };
  };
  JsSet.prototype.toArray = function toArray() {
    return this._list.slice();
  };
  return JsSet;
}

function makeIterator(items) {
  let idx = 0;
  return {
    hasNext: () => idx < items.length,
    next: () => items[idx++]
  };
}

function makeGroup(id, children) {
  return {
    getID: () => id,
    getChildren: () => ({
      iterator: () => makeIterator(children || [])
    })
  };
}

describe('AttributeHandler (integration)', () => {
  beforeEach(() => {
    global.log = { info: jest.fn() };
    global.java = {
      util: {
        LinkedHashSet: makeJavaSet(),
        HashSet: makeJavaSet()
      }
    };
  });

  afterEach(() => {
    delete global.log;
    delete global.java;
  });

  test('handles AttributeHelpText write failures without throwing', () => {
    const attribute = {
      getAttributeGroups: () => ({ forEach: (fn) => [makeGroup('Materials')].forEach(fn) }),
      addAttributeGroup: jest.fn(),
      removeAttributeGroup: jest.fn(),
      getValue: (id) => {
        if (id === 'Purpose') return { getSimpleValue: () => 'Some purpose' };
        if (id === 'AttributeHelpText') {
          return {
            setSimpleValue: () => {
              throw new Error('write denied');
            }
          };
        }
        return { getSimpleValue: () => null };
      },
      getValidForObjectTypes: () => ({ forEach: () => {} })
    };
    const hierarchicalViewGroup = makeGroup('SFAttributeGroups', [makeGroup('Materials')]);
    const automatedAttrGroups = makeGroup('AutomatedAttributeGroups', [
      makeGroup('StyleVariant', [makeGroup('SKU_Materials')])
    ]);

    expect(() => br.operation0(attribute, {}, hierarchicalViewGroup, automatedAttrGroups)).not.toThrow();
    expect(global.log.info).toHaveBeenCalledWith(expect.stringMatching(/Error setting AttributeHelpText/));
  });
});
