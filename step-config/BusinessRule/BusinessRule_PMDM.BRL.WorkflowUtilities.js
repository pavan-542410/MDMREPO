/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRL.WorkflowUtilities",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "PMDM.BusinessRuleLibraries" ],
  "name" : "Workflow Utilities",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
function storeDataInWorkflowVariable(manager, node, workflow, variable, value) {
  node.getWorkflowInstance(workflow).setSimpleVariable(variable, value);
}

function storeCurrentUserInWorkflowVariable(manager, node, workflow, variable) {
  var userID = manager.getCurrentUser().getID();
  storeDataInWorkflowVariable(manager, node, workflow, variable, userID);
}

function setUserAssigneeFromVariable(manager, node, workflow, taskID, variable) {
  var instance = node.getWorkflowInstance(workflow);
  var task = instance.getTaskByID(taskID);
  var userID = instance.getSimpleVariable(variable);
  if (userID != null){
    var user = manager.getUserHome().getUserByID(userID);
    if (user != null){
      manager.executeWritePrivileged(function() {	
        task.reassign(user);
      });
    }
  }
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.storeDataInWorkflowVariable = storeDataInWorkflowVariable
exports.storeCurrentUserInWorkflowVariable = storeCurrentUserInWorkflowVariable
exports.setUserAssigneeFromVariable = setUserAssigneeFromVariable