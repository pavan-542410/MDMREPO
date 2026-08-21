/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.MPH_NodeList_Unlink",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Master Product Handling - Unlink from Master Product",
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
    "contract" : "BusinessFunctionBindContract",
    "alias" : "getGoldenFromSourceBusinessFunction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>PMDM.BF.GetGoldenFromSource</BusinessFunction>\n</BusinessFunctionReference>\n",
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
exports.operation0 = function (web,logger,manager,getGoldenFromSourceBusinessFunction,masterProductObjectType,internalSourceRecordToMasterProductReferenceType,dataIssuesReport,logLib) {
var forceLog = false;

var msgHeader = manager.getEntityHome().getEntityByID("SysMsg_MPH_NodeList").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // Master Product Handling
var additionalHeader = "<b>" + msgHeader + "</b><br/>";
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_MPH_NodeList_Unlink_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // %n variant(s) unlinked from master product(s)
var msg2 = manager.getEntityHome().getEntityByID("SysMsg_MPH_NodeList_Unlink_msg2").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // No variant(s) unlinked from master product(s)
var msg3 = manager.getEntityHome().getEntityByID("SysMsg_MPH_NodeList_Unlink_msg3").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // Selected variant is not linked to a master product.
var msg4 = manager.getEntityHome().getEntityByID("SysMsg_MPH_NodeList_Unlink_msg4").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // Selected item is not an internal source record.

var unlinkedFromMasterProduct = new java.util.ArrayList();

function log(message) {
	logLib.log(logger, "Master Product Handling - Unlink from Master Product: " + message, forceLog);
}

function deleteInternalSourceRecordToMasterProductReference(internalSourceRecord) {
	var referenceExists = false;
	internalSourceRecord.getReferences(internalSourceRecordToMasterProductReferenceType).toArray().forEach(
		function(reference) {
			reference.delete();
		}
	);
}

function masterProductHandling(node) {
	var parentObject = node.getParent();
	if (masterProductObjectType.getID().equals(parentObject.getObjectType().getID())) {
		node.setParent(parentObject.getParent());
		deleteInternalSourceRecordToMasterProductReference(node);
		unlinkedFromMasterProduct.add(node.getName());
	}
}

var intValidated = true;
var mpValidated = true;
var errorCounter = 0;
var errorIncludingNode = false;

var validationIterator = web.getSelection().iterator();
while (validationIterator.hasNext()){
	var node = validationIterator.next();
	var nodeParent = node.getParent();
	log("validationNode: " + node);

 	if (node instanceof com.stibo.core.domain.Product && !node.getObjectType().getID().equals("PMDM.PRD.InternalSourceRecord")) {
		log("intValidated = false");
 		intValidated = false;
		dataIssuesReport.addError(additionalHeader + msg4, node);
		errorIncludingNode = true;
		errorCounter++;
	}

	if (!nodeParent.getObjectType().getID().equals(masterProductObjectType.getID())) {
		log("mpValidated = false");
		mpValidated = false;
		dataIssuesReport.addError(additionalHeader + msg3, node);
		errorIncludingNode = true;
		errorCounter++;
	}
}

var errorFound = false;

if (!intValidated) {
	errorFound = true;
}

if (!mpValidated) {
	errorFound = true;
}

if (errorFound) {
	if (errorCounter > 1 || errorIncludingNode == false) {
		dataIssuesReport.addIssuesReportHeader(msgHeader);
	}
	return dataIssuesReport;
}

if (!errorFound) {
	var masterProduct = null;
	var selection = web.getSelection().iterator();
	while (selection.hasNext()){
		var selectionNode = selection.next();
		masterProductHandling(selectionNode);
	}
	web.showAlert("ACKNOWLEDGMENT", msgHeader, String(msg1).replace("%n", unlinkedFromMasterProduct.size()));
}

/*
var selection = web.getSelection().iterator();
while (selection.hasNext()){
	var node = selection.next();
	if (node instanceof com.stibo.core.domain.Product && node.getObjectType().getID().equals("PMDM.PRD.InternalSourceRecord")){
		log("NodeID: " + node.getID());
		masterProductHandling(node);
	}
}

if (unlinkedFromMasterProduct.size() > 0) {
	web.showAlert("ACKNOWLEDGMENT", msgHeader, String(msg1).replace("%n", unlinkedFromMasterProduct.size()));
} else {
	web.showAlert("ACKNOWLEDGMENT", msgHeader, msg2);
}
*/
}