/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.EndCollaborationWF",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "End Collaboration WF",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
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
    "alias" : "web",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WorkflowStateBinding",
    "alias" : "workflowState",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,web,logger,manager,workflowState) {
// System Messages are stored on entities, for localization purpose.
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.EndCollaborationWF_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // 'Show more';

var tasklistScreenID = "Tasklist_Collaboration";
if (workflowState) {
	var currentTask = node.getTask(workflowState);
	if (currentTask) {
		currentTask.triggerByID("End_Collaboration", "");
		web.showAlert("ACKNOWLEDGMENT", msg1);
		web.navigate(tasklistScreenID, null, workflowState);
	}
}
}