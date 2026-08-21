/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "ReworkFromApproveState",
  "type" : "BusinessAction",
  "setupGroups" : [ "DemoRules" ],
  "name" : "ReworkFromApproveState",
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
	task.triggerByID("Rework","Rework from approve");
	webUI.navigate("homepage", null);
	webUI.showAlert("INFO", "Location Reworked for Updates");
}

}