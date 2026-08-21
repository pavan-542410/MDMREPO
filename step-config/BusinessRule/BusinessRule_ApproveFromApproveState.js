/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "ApproveFromApproveState",
  "type" : "BusinessAction",
  "setupGroups" : [ "DemoRules" ],
  "name" : "ApproveFromApproveState",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webUI",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,webUI) {
var wfInstance = node.getWorkflowInstanceByID("LocationWorkflow");
var task = node.getTaskByID("LocationWorkflow", "ApproveLocation");
if(task){
	task.triggerByID("Approve","approve from approve state");
	webUI.navigate("homepage", null);
	webUI.showAlert("INFO", "Location Changes are Approved Successfully");
}

}