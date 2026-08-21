/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.StartERPCommunicationWorkflow",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Start ERP Communication Workflow",
  "description" : "Starts the ERP Communication workflow.",
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
    "contract" : "BusinessFunctionBindContract",
    "alias" : "getInternalFromGoldenBusinessFunction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>PMDM.BF.GetInternalFromGolden</BusinessFunction>\n</BusinessFunctionReference>\n",
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
exports.operation0 = function (node,logger,getInternalFromGoldenBusinessFunction,manager,logLib) {
var forceLog = false;

function log(message) {
	logLib.log(logger, "Start ERP Communication workflow: " + message, forceLog);
}

// System Messages are stored on entities, for localization purpose.
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.StartERPComWF_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Started"

//Start in ERP Communication workflow if not already started
var internalSourceRecord = getInternalFromGoldenBusinessFunction.evaluate({"node" : node});
if(internalSourceRecord != null) {
	var erpCommunicationWorkflowID = "PMDM.WF.ERPCommunication";
	if (!internalSourceRecord.isInWorkflow(erpCommunicationWorkflowID)) {
		var erpCommunicationWorkflowInstance = internalSourceRecord.startWorkflowByID("PMDM.WF.ERPCommunication", msg1); // "Started"
		log(internalSourceRecord.getID() + " has been started in workflow");
	}
}
}
/*===== business rule plugin definition =====
{
  "pluginId" : "ReferenceOtherBCBusinessCondition",
  "parameters" : [ {
    "id" : "ReferencedBC",
    "type" : "com.stibo.core.domain.businessrule.BusinessCondition",
    "value" : "PMDM.BRC.PublishToERP"
  }, {
    "id" : "ValueWhenReferencedIsNA",
    "type" : "com.stibo.util.basictypes.TrueFalseParameter",
    "value" : "false"
  } ],
  "pluginType" : "Precondition"
}
*/
