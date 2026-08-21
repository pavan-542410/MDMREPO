/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.MPH_NodeList_New",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Master Product Handling - Create new Master Product",
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
    "contract" : "AttributeGroupBindContract",
    "alias" : "copyToInternalMasterProductAttributeGroup",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "PMDM.ATG.CopyToInternalMasterProduct",
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
  }, {
    "contract" : "ProductBindContract",
    "alias" : "unclassifiedFolder",
    "parameterClass" : "com.stibo.core.domain.impl.FrontProductImpl",
    "value" : "INT.UnCatLevel1",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (web,logger,manager,getGoldenFromSourceBusinessFunction,masterProductObjectType,copyToInternalMasterProductAttributeGroup,internalSourceRecordToMasterProductReferenceType,dataIssuesReport,unclassifiedFolder,logLib) {
var forceLog = false;

var msgHeader = manager.getEntityHome().getEntityByID("SysMsg_MPH_NodeList").getValue("PMDM.AT.SystemMessage").getSimpleValue();
var additionalHeader = "<b>" + msgHeader + "</b><br/>";
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_MPH_NodeList_New_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // %n internal source record(s) added to created master product
var msg2 = manager.getEntityHome().getEntityByID("SysMsg_MPH_NodeList_New_msg2").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // No internal source record(s) added to created master product
var msg3 = manager.getEntityHome().getEntityByID("SysMsg_MPH_NodeList_New_msg3").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // %n selected variant already linked to master product. Unlink to reassign.
var msg4 = manager.getEntityHome().getEntityByID("SysMsg_MPH_NodeList_New_msg4").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // Product variants must be from the same product category
var msg5 = manager.getEntityHome().getEntityByID("SysMsg_MPH_NodeList_New_msg5").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // %n selected items are not internal source record(s).
var msg6 = manager.getEntityHome().getEntityByID("SysMsg_MPH_NodeList_New_msg6").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // Selected variant is is not categorized.

var addedToMasterProduct = new java.util.ArrayList();

function log(message) {
	logLib.log(logger, "Master Product Handling - Create new Master Product: " + message, forceLog);
}

function maintainInternalSourceRecordToMasterProductReference(internalSourceRecord, masterProduct) {
	var referenceExists = false;
	internalSourceRecord.getReferences(internalSourceRecordToMasterProductReferenceType).toArray().forEach(
		function(reference) {
			var referenceTargetID = reference.getTarget().getID();
			log("... referenceTargetID: " + referenceTargetID);
			if (referenceTargetID.equals(masterProduct.getID())) {
				referenceExists = true;
				log("... internalSourceRecordToMasterProductReference already exists");
			} else {
				reference.delete();
				log("... internalSourceRecordToMasterProductReference deleted");
			}
		}
	);

	if (!referenceExists) {
		internalSourceRecord.createReference(masterProduct, internalSourceRecordToMasterProductReferenceType);
		log("internalSourceRecordToMasterProductReference created");		
	}
}

function copyValue(source, target, attribute) {
	var result = false;
	var attributeID = attribute.getID();
	var value = source.getValue(attributeID);
	if (value) {
		var simpleValue = value.getSimpleValue();
		if (simpleValue) {
			var targetValue = target.getValue(attributeID);
			if (targetValue.canSetValue()) {
				log("... Setting value of: " + attributeID + " = " + simpleValue + " on " + target.getID());
				targetValue.setSimpleValue(simpleValue);
				result = true;
			} else {
				log("... The attribute " + attributeID + " is not valid for " + target.getID() + " or user is not privileged to set value");
			}
		}
	}
	return result;
}

function copyAttributeValues(internalSourceRecord, internalMasterProduct, attributeGroup) {
	var goldenRecord = getGoldenFromSourceBusinessFunction.evaluate({"node" : node});
	attributeGroup.getAllAttributes().toArray().forEach(
		function(attribute) {
			var valueCopiedFromInternalSourceRecord = copyValue(internalSourceRecord, internalMasterProduct, attribute);
			if (!valueCopiedFromInternalSourceRecord && goldenRecord) {
				copyValue(goldenRecord, internalMasterProduct, attribute);
			}
		}
	);
}

function masterProductHandling(node, masterProduct) {
	log("NodeID: " + node.getID());
	var parentNode = node.getParent();
	if (masterProduct) {
		node.setParent(masterProduct);
		maintainInternalSourceRecordToMasterProductReference(node, masterProduct);
		addedToMasterProduct.add(node.getName());
		log(node.getID() + " has been moved to existing Master Product (" + masterProduct.getID() + ")");
	} else {
		masterProduct = parentNode.createProduct("", masterProductObjectType);
		if (masterProduct) {
			node.setParent(masterProduct);
			maintainInternalSourceRecordToMasterProductReference(node, masterProduct);
			masterProduct.setName(node.getName() + " (Master Product)");
			copyAttributeValues(node, masterProduct, copyToInternalMasterProductAttributeGroup);
			addedToMasterProduct.add(node.getName());
			log("New Master Product (" + masterProduct.getID() + ") has been created and " + node.getID() + " has been moved to it");
		}
	}
	return masterProduct;
}

// Check that the selected items are Internal Source Records, not already below a master product and below same product category
var intValidated = true;
var mpValidated = true;
var unclassifiedValidated = true;
var parentValidated = true;
var parentIDforValidation = null;
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
		dataIssuesReport.addError(additionalHeader + msg5, node);
		errorIncludingNode = true;
		errorCounter++;
	}
 	
	if (nodeParent.getObjectType().getID().equals(masterProductObjectType.getID())) {
		log("mpValidated = false");
		mpValidated = false;
		dataIssuesReport.addError(additionalHeader + msg3, node);
		errorIncludingNode = true;
		errorCounter++;
	}

	if (nodeParent.getID().equals(unclassifiedFolder.getID())) {
		log("unclassifiedValidated = false");
		unclassifiedValidated = false;
		dataIssuesReport.addError(additionalHeader + msg6, node);
		errorIncludingNode = true;
		errorCounter++;
	}

	if (!parentIDforValidation) {
		parentIDforValidation = nodeParent.getID();
		log("parentIDforValidation set to: " + parentIDforValidation);
	} else if (!parentIDforValidation.equals(nodeParent.getID())) {
		log("parentValidated = false");
		parentValidated = false;
	}
}

var errorFound = false;

if (!intValidated) {
	errorFound = true;
}

if (!mpValidated) {
	errorFound = true;
}

if (!unclassifiedValidated) {
	errorFound = true;
}

if (!parentValidated) {
	dataIssuesReport.addError(additionalHeader + msg4);
	errorCounter++;
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
		masterProduct = masterProductHandling(selectionNode, masterProduct);
	}
	web.showAlert("ACKNOWLEDGMENT", msgHeader, String(msg1).replace("%n", addedToMasterProduct.size()));
}
}