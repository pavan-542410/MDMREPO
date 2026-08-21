/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.StartTranslationNodeList",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Start Translation (Node List)",
  "description" : "Starts the Translation workflow.",
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
    "contract" : "WebUiContextBind",
    "alias" : "web",
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
exports.operation0 = function (web,manager,logger,logLib) {
var forceLog = false;
var startedInWorkflow = new java.util.ArrayList();

function log(message) {
	logLib.log(logger, "Start translation (Node List): " + message, forceLog);
}

function getMessagesFormatted() {
	var result = "Translation started for:";
	startedInWorkflow.toArray().forEach(function (error) {if(result) {result = result + "<br/>";} result = result + error;});
	return result;
}

function workflowHandling(node) {
	var translationWorkflowID = "PMDM.WF.Translation";
	var translateToGerman = node.getValue("PMDM.AT.TranslateToGerman").getID();
	var translateToFrench = node.getValue("PMDM.AT.TranslateToFrench").getID();
	var translationStarted = new java.util.ArrayList();

	if ((translateToGerman && translateToGerman.equals("Y")) || (translateToFrench && translateToFrench.equals("Y"))) { // Only continue if at least one language has been selected for translation
		if (!node.isInWorkflow(translationWorkflowID)) { // Start translation workflow if not already started
			var translationWorkflowInstance = node.startWorkflowByID(translationWorkflowID, "Workflow started");
			startedInWorkflow.add(node.getName() + " (" + node.getID() + ")");
			log(node.getID() + " has been started in workflow");
		} else { // translation workflow is already started
			if (translateToGerman && translateToGerman.equals("Y")) {
				var germanDoneTask = node.getTaskByID(translationWorkflowID, "DE-Done");
				if(germanDoneTask) {
					germanDoneTask.triggerByID("ToStart", "TEST");
					translationStarted.add("German translation started");
					log("German translation has been started for " + node.getID());
				}
			}
			if (translateToFrench && translateToFrench.equals("Y")) {
				var frenchDoneTask = node.getTaskByID(translationWorkflowID, "FR-Done");
				if(frenchDoneTask) {
					frenchDoneTask.triggerByID("ToStart", "TEST");
					translationStarted.add("French translation started");
					log("French translation has been started for " + node.getID());
				}
			}
	
			if (translationStarted.size() > 0) {
				startedInWorkflow.add(node.getName() + " (" + node.getID() + ")");
			}
		}
	} 
}

var selection = web.getSelection().iterator();
while (selection.hasNext()){
	var node = selection.next();
	if (node instanceof com.stibo.core.domain.Product && node.getObjectType().getID().equals("PMDM.PRD.InternalSourceRecord")){
		workflowHandling(node);
	}
}

if (startedInWorkflow.size() > 0) {
	web.showAlert("ACKNOWLEDGMENT", "Send For Translation", getMessagesFormatted());
} else {
	web.showAlert("ACKNOWLEDGMENT", "Send For Translation", "No products were started in workflow");
}
}