/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.TranslationHandling",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Translation Handling",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BusinessRuleLogging",
    "libraryAlias" : "logLib"
  } ]
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentWorkflowBindContract",
    "alias" : "workflow",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,workflow,logger,logLib) {
var forceLog = false;

function log(message) {
	logLib.log(logger, "Handle translation: " + message, forceLog);
}

var workflowID = workflow.getID();

if (node.isInState(workflowID, "DE-Done") && node.isInState(workflowID, "FR-Done")) {
	log("No active translations so end workflow");
	var statesToForward = ["DE-Done", "FR-Done"];
	var instance = node.getWorkflowInstance(workflow);
	var tasks = instance.getTasks();
	var taskIt = tasks.iterator();
	while(taskIt.hasNext()){
		var task = taskIt.next();
		var stateID = task.getState().getID() + "";
		log("stateID: " + stateID + " indexOf: " + statesToForward.indexOf(stateID));
		if (statesToForward.indexOf(stateID) > -1){
			task.triggerLaterByID("ToEnd", "");
			log("triggerLaterByID: ToEnd");
		}		
	}
} else {
	log("At least one translation is still in progress so do nothing");	
}

}