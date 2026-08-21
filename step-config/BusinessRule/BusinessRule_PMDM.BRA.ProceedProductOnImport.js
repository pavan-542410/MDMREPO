/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.ProceedProductOnImport",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Proceed Product On Import",
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
    "contract" : "ObjectTypeBindContract",
    "alias" : "externalSourceRecordObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.ExternalSourceRecord",
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "processedByAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.ProcessedBy",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,externalSourceRecordObjectType,manager,processedByAttribute) {
function getSingleValueLovID(product, attributeID) {
	var value = product.getValue(attributeID);
	if (value) {
		return value.getID();
	}
	return null;
}

var processedByAttributeID = processedByAttribute.getID();
var processedByValue = getSingleValueLovID(node, processedByAttributeID);
if(!processedByValue) {
	node.getValue(processedByAttributeID).setLOVValueByID("Importer");
}

var workflowID = "PMDM.WF.ExternalSourceRecordHandling";

var objectTypeID = node.getObjectType().getID();
if(externalSourceRecordObjectType.getID().equals(objectTypeID)) {
	if (!node.isInWorkflow(workflowID)) {
		node.startWorkflowByID(workflowID, "Started by import");
	}
}
}