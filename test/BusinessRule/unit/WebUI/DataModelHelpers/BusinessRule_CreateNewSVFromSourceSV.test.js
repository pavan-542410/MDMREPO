const createNewSVFromSourceSV = require('../../../../../step-configs/BusinessRule/BusinessRule_CreateNewSVFromSourceSV');

function makeValueStore(initialValues) {
  return {
    values: Object.assign({}, initialValues),
    getValue(attrID) {
      const self = this;
      return {
        getSimpleValue: jest.fn(() => self.values[attrID] || ''),
        setSimpleValue: jest.fn((value) => {
          self.values[attrID] = value;
        }),
      };
    },
  };
}

function createStyleVariantNode(id, typeID, parent, valueSeed, name) {
  const values = makeValueStore(valueSeed || {});
  return {
    getID: jest.fn(() => id),
    getName: jest.fn(() => name || id),
    setName: jest.fn(),
    getParent: jest.fn(() => parent),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => typeID),
    })),
    getValue: jest.fn((attrID) => values.getValue(attrID)),
    __values: values.values,
  };
}

describe('BusinessRule_CreateNewSVFromSourceSV', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
    global.java = {
      util: {
        UUID: {
          randomUUID: jest.fn(() => ({
            toString: jest.fn(() => '11111111-2222-3333-4444-555555555555'),
          })),
        },
      },
    };
  });

  afterEach(() => {
    delete global.logger;
    delete global.java;
  });

  test('creates new SV from selection and always sets enterprise key', () => {
    const createdNodes = [];
    const parent = {
      createProduct: jest.fn((newID) => {
        const created = createStyleVariantNode(newID, 'StyleVariant', null, {}, 'new');
        createdNodes.push(created);
        return created;
      }),
    };
    const source = createStyleVariantNode(
      'SV_9001',
      'StyleVariant',
      parent,
      {
        ft_data_model_style_id: 'STYLE_77',
        inventory_type: 'fashion_b',
      },
      'Source SV'
    );
    const web = {
      getSelection: jest.fn(() => ({
        toArray: jest.fn(() => [source]),
      })),
      showAlert: jest.fn(),
    };

    createNewSVFromSourceSV.operation0(web, source);

    expect(parent.createProduct).toHaveBeenCalledTimes(1);
    expect(parent.createProduct).toHaveBeenCalledWith(
      'SV_11111111-2222-3333-4444-555555555555',
      'StyleVariant'
    );
    expect(createdNodes[0].__values.ft_data_model_style_variant_id).toBe(
      '11111111-2222-3333-4444-555555555555'
    );
    expect(createdNodes[0].__values.ft_data_model_style_id).toBe('STYLE_77');
    expect(createdNodes[0].__values.inventory_type).toBe('fashion_b');
    expect(web.showAlert).toHaveBeenCalledWith(
      'ACKNOWLEDGMENT',
      expect.stringContaining('Created 1 Style Variant(s)')
    );
  });

  test('skips non-style-variant selections and shows warning', () => {
    const invalidNode = createStyleVariantNode('PRD_1', 'ProductNode', null, {}, 'Product');
    const web = {
      getSelection: jest.fn(() => ({
        toArray: jest.fn(() => [invalidNode]),
      })),
      showAlert: jest.fn(),
    };

    createNewSVFromSourceSV.operation0(web, invalidNode);

    expect(web.showAlert).toHaveBeenCalledWith(
      'WARNING',
      expect.stringContaining('No Style Variant was created')
    );
  });
});
