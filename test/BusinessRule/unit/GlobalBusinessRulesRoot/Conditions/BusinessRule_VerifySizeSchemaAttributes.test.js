const verifySizeSchemaAttributes = require('../../../../../step-configs/BusinessRule/BusinessRule_VerifySizeSchemaAttributes');

function rhinoString(value) {
  return {
    trim: jest.fn(() => ({
      length: jest.fn(() => value.trim().length),
    })),
    toString: jest.fn(() => value),
    valueOf: jest.fn(() => value),
  };
}

function createAttr(attrID) {
  return {
    getID: jest.fn(() => attrID),
  };
}

function createSku(id, valuesByID) {
  return {
    getID: jest.fn(() => id),
    getValue: jest.fn((attrID) => {
      if (!Object.prototype.hasOwnProperty.call(valuesByID, attrID)) {
        return null;
      }

      return {
        getSimpleValue: jest.fn(() => valuesByID[attrID]),
      };
    }),
  };
}

function createNode(id, schemaNode, skus) {
  return {
    getID: jest.fn(() => id),
    queryClassificationProductLinks: jest.fn(() => ({
      asList: jest.fn(() => (schemaNode === undefined
        ? null
        : {
          size: jest.fn(() => 1),
          get: jest.fn(() => ({
            getClassification: jest.fn(() => schemaNode),
          })),
        })),
    })),
    getChildren: jest.fn(() => ({
      toArray: jest.fn(() => skus),
    })),
  };
}

describe('BusinessRule_VerifySizeSchemaAttributes', () => {
  beforeEach(() => {
    global.logger = {
      info: jest.fn(),
      warning: jest.fn(),
      severe: jest.fn(),
    };
  });

  afterEach(() => {
    delete global.logger;
  });

  test('returns true when no size schema link exists or no schema attributes are configured', () => {
    const nodeWithoutLink = createNode('SV_1', undefined, []);
    const emptySchemaNode = {
      getAttributeLinks: jest.fn(() => ({
        toArray: jest.fn(() => []),
      })),
    };
    const nodeWithoutSchemaAttrs = createNode('SV_2', emptySchemaNode, []);

    expect(verifySizeSchemaAttributes.operation0(nodeWithoutLink, 'SKUToSizeSchemaLink', null)).toBe(true);
    expect(verifySizeSchemaAttributes.operation0(nodeWithoutSchemaAttrs, 'SKUToSizeSchemaLink', null)).toBe(true);
    expect(global.logger.info).toHaveBeenCalledWith('No SKUToSizeSchemaLink found for node: SV_1');
    expect(global.logger.info).toHaveBeenCalledWith('No attributes found referenced to SizeSchemaNode for node: SV_2');
  });

  test('returns true when all SKU size schema attributes and fallback size values are present', () => {
    const schemaNode = {
      getAttributeLinks: jest.fn(() => ({
        toArray: jest.fn(() => [{
          getAttribute: jest.fn(() => createAttr('size_attr')),
        }]),
      })),
    };
    const node = createNode('SV_3', schemaNode, [
      createSku('SKU_1', {
        size_attr: rhinoString('M'),
        legacy_size_id: '123',
        legacy_size_mnemonic: 'MED',
        intended_client_size: '',
      }),
    ]);
    const ui = {
      getClass: jest.fn(() => ({
        getName: jest.fn(() => 'com.stibo.webui.bindaction.server.bind.WebUiContextImpl'),
      })),
      showAlert: jest.fn(),
    };

    expect(verifySizeSchemaAttributes.operation0(node, 'SKUToSizeSchemaLink', ui)).toBe(true);
    expect(ui.showAlert).not.toHaveBeenCalled();
  });

  test('currently fails while formatting missing-size-schema errors because missingAttributeValues is a JS array', () => {
    const schemaNode = {
      getAttributeLinks: jest.fn(() => ({
        toArray: jest.fn(() => [{
          getAttribute: jest.fn(() => createAttr('size_attr')),
        }]),
      })),
    };
    const node = createNode('SV_4', schemaNode, [
      createSku('SKU_2', {
        size_attr: rhinoString('  '),
        legacy_size_id: '',
        legacy_size_mnemonic: '',
        intended_client_size: '',
      }),
      createSku('SKU_3', {
        size_attr: null,
        legacy_size_id: '456',
        legacy_size_mnemonic: '',
        intended_client_size: '',
      }),
    ]);

    expect(() => {
      verifySizeSchemaAttributes.operation0(node, 'SKUToSizeSchemaLink', null);
    }).toThrow('missingAttributeValues.size is not a function');
  });

  test('returns false when the size schema link points to a null classification', () => {
    const node = createNode('SV_5', null, []);

    expect(verifySizeSchemaAttributes.operation0(node, 'SKUToSizeSchemaLink', null)).toBe(false);
    expect(global.logger.severe).toHaveBeenCalledWith('SizeSchemaNode not found for node: SV_5');
  });
});
