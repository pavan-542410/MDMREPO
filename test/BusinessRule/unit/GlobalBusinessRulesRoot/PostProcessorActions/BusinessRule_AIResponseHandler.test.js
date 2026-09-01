const br = require('../../../../../step-configs/BusinessRule/BusinessRule_AIResponseHandler');

function makeEntry(attributeId, value) {
  return {
    getDataContainerObject: () => ({
      getValue: (id) => ({
        getSimpleValue: () => (id === 'ai_attribute_id' ? attributeId : value)
      })
    })
  };
}

describe('AIResponseHandler', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
  });

  afterEach(() => {
    delete global.logger;
  });

  test('returns descriptive message when AIAttributeValues container is missing', () => {
    const node = {
      getDataContainerByTypeID: () => null
    };
    const wf = { triggerWfFromMapNoWebUI: jest.fn() };

    const result = br.operation0(node, {}, {}, {}, {}, wf);

    expect(result).toBe("Data Container 'AIAttributeValues' not found.");
    expect(wf.triggerWfFromMapNoWebUI).not.toHaveBeenCalled();
  });

  test('updates eligible empty single-valued attributes and triggers workflow transition', () => {
    const nodeValue = {
      _value: '',
      getSimpleValue() { return this._value; },
      setSimpleValue(v) { this._value = v; }
    };
    const node = {
      getDataContainerByTypeID: () => ({
        getDataContainers: () => ({ toArray: () => [makeEntry('target_attr', 'new value')] })
      }),
      getObjectType: () => ({ getID: () => 'StyleVariant' }),
      getValue: () => nodeValue
    };
    const step = {
      getAttributeHome: () => ({
        getAttributeByID: () => ({
          getValidForObjectTypes: () => ({ toArray: () => [{ getID: () => 'StyleVariant' }] }),
          isMultiValued: () => false
        })
      })
    };
    const wf = { triggerWfFromMapNoWebUI: jest.fn(() => 'ok') };

    br.operation0(node, step, {}, {}, {}, wf);

    expect(nodeValue._value).toBe('new value');
    expect(wf.triggerWfFromMapNoWebUI).toHaveBeenCalledTimes(1);
  });

  test('supports multi-valued attributes using JSON arrays', () => {
    const nodeValue = {
      getSimpleValue: () => '',
      replace: () => {
        const values = [];
        return {
          addValue: (v) => values.push(v),
          apply: jest.fn(),
          _values: values
        };
      }
    };
    const node = {
      getDataContainerByTypeID: () => ({
        getDataContainers: () => ({ toArray: () => [makeEntry('mv_attr', '["alpha","beta"]')] })
      }),
      getObjectType: () => ({ getID: () => 'StyleVariant' }),
      getValue: () => nodeValue
    };
    const step = {
      getAttributeHome: () => ({
        getAttributeByID: () => ({
          getValidForObjectTypes: () => ({ toArray: () => [] }),
          isMultiValued: () => true
        })
      })
    };
    const wf = { triggerWfFromMapNoWebUI: jest.fn() };
    let appliedValues = [];
    nodeValue.replace = () => ({
      addValue: (v) => appliedValues.push(v),
      apply: jest.fn()
    });

    br.operation0(node, step, {}, {}, {}, wf);

    expect(appliedValues).toEqual(['alpha', 'beta']);
  });
});
