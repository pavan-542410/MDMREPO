/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.CollaborationHandling",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Collaboration Handling",
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
	logLib.log(logger, "Collaboration Handling: " + message, forceLog);
}

var workflowID = workflow.getID();

if (!node.isInState(workflowID, "BuyerMessage") && !node.isInState(workflowID, "ImageMessage") && !node.isInState(workflowID, "MarketingMessage") && !node.isInState(workflowID, "WarehouseMessage") && !node.isInState(workflowID, "QAMessage") && !node.isInState(workflowID, "EnrichmentMessage") && !node.isInState(workflowID, "DataGovernanceMessage") && !node.isInState(workflowID, "TranslationMessage") && !node.isInState(workflowID, "TranslationReviewMessage")) {
	log("Collaboration: Not in any Message states so end workflow");
	var statesToForward = ["BuyerStart", "BuyerDone", "ImageStart", "ImageDone", "MarketingStart", "MarketingDone", "WarehouseStart", "WarehouseDone", "QAStart", "QADone", "EnrichmentStart", "EnrichmentDone", "DataGovernanceStart", "DataGovernanceDone", "TranslationStart", "TranslationDone", "TranslationReviewStart", "TranslationReviewDone"];
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
	log("Collaboration: Is in at least one Message state so do nothing...");	
}

}