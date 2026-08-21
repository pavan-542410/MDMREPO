/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.UnlinkFromMasterProduct",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Unlink From Master Product",
  "description" : "Changes a product variant back to a regular product.",
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
    "contract" : "ObjectTypeBindContract",
    "alias" : "masterProductObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.InternalMasterProduct",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "internalSourceRecordToMasterProductReferenceType",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "PMDM.PRT.INT2MP",
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssuesReport",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,web,logger,manager,masterProductObjectType,internalSourceRecordToMasterProductReferenceType,dataIssuesReport,logLib) {
var forceLog = false;

var msgHeader = manager.getEntityHome().getEntityByID("SysMsg_UnlinkFromMasterProduct").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // Master Product Handling
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_UnlinkFromMasterProduct_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // %n unlinked from master product.
var msg2 = manager.getEntityHome().getEntityByID("SysMsg_UnlinkFromMasterProduct_msg2").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // Variant is not linked to a master product.

function log(message) {
	logLib.log(logger, "Unlink From Master Product: " + message, forceLog);
}

function deleteInternalSourceRecordToMasterProductReference(internalSourceRecord) {
	var referenceExists = false;
	internalSourceRecord.getReferences(internalSourceRecordToMasterProductReferenceType).toArray().forEach(
		function(reference) {
			reference.delete();
		}
	);
}

var parentObject = node.getParent();
if (masterProductObjectType.getID().equals(parentObject.getObjectType().getID())) {
	node.setParent(parentObject.getParent());
	deleteInternalSourceRecordToMasterProductReference(node);
	web.showAlert("ACKNOWLEDGMENT", msgHeader, String(msg1).replace("%n", node.getName()));
} else {
	dataIssuesReport.addIssuesReportHeader(msgHeader);
	dataIssuesReport.addError(msg2, node);
	return dataIssuesReport;
}

}