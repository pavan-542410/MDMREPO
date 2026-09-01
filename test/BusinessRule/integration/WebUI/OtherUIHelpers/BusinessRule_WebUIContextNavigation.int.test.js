const businessRuleModule = require('../../../../../step-configs/BusinessRule/BusinessRule_WebUIContextNavigation');

test('starts workflow when node is not already in workflow', () => {
  const maintainState = { id: 'MaintainState' };
  const workflow = {
    getStateByID: (id) => (id === 'Maintain' ? maintainState : { id }),
    start: jest.fn()
  };

  const step = {
    getWorkflowHome: () => ({ getWorkflowByID: () => workflow })
  };

  const node = {
    getWorkflowInstanceByID: () => null
  };

  const web = {
    showAlert: jest.fn(),
    navigate: jest.fn()
  };

  businessRuleModule.operation0(node, step, web, null);

  expect(workflow.start).toHaveBeenCalledWith(node, null);
  expect(web.showAlert).toHaveBeenCalledWith('ACKNOWLEDGEMENT', '', 'Item maintenance workflow started');
  expect(web.navigate).toHaveBeenCalledWith('Details Item', node, maintainState);
});

test('only navigates and alerts when node is already in workflow', () => {
  const maintainState = { id: 'MaintainState' };
  const workflow = {
    getStateByID: (id) => (id === 'Maintain' ? maintainState : { id }),
    start: jest.fn()
  };

  const step = {
    getWorkflowHome: () => ({ getWorkflowByID: () => workflow })
  };

  const node = {
    getWorkflowInstanceByID: () => ({ id: 'existingInstance' })
  };

  const web = {
    showAlert: jest.fn(),
    navigate: jest.fn()
  };

  businessRuleModule.operation0(node, step, web, null);

  expect(workflow.start).not.toHaveBeenCalled();
  expect(web.showAlert).toHaveBeenCalledWith('ACKNOWLEDGEMENT', '', 'Item is already in workflow');
  expect(web.navigate).toHaveBeenCalledWith('Details Item', node, maintainState);
});
