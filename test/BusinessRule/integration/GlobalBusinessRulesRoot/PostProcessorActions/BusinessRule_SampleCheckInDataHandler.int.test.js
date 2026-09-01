const br = require('../../../../../step-configs/BusinessRule/BusinessRule_SampleCheckInDataHandler');

function makeSimpleAttr(initialValue) {
  return {
    _value: initialValue,
    getSimpleValue() { return this._value; },
    setSimpleValue(v) { this._value = v; },
    getValues: () => null
  };
}

function makeNode(valuesByAttr) {
  const attrMap = {};
  Object.keys(valuesByAttr).forEach((key) => {
    attrMap[key] = makeSimpleAttr(valuesByAttr[key]);
  });
  return {
    getID: () => 'SV_200',
    getValue: (id) => {
      if (!attrMap[id]) attrMap[id] = makeSimpleAttr(null);
      return attrMap[id];
    },
    queryReferences: () => ({
      asList: () => ({
        iterator: () => ({ hasNext: () => false, next: () => null })
      })
    }),
    createReference: jest.fn()
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

describe('SampleCheckInDataHandler (integration)', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn(), warning: jest.fn(), severe: jest.fn() };
  });

  afterEach(() => {
    delete global.logger;
  });

  test('happy path performs check-in, updates sample flags, and triggers workflows', () => {
    const node = makeNode({
      'studio_checked-in_at': '2026-04-02T12:00:00Z',
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

    expect(node.getValue('sample_received_at').getSimpleValue()).toBe('2026-04-02T12:00:00Z');
    expect(node.getValue('is_sample_received').getSimpleValue()).toBe(true);
    expect(wf.triggerWorkflowEvent).toHaveBeenCalledTimes(2);
  });

  test('meaningful guardrail path: check-in failures do not trigger workflows', () => {
    const node = makeNode({
      'studio_checked-in_at': '2026-04-02T12:00:00Z',
      'sample_received_at': '',
      'is_sample_received': false,
      materials_json: ''
    });
    const wf = { triggerWorkflowEvent: jest.fn() };

    br.operation0(
      node,
      {},
      {},
      { evaluate: () => { throw new Error('sku lookup failed'); } },
      { addIssuesReportHeader: jest.fn(), addWarning: jest.fn() },
      {},
      {},
      { evaluate: () => ({ getName: () => 'Outerwear' }) },
      { sendToHangtagService: jest.fn(() => 'ok') },
      {},
      wf
    );

    expect(wf.triggerWorkflowEvent).not.toHaveBeenCalled();
  });
});
