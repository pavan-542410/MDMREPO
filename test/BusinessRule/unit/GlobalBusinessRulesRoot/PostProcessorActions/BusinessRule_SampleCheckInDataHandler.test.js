const br = require('../../../../../step-configs/BusinessRule/BusinessRule_SampleCheckInDataHandler');

function makeSimpleAttr(initialValue) {
  return {
    _value: initialValue,
    getSimpleValue() { return this._value; },
    setSimpleValue(v) { this._value = v; },
    getValues: () => null,
    setValue(v) { this._value = v; }
  };
}

function makeMultiAttr(values) {
  const holder = {
    _values: (values || []).slice(),
    getSimpleValue() { return null; },
    getValues() {
      const entries = holder._values.map((value) => ({
        getSimpleValue: () => value
      }));
      return {
        iterator: () => {
          let index = 0;
          return {
            hasNext: () => index < entries.length,
            next: () => entries[index++]
          };
        }
      };
    },
    replace() {
      holder._values = [];
      return holder;
    },
    addSimpleValue(v) {
      holder._values.push(v);
    },
    apply() {}
  };

  return holder;
}

function makeNode(valuesByAttr) {
  const attrMap = {};
  Object.keys(valuesByAttr).forEach((key) => {
    attrMap[key] = makeSimpleAttr(valuesByAttr[key]);
  });

  return {
    getID: () => 'SV_100',
    getValue: (id) => {
      if (!attrMap[id]) attrMap[id] = makeSimpleAttr(null);
      return attrMap[id];
    },
    queryReferences: () => ({
      asList: () => ({
        iterator: () => ({ hasNext: () => false, next: () => null })
      })
    }),
    createReference: jest.fn((target) => ({
      getTarget: () => target,
      getValue: () => makeSimpleAttr(null)
    }))
  };
}

function makeSku() {
  return {
    getValue: () => ({ getSimpleValue: () => null }),
    queryClassificationProductLinks: () => ({
      asList: () => ({
        get: () => ({
          getClassification: () => ({ getName: () => 'BrandX' })
        })
      })
    })
  };
}

describe('SampleCheckInDataHandler', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn(), warning: jest.fn(), severe: jest.fn() };
  });

  afterEach(() => {
    delete global.logger;
  });

  test('updates sample received fields and triggers both workflow events', () => {
    const node = makeNode({
      'studio_checked-in_at': '2026-04-02T10:00:00Z',
      'sample_received_at': '',
      'is_sample_received': false,
      materials_json: ''
    });
    const wf = { triggerWorkflowEvent: jest.fn() };
    const getExampleSKU = { evaluate: () => makeSku() };
    const getClass = { evaluate: () => ({ getName: () => 'Outerwear' }) };
    const dir = { addIssuesReportHeader: jest.fn(), addWarning: jest.fn() };
    const samLib = { sendToHangtagService: jest.fn(() => 'ok') };

    br.operation0(
      node,
      {},
      {},
      getExampleSKU,
      dir,
      {},
      {},
      getClass,
      samLib,
      {},
      wf
    );

    expect(node.getValue('sample_received_at').getSimpleValue()).toBe('2026-04-02T10:00:00Z');
    expect(node.getValue('is_sample_received').getSimpleValue()).toBe(true);
    expect(wf.triggerWorkflowEvent).toHaveBeenCalledWith(node, 'SampleAndMedia', 'Sample_Needed', 'Submit');
    expect(wf.triggerWorkflowEvent).toHaveBeenCalledWith(node, 'SampleAndMedia', 'Transfer_reqd_from_DC', 'Submit');
  });

  test('guard path: no studio check-in time means no workflow triggers', () => {
    const node = makeNode({
      'studio_checked-in_at': '',
      'sample_received_at': '',
      'is_sample_received': false,
      materials_json: ''
    });
    const wf = { triggerWorkflowEvent: jest.fn() };

    br.operation0(
      node,
      {},
      {},
      { evaluate: () => makeSku() },
      { addIssuesReportHeader: jest.fn(), addWarning: jest.fn() },
      {},
      {},
      { evaluate: () => ({ getName: () => 'Outerwear' }) },
      { sendToHangtagService: jest.fn(() => 'ok') },
      {},
      wf
    );

    expect(node.getValue('sample_received_at').getSimpleValue()).toBe('');
    expect(node.getValue('is_sample_received').getSimpleValue()).toBe(false);
    expect(wf.triggerWorkflowEvent).not.toHaveBeenCalled();
  });

  test('parses material JSON, derives garment care, and sets made-in-USA flag from country of origin', () => {
    const silkMaterial = {
      getID: () => 'MAT_Silk'
    };
    const node = makeNode({
      'studio_checked-in_at': '2026-04-02T10:00:00Z',
      'sample_received_at': '2026-04-01T09:00:00Z',
      'is_sample_received': true,
      'is_made_in_usa': '',
      'country_of_origin': 'Usa',
      materials_json: JSON.stringify([
        {
          groupName: 'Shell',
          materials: [
            { material: 'silk', percentage: 100 },
            { material: '', percentage: 50 }
          ]
        },
        {
          groupName: 'Lining',
          materials: [
            { material: 'polyester', percentage: 100 }
          ]
        },
        {
          groupName: 'Invalid'
        }
      ])
    });
    node.getValue('care_instructions').getValues = makeMultiAttr([
      'Machine wash cold, tumble dry low',
      'Dry clean'
    ]).getValues;
    node.getValue('garment_care').replace = makeMultiAttr([]).replace;
    node.getValue('garment_care').addSimpleValue = jest.fn();
    node.getValue('garment_care').apply = jest.fn();
    node.getValue('lining').replace = makeMultiAttr([]).replace;
    node.getValue('lining').addSimpleValue = jest.fn();
    node.getValue('lining').apply = jest.fn();
    node.getValue('filling_material').replace = makeMultiAttr([]).replace;
    node.getValue('filling_material').addSimpleValue = jest.fn();
    node.getValue('filling_material').apply = jest.fn();

    br.operation0(
      node,
      {
        getEntityHome: () => ({
          getEntityByID: (id) => (id === 'MAT_Silk' ? silkMaterial : null)
        })
      },
      { getID: () => 'ProductToMaterial' },
      { evaluate: () => makeSku() },
      { addIssuesReportHeader: jest.fn(), addWarning: jest.fn() },
      {},
      {},
      { evaluate: () => ({ getName: () => 'Outerwear' }) },
      { sendToHangtagService: jest.fn(() => 'ok') },
      {},
      { triggerWorkflowEvent: jest.fn() }
    );

    expect(node.getValue('is_made_in_usa').getSimpleValue()).toBe(true);
    expect(node.createReference).toHaveBeenCalledWith(silkMaterial, { getID: expect.any(Function) });
    expect(node.getValue('garment_care').addSimpleValue).toHaveBeenCalledWith('Machine Wash');
    expect(node.getValue('garment_care').addSimpleValue).toHaveBeenCalledWith('Dry Clean');
    expect(node.getValue('lining').addSimpleValue).toHaveBeenCalledWith('100% polyester');
  });
});
