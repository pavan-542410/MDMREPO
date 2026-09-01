const webUiLibrary = require('../../../../../step-configs/BusinessRule/BusinessRule_WebUILibrary');

function createNode(id, typeID, parent, valuesByID) {
  const valueObjectsByID = {};

  return {
    getID: jest.fn(() => id),
    getObjectType: jest.fn(() => ({
      getID: jest.fn(() => typeID),
    })),
    getParent: jest.fn(() => parent),
    setParent: jest.fn((newParent) => {
      parent = newParent;
    }),
    getValue: jest.fn((attrID) => {
      if (!valueObjectsByID[attrID]) {
        valueObjectsByID[attrID] = {
          getSimpleValue: jest.fn(() => Object.prototype.hasOwnProperty.call(valuesByID, attrID)
            ? valuesByID[attrID]
            : null),
          setSimpleValue: jest.fn((value) => {
            valuesByID[attrID] = value;
          }),
        };
      }

      return valueObjectsByID[attrID];
    }),
  };
}

function createSelection(nodes) {
  return {
    toArray: jest.fn(() => nodes),
    iterator: jest.fn(() => ({
      next: jest.fn(() => nodes[0]),
    })),
  };
}

describe('BusinessRule_WebUILibrary', () => {
  test('reparents valid children via pull and reports invalid or already-parented selections', () => {
    const parent = createNode('PRD_1', 'ProductNode', null, {});
    const otherParent = createNode('PRD_2', 'ProductNode', null, {});
    const movedSv = createNode('SV_1', 'StyleVariant', otherParent, {
      ft_data_model_style_variant_id: 'FT_SV_1',
    });
    const alreadyMovedSv = createNode('SV_2', 'StyleVariant', parent, {
      ft_data_model_style_variant_id: '',
    });
    const invalidNode = createNode('CW_1', 'ColorwayNode', otherParent, {});
    const webUI = {
      getSelectedSetOfNodes: jest.fn(() => createSelection([movedSv, alreadyMovedSv])),
      showAlert: jest.fn(),
    };
    const upQueue = {
      republish: jest.fn(),
    };

    webUiLibrary.reparentViaPull(parent, webUI, upQueue, 'StyleVariant', 'ParentOverride');

    expect(movedSv.setParent).toHaveBeenCalledWith(parent);
    expect(movedSv.getValue('ParentOverride').setSimpleValue).toHaveBeenCalledWith('PRD_1');
    expect(webUI.showAlert).toHaveBeenCalledWith(
      'ERROR',
      'Selected object with ID SV_2 is already below PRD_1'
    );
    expect(webUI.showAlert).toHaveBeenCalledWith(
      'ACKNOWLEDGMENT',
      '1 StyleVariant(s) have been reparented under PRD_1'
    );
    expect(upQueue.republish).toHaveBeenCalledWith(parent);

    webUI.getSelectedSetOfNodes.mockReturnValue(createSelection([invalidNode]));
    webUiLibrary.reparentViaPull(parent, webUI, upQueue, 'StyleVariant', 'ParentOverride');

    expect(webUI.showAlert).toHaveBeenCalledWith(
      'ERROR',
      'Invalid Selection. Please try again by selecting a StyleVariant'
    );
  });

  test('reparents selected children via push and validates the parent selection', () => {
    const oldParent = createNode('PRD_OLD', 'ProductNode', null, {});
    const selectedParent = createNode('PRD_NEW', 'ProductNode', null, {
      style_id: 'STYLE_NEW',
    });
    const child = createNode('SV_3', 'StyleVariant', oldParent, {
      ft_data_model_style_variant_id: 'FT_SV_3',
    });
    const alreadyChild = createNode('PRD_CHILD', 'ProductNode', selectedParent, {
      style_id: 'STYLE_CHILD',
    });
    const invalidParent = createNode('SKU_1', 'SKUNode', null, {});
    const webUI = {
      getSelectedSetOfNodes: jest.fn(() => createSelection([selectedParent])),
      getSelection: jest.fn(() => createSelection([child, alreadyChild])),
      showAlert: jest.fn(),
    };
    const upQueue = {
      republish: jest.fn(),
    };

    webUiLibrary.reparentViaPush(child, webUI, upQueue, 'ProductNode', 'ParentOverride');

    expect(child.setParent).toHaveBeenCalledWith(selectedParent);
    expect(child.getValue('ParentOverride').setSimpleValue).toHaveBeenCalledWith('PRD_NEW');
    expect(webUI.showAlert).toHaveBeenCalledWith(
      'ERROR',
      'Selected object with ID STYLE_CHILD is already below PRD_NEW'
    );
    expect(webUI.showAlert).toHaveBeenCalledWith(
      'ACKNOWLEDGMENT',
      '1 nodes have been reparented under PRD_NEW'
    );
    expect(upQueue.republish).toHaveBeenCalledWith(selectedParent);

    webUI.getSelectedSetOfNodes.mockReturnValue(createSelection([selectedParent, oldParent]));
    webUiLibrary.reparentViaPush(child, webUI, upQueue, 'ProductNode', 'ParentOverride');
    expect(webUI.showAlert).toHaveBeenCalledWith('ERROR', 'Only one parent selection is allowed!');

    webUI.getSelectedSetOfNodes.mockReturnValue(createSelection([invalidParent]));
    webUiLibrary.reparentViaPush(child, webUI, upQueue, 'ProductNode', 'ParentOverride');
    expect(webUI.showAlert).toHaveBeenCalledWith(
      'ERROR',
      'Invalid Selection. Please try again by selecting a valid ProductNode'
    );
  });
});
