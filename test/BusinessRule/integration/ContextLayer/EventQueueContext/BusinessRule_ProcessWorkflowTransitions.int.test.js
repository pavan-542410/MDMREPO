'use strict';

const br = require('../../../../../step-configs/BusinessRule/BusinessRule_ProcessWorkflowTransitions');

describe('ProcessWorkflowTransitions (integration)', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
  });
  function makeSVNode(id) {
    return { getID: () => id };
  }

  function makeBatch(events) {
    return {
      getEvents: () => ({
        iterator: () => {
          let i = 0;
          return {
            hasNext: () => i < events.length,
            next: () => events[i++]
          };
        }
      })
    };
  }

  function makeEvent(node) {
    return { getNode: () => node };
  }

  function makeHandleWorkflowTransition() {
    return { execute: jest.fn() };
  }

  test('calls handler once per unique SV', () => {
    const sv1 = makeSVNode('SV_001');
    const sv2 = makeSVNode('SV_002');
    const batch = makeBatch([makeEvent(sv1), makeEvent(sv2)]);
    const handler = makeHandleWorkflowTransition();

    br.operation0(batch, handler);

    expect(handler.execute).toHaveBeenCalledTimes(2);
    expect(handler.execute).toHaveBeenCalledWith(sv1);
    expect(handler.execute).toHaveBeenCalledWith(sv2);
  });

  test('deduplicates duplicate SV events — handler called only once per SV', () => {
    const sv1 = makeSVNode('SV_001');
    const batch = makeBatch([makeEvent(sv1), makeEvent(sv1), makeEvent(sv1)]);
    const handler = makeHandleWorkflowTransition();

    br.operation0(batch, handler);

    expect(handler.execute).toHaveBeenCalledTimes(1);
    expect(handler.execute).toHaveBeenCalledWith(sv1);
  });

  test('skips null nodes without throwing', () => {
    const sv1 = makeSVNode('SV_001');
    const nullEvent = { getNode: () => null };
    const batch = makeBatch([nullEvent, makeEvent(sv1)]);
    const handler = makeHandleWorkflowTransition();

    expect(() => br.operation0(batch, handler)).not.toThrow();
    expect(handler.execute).toHaveBeenCalledTimes(1);
    expect(handler.execute).toHaveBeenCalledWith(sv1);
  });

  test('handles empty batch without error', () => {
    const batch = makeBatch([]);
    const handler = makeHandleWorkflowTransition();

    expect(() => br.operation0(batch, handler)).not.toThrow();
    expect(handler.execute).not.toHaveBeenCalled();
  });

  test('deduplicates mixed batch with multiple unique SVs and duplicates', () => {
    const sv1 = makeSVNode('SV_001');
    const sv2 = makeSVNode('SV_002');
    const sv3 = makeSVNode('SV_003');
    const batch = makeBatch([
      makeEvent(sv1), makeEvent(sv2), makeEvent(sv1),
      makeEvent(sv3), makeEvent(sv2)
    ]);
    const handler = makeHandleWorkflowTransition();

    br.operation0(batch, handler);

    expect(handler.execute).toHaveBeenCalledTimes(3);
  });
});
