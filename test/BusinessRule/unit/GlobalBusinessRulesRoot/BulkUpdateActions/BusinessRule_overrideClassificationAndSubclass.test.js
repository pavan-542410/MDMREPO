const br = require('../../../../../step-configs/BusinessRule/BusinessRule_overrideClassificationAndSubclass');

function createValueHolder(initialValue) {
  let currentValue = initialValue;

  return {
    getSimpleValue: jest.fn(() => currentValue),
    setSimpleValue: jest.fn((nextValue) => {
      currentValue = nextValue;
    }),
  };
}

function createNode(id, objectTypeID, values, parent) {
  const valueMap = {};
  Object.keys(values || {}).forEach((attrID) => {
    valueMap[attrID] = createValueHolder(values[attrID]);
  });

  return {
    getID: jest.fn(() => id),
    toString: jest.fn(() => id),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => objectTypeID),
    })),
    getParent: jest.fn(() => parent || null),
    setParent: jest.fn(),
    getValue: jest.fn((attrID) => {
      if (!valueMap[attrID]) {
        valueMap[attrID] = createValueHolder('');
      }
      return valueMap[attrID];
    }),
  };
}

describe('BusinessRule_overrideClassificationAndSubclass', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
  });

  afterEach(() => {
    delete global.logger;
  });

  it('applies the first advanced mapping match on ProductNode and writes easy trial values', () => {
    const product = createNode('PRD_100', 'ProductNode', {
      product_name: 'Wool Coat',
      classification_name: 'Outerwear',
      product_group: 'Jackets',
    });
    const overrideParent = createNode('CLS_COATS', 'ClassificationNode', {});

    br.operation0(
      product,
      {
        getNodeHome: jest.fn(() => ({
          getObjectByKey: jest.fn(() => overrideParent),
        })),
      },
      global.logger,
      { evaluate: jest.fn(() => ({ getID: jest.fn(() => 'IT_CLS_100') })) },
      {
        evaluate: jest.fn(() =>
          createNode('SV_100', 'StyleVariant', {
            silhouette: 'Relaxed',
          })
        ),
      },
      {
        getAdvancedMappings: jest.fn(() => [{
          validClass: 'IT_CLS_100',
          attributesToCheck: { silhouette: 'Relaxed' },
          attributesToSet: [{ attributeID: 'trial_subclassification', valueToSet: 'Overcoat' }],
          parentToSet: 'Coats',
        }]),
        getKeywordMappings: jest.fn(() => [{
          keywordToCheck: 'parka',
          attributesToSet: [{ attributeID: 'trial_subclassification', valueToSet: 'Parka' }],
        }]),
        getClassAndSiloMappings: jest.fn(() => []),
      }
    );

    expect(product.setParent).toHaveBeenCalledWith(overrideParent);
    expect(product.getValue('udp_classification_override').setSimpleValue).toHaveBeenCalledWith('Coats');
    expect(product.getValue('trial_subclassification').setSimpleValue).toHaveBeenCalledWith('Overcoat');
    expect(product.getValue('trial_classification').setSimpleValue).toHaveBeenCalledWith('Outerwear');
    expect(product.getValue('trial_product_group').setSimpleValue).toHaveBeenCalledWith('Jackets');
  });

  it('processes a ColorwayVariantNode by resolving its parent product and falling back to keyword mappings', () => {
    const product = createNode('PRD_200', 'ProductNode', {
      product_name: 'Blue Parka',
      classification_name: 'Outerwear',
      product_group: 'Jackets',
    });
    const colorway = createNode('VAR_200', 'ColorwayVariantNode', {}, product);

    br.operation0(
      colorway,
      {
        getNodeHome: jest.fn(() => ({
          getObjectByKey: jest.fn(() => null),
        })),
      },
      global.logger,
      { evaluate: jest.fn(() => ({ getID: jest.fn(() => 'IT_CLS_999') })) },
      { evaluate: jest.fn(() => null) },
      {
        getAdvancedMappings: jest.fn(() => [{
          validClass: 'IT_CLS_100',
          attributesToSet: [{ attributeID: 'trial_subclassification', valueToSet: 'Should Not Apply' }],
        }]),
        getKeywordMappings: jest.fn(() => [{
          keywordToCheck: 'parka||anorak',
          attributesToSet: [{ attributeID: 'trial_subclassification', valueToSet: 'Parka' }],
        }]),
        getClassAndSiloMappings: jest.fn(() => []),
      }
    );

    expect(product.getValue('trial_subclassification').setSimpleValue).toHaveBeenCalledWith('Parka');
    expect(product.getValue('trial_classification').setSimpleValue).toHaveBeenCalledWith('Outerwear');
  });

  it('falls through all mappings when no class, keyword, or attribute condition matches', () => {
    const product = createNode('PRD_300', 'ProductNode', {
      product_name: 'Minimal Tee',
      classification_name: 'Tops',
      product_group: 'Knits',
    });

    br.operation0(
      product,
      {
        getNodeHome: jest.fn(() => ({
          getObjectByKey: jest.fn(() => null),
        })),
      },
      global.logger,
      { evaluate: jest.fn(() => null) },
      { evaluate: jest.fn(() => null) },
      {
        getAdvancedMappings: jest.fn(() => [{
          validClass: 'IT_CLS_100',
          attributesToSet: [{ attributeID: 'trial_subclassification', valueToSet: 'Nope' }],
        }]),
        getKeywordMappings: jest.fn(() => [{
          keywordToCheck: 'denim',
          attributesToSet: [{ attributeID: 'trial_subclassification', valueToSet: 'Nope' }],
        }]),
        getClassAndSiloMappings: jest.fn(() => [{
          attributesToCheck: { silhouette: 'Wide' },
          attributesToSet: [{ attributeID: 'trial_subclassification', valueToSet: 'Nope' }],
        }]),
      }
    );

    expect(product.getValue('trial_subclassification').setSimpleValue).not.toHaveBeenCalled();
    expect(product.getValue('trial_classification').setSimpleValue).toHaveBeenCalledWith('Tops');
    expect(product.getValue('trial_product_group').setSimpleValue).toHaveBeenCalledWith('Knits');
  });
});
