const businessRuleModule = require('../../../../../step-configs/BusinessRule/BusinessRule_returnHierarchyAttributeLinksJSON');

function forEachable(arr) {
  return {
    forEach: (cb) => {
      for (let i = 0; i < arr.length; i += 1) {
        const keepGoing = cb(arr[i]);
        if (keepGoing === false) {
          break;
        }
      }
    }
  };
}

function iteratorFrom(arr) {
  let i = 0;
  return {
    hasNext: () => i < arr.length,
    next: () => arr[i++]
  };
}

function makeClassNode({ id, className, groupName, divisionName, attrLinks }) {
  return {
    getID: () => id,
    getName: () => className,
    getObjectType: () => ({ getID: () => 'ProductClassificationNode' }),
    getAttributeLinks: () => ({ iterator: () => iteratorFrom(attrLinks) })
  };
}

function makeIgnoredNode() {
  return {
    getObjectType: () => ({ getID: () => 'NotProductClassificationNode' })
  };
}

test('returns normalized hierarchy matrix and defaults rootId when blank', () => {
  const logger = { info: jest.fn() };
  const attrWithHelp = {
    getAttribute: () => ({
      getID: () => 'color',
      getName: () => 'Color',
      getValue: () => ({ getSimpleValue: () => 'Pick a color' })
    }),
    isMandatory: () => true
  };

  const attrWithoutHelp = {
    getAttribute: () => ({
      getID: () => 'size',
      getName: () => 'Size',
      getValue: () => {
        throw new Error('missing metadata');
      }
    }),
    isMandatory: () => false
  };

  const classB = makeClassNode({
    id: 'CLS_B',
    className: 'Bottoms',
    groupName: 'Group Z',
    divisionName: 'Division A',
    attrLinks: [attrWithoutHelp]
  });

  const classA = makeClassNode({
    id: 'CLS_A',
    className: 'Accessories',
    groupName: 'Group A',
    divisionName: 'Division A',
    attrLinks: [attrWithHelp]
  });

  const group1 = {
    getName: () => 'Group Z',
    getChildren: () => forEachable([classB, makeIgnoredNode()])
  };

  const group2 = {
    getName: () => 'Group A',
    getChildren: () => forEachable([classA])
  };

  const division = {
    getName: () => 'Division A',
    getChildren: () => forEachable([group1, group2])
  };

  const root = {
    getChildren: () => forEachable([division])
  };

  const step = {
    getProductHome: () => ({
      getProductByID: (id) => (id === 'StitchFixMerchProductHierarchy' ? root : null)
    })
  };

  const parsed = JSON.parse(businessRuleModule.operation0(step, logger, '   ', false));

  expect(parsed.rootId).toBe('StitchFixMerchProductHierarchy');
  expect(parsed.classCount).toBe(2);
  expect(parsed.classes.map((c) => c.classId)).toEqual(['CLS_A', 'CLS_B']);
  expect(parsed.classes[0].attributes[0]).toEqual({
    attributeId: 'color',
    attributeName: 'Color',
    attributeHelpText: 'Pick a color',
    mandatory: true
  });
  expect(parsed.classes[1].attributes[0]).toEqual({
    attributeId: 'size',
    attributeName: 'Size',
    attributeHelpText: '',
    mandatory: false
  });
});

test('throws when root node does not exist', () => {
  const logger = { info: jest.fn() };
  const step = {
    getProductHome: () => ({ getProductByID: () => null })
  };

  expect(() => businessRuleModule.operation0(step, logger, 'MissingRoot', false)).toThrow(
    'returnHierarchyAttributeLinksJSON: root node not found: MissingRoot'
  );
});
