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

function makeObjectType(name) {
  return {
    getName: () => name
  };
}

function makeAttribute(initialGroupIds, sourcePurpose, validObjectNames) {
  const attributeGroups = initialGroupIds.map((id) => makeGroup(id));
  const writes = [];

  return {
    _writes: writes,
    getAttributeGroups: () => ({
      forEach: (fn) => attributeGroups.forEach(fn)
    }),
    addAttributeGroup: jest.fn((group) => attributeGroups.push(group)),
    removeAttributeGroup: jest.fn((group) => {
      const idx = attributeGroups.findIndex((g) => g.getID() === group.getID());
      if (idx >= 0) attributeGroups.splice(idx, 1);
    }),
    getValue: (id) => {
      if (id === 'Purpose') {
        return { getSimpleValue: () => sourcePurpose };
      }
      if (id === 'AttributeHelpText') {
        return {
          setSimpleValue: (value) => writes.push(value)
        };
      }
      return { getSimpleValue: () => null };
    },
    getValidForObjectTypes: () => ({
      forEach: (fn) => validObjectNames.map(makeObjectType).forEach(fn)
    })
  };
}

describe('AttributeHandler', () => {
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

  test('maps upherit group membership into automated subgroup and writes help text', () => {
    const hierarchicalViewGroup = makeGroup('SFAttributeGroups', [
      makeGroup('Materials'),
      makeGroup('Construction')
    ]);
    const automatedAttrGroups = makeGroup('AutomatedAttributeGroups', [
      makeGroup('StyleVariant', [
        makeGroup('StyleVariant_Materials'),
        makeGroup('StyleVariant_Construction')
      ])
    ]);
    const attribute = makeAttribute(
      ['StyleVariantUpheritAttributes', 'Materials'],
      'Purpose one\nPurpose two',
      ['StyleVariant']
    );

    br.operation0(attribute, {}, hierarchicalViewGroup, automatedAttrGroups);

    expect(attribute.addAttributeGroup).toHaveBeenCalledWith(
      expect.objectContaining({ getID: expect.any(Function) })
    );
    const addedIds = attribute.addAttributeGroup.mock.calls.map((c) => c[0].getID());
    expect(addedIds).toContain('StyleVariant_Materials');
    expect(attribute._writes[0]).toContain('Purpose one');
    expect(attribute._writes[0]).toContain('Valid for StyleVariant');
  });
});
