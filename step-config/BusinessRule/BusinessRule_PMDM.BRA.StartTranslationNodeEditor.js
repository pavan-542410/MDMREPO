/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.StartTranslationNodeEditor",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Start Translation (Node Editor)",
  "description" : "Starts the Translation workflow.",
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.InternalSourceRecord" ],
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
    "contract" : "WebUiContextBind",
    "alias" : "web",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,manager,web,logLib) {
var forceLog = false;
var translationMessage = new java.util.ArrayList();

function log(message) {
	logLib.log(logger, "Start translation (Node Editor): " + message, forceLog);
}

function getMessagesFormatted() {
	var result = "";
	translationMessage.toArray().forEach(function (error) {if(result) {result = result + "<br/>";} result = result + error;});
	return result;
}

var translationWorkflowID = "PMDM.WF.Translation";
var translateToGerman = node.getValue("PMDM.AT.TranslateToGerman").getID();
var translateToFrench = node.getValue("PMDM.AT.TranslateToFrench").getID();

if ((translateToGerman && translateToGerman.equals("Y")) || (translateToFrench && translateToFrench.equals("Y"))) { // Only continue if at least one language has been selected for translation
	if (!node.isInWorkflow(translationWorkflowID)) { // Start translation workflow if not already started
		var translationWorkflowInstance = node.startWorkflowByID(translationWorkflowID, "Workflow started");
		log(node.getID() + " has been started in workflow");
		if (translateToGerman && translateToGerman.equals("Y")) {
			translationMessage.add("German translation started");
		}
		if (translateToFrench && translateToFrench.equals("Y")) {
			translationMessage.add("French translation started");
		}
	} else { // translation workflow is already started
		if (translateToGerman && translateToGerman.equals("Y")) {
			var germanDoneTask = node.getTaskByID(translationWorkflowID, "DE-Done");
			if(germanDoneTask) {
				germanDoneTask.triggerByID("ToStart", "TEST");
				translationMessage.add("German translation started");
				log("German translation has been started for " + node.getID());
			}
		}
		if (translateToFrench && translateToFrench.equals("Y")) {
			var frenchDoneTask = node.getTaskByID(translationWorkflowID, "FR-Done");
			if(frenchDoneTask) {
				frenchDoneTask.triggerByID("ToStart", "TEST");
				translationMessage.add("French translation started");
				log("French translation has been started for " + node.getID());
			}
		}

		if (translationMessage.size() == 0) {
			translationMessage.add("No new translations has been started");
		}
	}

} else { // No languages are selected for translation
	var msg = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.StartTranslationWeb_msg2").getValue("PMDM.AT.SystemMessage").getSimpleValue();
	translationMessage.add(msg);
}

if (translationMessage.size() > 0) {
	web.showAlert("ACKNOWLEDGMENT", "Send For Translation", getMessagesFormatted());
}

}