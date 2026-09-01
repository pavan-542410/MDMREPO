const businessRuleModule = require('../../../../../step-configs/BusinessRule/BusinessRule_MakeSelectedAssetPrimary');

function selectionFrom(node) {
  return {
    iterator: () => ({ next: () => node })
  };
}

test('no-ops when selected asset is already primary', () => {
  const selectedNode = {
    getValue: (attrID) => {
      if (attrID === 'is_style_variant_primary_image') {
        return { getSimpleValue: () => 'true', setSimpleValue: jest.fn() };
      }
      return { getSimpleValue: () => 'hero' };
    },
    approve: jest.fn()
  };

  const ui = {
    getSelection: () => selectionFrom(selectedNode),
    showAlert: jest.fn()
  };

  businessRuleModule.operation0(ui, null, null);

  expect(ui.showAlert).toHaveBeenCalledWith('INFO', 'This Asset is already Primary');
  expect(selectedNode.approve).not.toHaveBeenCalled();
});

test('shows warning for non-hero asset types', () => {
  const setSimpleValue = jest.fn();
  const selectedNode = {
    getValue: (attrID) => {
      if (attrID === 'is_style_variant_primary_image') {
        return { getSimpleValue: () => 'false', setSimpleValue };
      }
      return { getSimpleValue: () => 'flat' };
    },
    approve: jest.fn()
  };

  const ui = {
    getSelection: () => selectionFrom(selectedNode),
    showAlert: jest.fn()
  };

  businessRuleModule.operation0(ui, null, null);

  expect(ui.showAlert).toHaveBeenCalledWith('WARNING', 'Asset type must be hero or on_figure_hero');
  expect(setSimpleValue).not.toHaveBeenCalled();
  expect(selectedNode.approve).not.toHaveBeenCalled();
});

test('marks hero asset as primary and approves it', () => {
  const setSimpleValue = jest.fn();
  const selectedNode = {
    getValue: (attrID) => {
      if (attrID === 'is_style_variant_primary_image') {
        return { getSimpleValue: () => 'false', setSimpleValue };
      }
      return { getSimpleValue: () => 'hero' };
    },
    approve: jest.fn()
  };

  const ui = {
    getSelection: () => selectionFrom(selectedNode),
    showAlert: jest.fn()
  };

  businessRuleModule.operation0(ui, null, null);

  expect(setSimpleValue).toHaveBeenCalledWith(true);
  expect(selectedNode.approve).toHaveBeenCalledTimes(1);
  expect(ui.showAlert).toHaveBeenCalledWith('INFO', 'Asset has been set as Primary');
});
