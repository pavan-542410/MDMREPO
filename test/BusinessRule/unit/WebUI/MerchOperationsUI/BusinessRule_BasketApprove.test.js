const basketApprove = require('../../../../../step-configs/BusinessRule/BusinessRule_BasketApprove');

function makeSelection(nodes) {
  let index = 0;
  return {
    iterator: () => ({
      hasNext: () => index < nodes.length,
      next: () => nodes[index++]
    })
  };
}

function makeNode(name) {
  return {
    getName: () => name
  };
}

describe('BusinessRule_BasketApprove', () => {
  test('approves node references right after attribute approval with expected reference types', () => {
    const node = makeNode('SV_123');
    const ui = {
      getSelection: () => makeSelection([node]),
      showAlert: jest.fn()
    };
    const upheritAndApprove = { execute: jest.fn() };
    const getParentMatchingObjTypeID = {
      evaluate: jest.fn(() => ({ getID: () => 'SomeParentType' }))
    };
    const w = { approveReferences: jest.fn() };

    basketApprove.operation0(ui, node, upheritAndApprove, getParentMatchingObjTypeID, w);

    const expectedReferenceTypes = [
      'product_to_classification',
      'ProductToClassLInk',
      'ProductToVendorLink',
      'ProductToBrandLink',
      'StyleVariantToSizeSchemaReference'
    ];

    expect(upheritAndApprove.execute).toHaveBeenCalledWith(node);
    expect(w.approveReferences).toHaveBeenCalledWith(node, expectedReferenceTypes);
    expect(upheritAndApprove.execute.mock.invocationCallOrder[0]).toBeLessThan(
      w.approveReferences.mock.invocationCallOrder[0]
    );
    expect(ui.showAlert).toHaveBeenCalled();
  });

  test('does not attempt approval for nodes under UnclassifiedSKUs', () => {
    const node = makeNode('SV_999');
    const ui = {
      getSelection: () => makeSelection([node]),
      showAlert: jest.fn()
    };
    const upheritAndApprove = { execute: jest.fn() };
    const getParentMatchingObjTypeID = {
      evaluate: jest.fn(() => ({ getID: () => 'UnclassifiedSKUs' }))
    };
    const w = { approveReferences: jest.fn() };

    basketApprove.operation0(ui, node, upheritAndApprove, getParentMatchingObjTypeID, w);

    expect(upheritAndApprove.execute).not.toHaveBeenCalled();
    expect(w.approveReferences).not.toHaveBeenCalled();
    expect(ui.showAlert).toHaveBeenCalled();
  });
});
