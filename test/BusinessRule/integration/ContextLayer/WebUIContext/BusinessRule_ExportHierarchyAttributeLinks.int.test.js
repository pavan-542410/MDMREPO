const businessRuleModule = require('../../../../../step-configs/BusinessRule/BusinessRule_ExportHierarchyAttributeLinks');

test('delegates to SendHierarchyAttributeLinksToCurrentUser action', () => {
  const node = { id: 'NODE_1' };
  const logger = { info: jest.fn() };
  const sendHierarchyAttributeLinksToCurrentUser = { execute: jest.fn() };
  const ui = { showAlert: jest.fn() };
  const step = { getCurrentUser: () => ({ getID: () => 'testuser', getName: () => 'Test User' }) };

  businessRuleModule.operation0(node, logger, sendHierarchyAttributeLinksToCurrentUser, ui, step);

  expect(sendHierarchyAttributeLinksToCurrentUser.execute).toHaveBeenCalledTimes(1);
  expect(sendHierarchyAttributeLinksToCurrentUser.execute).toHaveBeenCalledWith(node);
  expect(ui.showAlert).toHaveBeenCalledWith(
    'ACKNOWLEDGMENT',
    'Hierarchy Attribute Links Export',
    expect.stringContaining('testuser')
  );
});
