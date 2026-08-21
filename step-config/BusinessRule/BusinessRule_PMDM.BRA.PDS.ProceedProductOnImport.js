/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.PDS.ProceedProductOnImport",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "PDX: Proceed Product On Import",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.Case", "PMDM.PRD.ExternalSourceRecord", "PMDM.PRD.Pack", "PMDM.PRD.Pallet" ],
  "allObjectTypesValid" : false,
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessFunctionBindContract",
    "alias" : "getExternalFromPackagingBusinessFunction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>PMDM.BF.GetExternalFromPackaging</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "externalSourceRecordObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.ExternalSourceRecord",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "caseObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.Case",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "packObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.Pack",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "palletObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.Pallet",
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
exports.operation0 = function (node,logger,getExternalFromPackagingBusinessFunction,externalSourceRecordObjectType,caseObjectType,packObjectType,palletObjectType,manager) {
// System Messages are stored on entities, for localization purpose.
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.PDS.POnImport_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Returned from supplier"
var msg2 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.PDS.POnImport_msg2").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Supplier has submitted changes to the product"

var workflowID = "PMDM.WF.ExternalSourceRecordHandling";
var reworkStateID = "Rework";
var enrichmentStateID = "Enrichment";

var objectTypeID = node.getObjectType().getID();
if(externalSourceRecordObjectType.getID().equals(objectTypeID)) {
	if(node.isInState(workflowID, reworkStateID)) {
		var task = node.getTaskByID(workflowID, reworkStateID);
		task.triggerByID("Submit", msg1);
	} else if(node.isInState(workflowID, enrichmentStateID)) {
		var task = node.getTaskByID(workflowID, enrichmentStateID);
		task.triggerByID("Enrichment.PDS", msg2);
	} else if(!node.isInWorkflow(workflowID)) {
		node.startWorkflowByID(workflowID, msg2);
	}
}

}