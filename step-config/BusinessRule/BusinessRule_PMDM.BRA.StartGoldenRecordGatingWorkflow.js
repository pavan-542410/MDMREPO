/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.StartGoldenRecordGatingWorkflow",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Start Golden Record Gating Workflow",
  "description" : "Starts the Golden Record Gating workflow.",
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.GoldenRecord" ],
  "allObjectTypesValid" : false,
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,manager,logLib) {
var forceLog = false;

function log(message) {
	logLib.log(logger, "Start Golden Record Gating Workflow: " + message, forceLog);
}

// System Messages are stored on entities, for localization purpose.
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.StartGRGatingWF_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Match Algorithm ending workflow for restarting it"
var msg2 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.StartGRGatingWF_msg2").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Started by the Matching Algorithm"

var gateWorkflowID = "PMDM.WF.GoldenRecordGating";
//is Golden Record in Golden Record Gating workflow? If yes, terminate workflow
if (node.isInWorkflow(gateWorkflowID)) {
	log("Golden Record: " + node + " is in Workflow - ending workflow");
	var gateWorkflowInstance = node.getWorkflowInstanceByID(gateWorkflowID);
	gateWorkflowInstance.delete(msg1);
}
//start the Golden Record in the Gate workflow
var gateWorkflowInstance = node.startWorkflowByID(gateWorkflowID, msg2);
}