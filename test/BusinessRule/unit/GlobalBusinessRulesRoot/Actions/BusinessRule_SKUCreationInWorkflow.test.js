const br = require('../../../../../step-configs/BusinessRule/BusinessRule_SKUCreationInWorkflow');

function createValueHolder(initialValue, attrID) {
  let currentValue = initialValue;

  return {
    getAttribute: jest.fn(() => ({
      getID: jest.fn(() => attrID),
    })),
    getSimpleValue: jest.fn(() => currentValue),
    setSimpleValue: jest.fn((nextValue) => {
      currentValue = nextValue;
    }),
    canSetValue: jest.fn(() => true),
    isInherited: jest.fn(() => false),
  };
}

function createCollection(items) {
  return {
    size: jest.fn(() => items.length),
    get: jest.fn((index) => items[index]),
    iterator: jest.fn(() => {
      let index = 0;
      return {
        hasNext: jest.fn(() => index < items.length),
        next: jest.fn(() => items[index++]),
      };
    }),
    asList: jest.fn(() => ({
      toArray: jest.fn(() => items.slice()),
    })),
    toArray: jest.fn(() => items.slice()),
    forEach: jest.fn((callback) => {
      items.slice().forEach(callback);
    }),
  };
}

function createAttributeLink(attrID, sequence) {
  return {
    getAttribute: jest.fn(() => ({ getID: jest.fn(() => attrID) })),
    getValue: jest.fn(() => createValueHolder(sequence, 'DisplaySequence')),
  };
}

function createProductNode(id, objectTypeID, values) {
  const valueMap = {};
  Object.keys(values || {}).forEach((attrID) => {
    valueMap[attrID] = createValueHolder(values[attrID], attrID);
  });
  const refsByType = {};
  const classLinksByType = {};
  const children = [];
  let parentNode = null;
  let nodeName = '';

  const node = {
    getID: jest.fn(() => id),
    getObjectType: jest.fn(() => ({ getID: jest.fn(() => objectTypeID) })),
    getValue: jest.fn((attrID) => {
      if (!valueMap[attrID]) {
        valueMap[attrID] = createValueHolder('', attrID);
      }
      return valueMap[attrID];
    }),
    getValues: jest.fn(() => createCollection(Object.values(valueMap))),
    getChildren: jest.fn(() => createCollection(children)),
    createProduct: jest.fn((childID, childTypeID) => {
      const skuNode = createProductNode(childID || `SKU_${children.length + 1}`, childTypeID, {});
      if (node.__defaultSizeSchemaNode && childTypeID === 'SKUNode') {
        skuNode.__classLinksByType.SKUToSizeSchemaLink = [{
          getClassification: jest.fn(() => node.__defaultSizeSchemaNode),
        }];
      }
      skuNode.setParent(node);
      children.push(skuNode);
      return skuNode;
    }),
    queryReferences: jest.fn((refType) => createCollection(refsByType[refType.getID()] || [])),
    queryReferencedBy: jest.fn(() => createCollection([])),
    queryClassificationProductLinks: jest.fn((linkType) => createCollection(classLinksByType[linkType.getID()] || [])),
    createClassificationProductLink: jest.fn((classification, linkType) => {
      if (!classLinksByType[linkType.getID()]) {
        classLinksByType[linkType.getID()] = [];
      }
      classLinksByType[linkType.getID()].push({
        getClassification: jest.fn(() => classification),
      });
    }),
    setParent: jest.fn((nextParent) => {
      parentNode = nextParent;
    }),
    getParent: jest.fn(() => parentNode),
    setName: jest.fn((nextName) => {
      nodeName = nextName;
    }),
    getName: jest.fn(() => nodeName),
    __children: children,
    __refsByType: refsByType,
    __classLinksByType: classLinksByType,
  };

  return node;
}

describe('BusinessRule_SKUCreationInWorkflow', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
    global.java = {
      util: {
        HashSet: function HashSet(values) {
          const items = [];
          (values || []).forEach((value) => {
            if (items.indexOf(value) === -1) {
              items.push(value);
            }
          });
          return items;
        },
        ArrayList: function ArrayList(values) {
          const items = (values || []).slice();
          return {
            iterator: () => {
              let index = 0;
              return {
                hasNext: () => index < items.length,
                next: () => items[index++],
              };
            },
          };
        },
      },
    };
  });

  afterEach(() => {
    delete global.logger;
    delete global.java;
  });

  it('creates SKUs from linked size schema, populates SV style linkage, and writes ITH fields', () => {
    const sizeSchemaNode = createProductNode('schema_1', 'SizeSchema', {});
    sizeSchemaNode.getAttributeLinks = jest.fn(() => createCollection([
      createAttributeLink('size_name', '1'),
    ]));

    const coreSizeNode = createProductNode('core_size_1', 'CoreSize', {
      size_name: 'Medium',
      core_size_table_id: 'SIZE_M',
      inherited_attr: 'ignored',
    });
    coreSizeNode.getValues = jest.fn(() => createCollection([
      createValueHolder('Medium', 'size_name'),
      createValueHolder('SIZE_M', 'core_size_table_id'),
      Object.assign(createValueHolder('ignored', 'inherited_attr'), {
        isInherited: jest.fn(() => true),
      }),
    ]));
    sizeSchemaNode.getChildren = jest.fn(() => createCollection([coreSizeNode]));

    const styleParent = createProductNode('UnclassifiedStyles', 'StyleRoot', {});
    const candidateStyle = createProductNode('STYLE_1', 'StyleNode', {
      style_id: null,
      primary_style_variant: '',
    });
    candidateStyle.setParent(styleParent);

    const svNode = createProductNode('SV_1', 'StyleVariant', {
      ft_data_model_style_variant_id: '',
      ft_data_model_style_id: '',
    });
    svNode.__defaultSizeSchemaNode = sizeSchemaNode;
    svNode.__refsByType.StyleVariantToSizeSchemaReference = [{
      getTarget: jest.fn(() => sizeSchemaNode),
    }];
    svNode.queryReferencedBy = jest.fn((refType) => {
      if (refType.getID() === 'CandidateStyleToStyleVariant') {
        return createCollection([{ getSource: jest.fn(() => candidateStyle) }]);
      }
      return createCollection([]);
    });

    br.operation1(
      svNode,
      {
        getReferenceTypeHome: jest.fn(() => ({
          getReferenceTypeByID: jest.fn((id) => ({ getID: jest.fn(() => id) })),
        })),
      },
      {
        execute: jest.fn((skuNode) => {
          skuNode.getValue('sku_id').setSimpleValue('SKU-GEN');
        }),
      },
      {
        execute: jest.fn((node) => {
          node.getValue('ft_data_model_style_variant_id').setSimpleValue('SV-GEN');
        }),
      },
      { getID: jest.fn(() => 'SKUToSizeSchemaLink') },
      { getID: jest.fn(() => 'CandidateStyleToStyleVariant') },
      { getID: jest.fn(() => 'StyleVariantToStyleLink') },
      {
        execute: jest.fn((styleNode) => {
          styleNode.getValue('style_id').setSimpleValue('STYLE-GEN');
        }),
      },
      {
        evaluate: jest.fn(({ objTypeIDtoMatch }) => [`${objTypeIDtoMatch}_A`, `${objTypeIDtoMatch}_A`]),
      },
      {
        evaluate: jest.fn(() => createProductNode('IT_CLS_100', 'ClassNode', {})),
      },
      {
        nowISO: jest.fn(() => '2026-04-03 12:00:00'),
      }
    );

    expect(svNode.__children).toHaveLength(1);
    const skuNode = svNode.__children[0];
    expect(skuNode.getValue('stibo_created_at').setSimpleValue).toHaveBeenCalledWith('2026-04-03 12:00:00');
    expect(skuNode.getValue('legacy_size_id').setSimpleValue).toHaveBeenCalledWith('SIZE_M');
    expect(skuNode.setName).toHaveBeenCalledWith('Medium');
    expect(svNode.setName).toHaveBeenCalledWith('SV-GEN');
    expect(candidateStyle.createClassificationProductLink).toHaveBeenCalledWith(svNode, expect.anything());
    expect(candidateStyle.getValue('primary_style_variant').setSimpleValue).toHaveBeenCalledWith('SV-GEN');
    expect(candidateStyle.setParent).toHaveBeenCalledWith(expect.anything());
    expect(svNode.getValue('class_name').setSimpleValue).toHaveBeenCalledWith('ClassNode_A');
    expect(svNode.getValue('region_name').setSimpleValue).toHaveBeenCalledWith('RegionNode_A');
  });

  it('aborts when the StyleVariant already has SKU children', () => {
    const svNode = createProductNode('SV_EXISTING', 'StyleVariant', {});
    svNode.__children.push(createProductNode('SKU_1', 'SKUNode', {}));

    br.operation1(
      svNode,
      {
        getReferenceTypeHome: jest.fn(() => ({
          getReferenceTypeByID: jest.fn((id) => ({ getID: jest.fn(() => id) })),
        })),
      },
      { execute: jest.fn() },
      { execute: jest.fn() },
      { getID: jest.fn(() => 'SKUToSizeSchemaLink') },
      { getID: jest.fn(() => 'CandidateStyleToStyleVariant') },
      { getID: jest.fn(() => 'StyleVariantToStyleLink') },
      { execute: jest.fn() },
      { evaluate: jest.fn(() => []) },
      { evaluate: jest.fn(() => null) },
      { nowISO: jest.fn(() => '2026-04-03 12:00:00') }
    );

    expect(svNode.createProduct).not.toHaveBeenCalled();
  });

  it('skips SKU creation when no size schema reference exists', () => {
    const svNode = createProductNode('SV_NO_SCHEMA', 'StyleVariant', {});

    br.operation1(
      svNode,
      {
        getReferenceTypeHome: jest.fn(() => ({
          getReferenceTypeByID: jest.fn((id) => ({ getID: jest.fn(() => id) })),
        })),
      },
      { execute: jest.fn() },
      { execute: jest.fn() },
      { getID: jest.fn(() => 'SKUToSizeSchemaLink') },
      { getID: jest.fn(() => 'CandidateStyleToStyleVariant') },
      { getID: jest.fn(() => 'StyleVariantToStyleLink') },
      { execute: jest.fn() },
      { evaluate: jest.fn(() => []) },
      { evaluate: jest.fn(() => null) },
      { nowISO: jest.fn(() => '2026-04-03 12:00:00') }
    );

    expect(svNode.createProduct).not.toHaveBeenCalled();
  });
});
