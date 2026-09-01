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

describe('AIResponseHandler (integration)', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
  });

  afterEach(() => {
    delete global.logger;
  });

  test('processes happy-path AI payload and advances workflow', () => {
    const nodeValue = {
      _value: '',
      getSimpleValue() { return this._value; },
      setSimpleValue(v) { this._value = v; }
    };
    const node = {
      getDataContainerByTypeID: () => ({
        getDataContainers: () => ({ toArray: () => [makeEntry('fit_notes', 'Slim through shoulder')] })
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
    const wf = { triggerWfFromMapNoWebUI: jest.fn(() => 'transitioned') };

    br.operation0(node, step, {}, {}, {}, wf);

    expect(nodeValue._value).toBe('Slim through shoulder');
    expect(wf.triggerWfFromMapNoWebUI).toHaveBeenCalledTimes(1);
  });

  test('skips invalid object-type attributes as guardrail path', () => {
    const nodeValue = {
      _value: '',
      getSimpleValue() { return this._value; },
      setSimpleValue(v) { this._value = v; }
    };
    const node = {
      getDataContainerByTypeID: () => ({
        getDataContainers: () => ({ toArray: () => [makeEntry('fit_notes', 'Should not apply')] })
      }),
      getObjectType: () => ({ getID: () => 'StyleVariant' }),
      getValue: () => nodeValue
    };
    const step = {
      getAttributeHome: () => ({
        getAttributeByID: () => ({
          getValidForObjectTypes: () => ({ toArray: () => [{ getID: () => 'ProductNode' }] }),
          isMultiValued: () => false
        })
      })
    };
    const wf = { triggerWfFromMapNoWebUI: jest.fn() };

    br.operation0(node, step, {}, {}, {}, wf);

    expect(nodeValue._value).toBe('');
    expect(wf.triggerWfFromMapNoWebUI).toHaveBeenCalledTimes(1);
  });
});
