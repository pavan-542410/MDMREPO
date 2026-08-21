/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.MasterProductHandling",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Master Product Handling",
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
    "contract" : "AttributeBindContract",
    "alias" : "masterProductIDAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.PDS.MasterProductID",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "manuallySelectedMasterProductReferenceType",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "PMDM.PRT.ManuallySelectedMasterProduct",
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
exports.operation0 = function (node,web,logger,manager,getGoldenFromSourceBusinessFunction,masterProductObjectType,copyToInternalMasterProductAttributeGroup,internalSourceRecordToMasterProductReferenceType,masterProductIDAttribute,manuallySelectedMasterProductReferenceType,dataIssuesReport,logLib) {
var forceLog = false;

var msgHeader = manager.getEntityHome().getEntityByID("SysMsg_MasterProductHandling").getValue("PMDM.AT.SystemMessage").getSimpleValue();
var additionalHeader = "<b>" + msgHeader + "</b><br/>";
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_MasterProductHandling_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue();
var msg2 = manager.getEntityHome().getEntityByID("SysMsg_MasterProductHandling_msg2").getValue("PMDM.AT.SystemMessage").getSimpleValue();
var msg3 = manager.getEntityHome().getEntityByID("SysMsg_MasterProductHandling_msg3").getValue("PMDM.AT.SystemMessage").getSimpleValue();
var msg4 = manager.getEntityHome().getEntityByID("SysMsg_MasterProductHandling_msg4").getValue("PMDM.AT.SystemMessage").getSimpleValue();
var msg5 = manager.getEntityHome().getEntityByID("SysMsg_MasterProductHandling_msg5").getValue("PMDM.AT.SystemMessage").getSimpleValue();
var msg6 = manager.getEntityHome().getEntityByID("SysMsg_MasterProductHandling_msg6").getValue("PMDM.AT.SystemMessage").getSimpleValue();
var msg7 = manager.getEntityHome().getEntityByID("SysMsg_MasterProductHandling_msg7").getValue("PMDM.AT.SystemMessage").getSimpleValue();

function log(message) {
	logLib.log(logger, "Master Product Handling: " + message, forceLog);
}

function getMasterProductID(node) {
	var masterProductID = "";
	masterProductID = node.getValue(masterProductIDAttribute.getID()).getSimpleValue();
	log("Master Product from INT: " + masterProductID);
	if (!masterProductID) {
		var goldenRecord = getGoldenFromSourceBusinessFunction.evaluate({"node" : node});
		if (goldenRecord) {
			masterProductID = goldenRecord.getValue(masterProductIDAttribute.getID()).getSimpleValue();
			log("Master Product from GR: " + masterProductID);	
		}
	}
	return masterProductID;
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

var masterProductHandlingValue = node.getValue("PMDM.AT.MasterProductHandling")
var masterProductHandlingValueID = masterProductHandlingValue.getID();
if (masterProductHandlingValueID) {
	log("masterProductHandlingValueID: " + masterProductHandlingValueID);

	var parentNode = node.getParent();
	var parentNodeObjectType = parentNode.getObjectType();
	if (!parentNodeObjectType.getID().equals(masterProductObjectType.getID())) {

		if (masterProductHandlingValueID.equals("02_New")) {
			var masterProduct = parentNode.createProduct("", masterProductObjectType);
			if (masterProduct) {
				node.setParent(masterProduct);
				maintainInternalSourceRecordToMasterProductReference(node, masterProduct);
				masterProduct.setName(node.getName() + " (Master Product)");
				copyAttributeValues(node, masterProduct, copyToInternalMasterProductAttributeGroup);
				masterProductHandlingValue.deleteCurrent();
				log("New Master Product (" + masterProduct.getID() + ") has been created and " + node.getID() + " has been moved to it");
				//web.showAlert("ACKNOWLEDGMENT", "New Master Product has been created and " + node.getName() + " has been moved to it");
				web.showAlert("ACKNOWLEDGMENT", msgHeader, String(msg2).replace("%n", node.getName()));
			}
		}
		
		if (masterProductHandlingValueID.equals("01_Suggested")) {
			var masterProductID = getMasterProductID(node);
			log("masterProductID : " + masterProductID );
			if (masterProductID) {
				var masterProduct = manager.getNodeHome().getObjectByKey('PMDM.Key.INTMP.MasterProductID', masterProductID);
				if (masterProduct) {
					var masterProductParent = masterProduct.getParent();
					if (masterProductParent.getID().equals(parentNode.getID())) {
						node.setParent(masterProduct);
						maintainInternalSourceRecordToMasterProductReference(node, masterProduct);
						masterProductHandlingValue.deleteCurrent();
						log(node.getID() + " has been moved to " + masterProduct.getID());
						//web.showAlert("ACKNOWLEDGMENT", node.getName() + " has been moved to " + masterProduct.getName());
						web.showAlert("ACKNOWLEDGMENT", msgHeader, String(msg7).replace("%n", node.getName()));
					} else {
						// Parent is != master product parent
						//web.showAlert("ERROR", node.getName() + " is from a different product category than the selected master product.");
						dataIssuesReport.addError(additionalHeader + "The variant is from a different product category than the selected master product.", node);
						return dataIssuesReport;
					}
				} else {
					masterProduct = parentNode.createProduct("", masterProductObjectType);
					if (masterProduct) {
						node.setParent(masterProduct);
						maintainInternalSourceRecordToMasterProductReference(node, masterProduct);
						masterProduct.setName(node.getName() + " (Master Product)");
						masterProduct.getValue(masterProductIDAttribute.getID()).setSimpleValue(masterProductID);
						copyAttributeValues(node, masterProduct, copyToInternalMasterProductAttributeGroup);
						masterProductHandlingValue.deleteCurrent();
						log("New Master Product (" + masterProduct.getID() + ") has been created and " + node.getID() + " has been moved to it");
						//web.showAlert("ACKNOWLEDGMENT", "New Master Product has been created and " + node.getName() + " has been moved to it");
						web.showAlert("ACKNOWLEDGMENT", msgHeader, String(msg2).replace("%n", node.getName()));
					}
				}				
			} else {
				log("The product does not have a 'PDX: Master Product ID' value.");
				//web.showAlert("ERROR", "The product does not have a 'PDX: Master Product ID' value.");
				dataIssuesReport.addError(additionalHeader + msg5, node);
				return dataIssuesReport;

			}
		}
	
		if (masterProductHandlingValueID.equals("03_Manually")) {
			var manuallySelectedMasterProductReference = null;
			node.queryReferences(manuallySelectedMasterProductReferenceType).forEach(
				function (reference) {
					manuallySelectedMasterProductReference = reference;
					return false;
				}
			);
			if (manuallySelectedMasterProductReference) {
				var masterProduct = manuallySelectedMasterProductReference.getTarget();
				log("masterProduct: " + masterProduct.getID());
				var masterProductParent = masterProduct.getParent();
				if (masterProductParent.getID().equals(parentNode.getID())) {
					node.setParent(masterProduct);
					maintainInternalSourceRecordToMasterProductReference(node, masterProduct);
					manuallySelectedMasterProductReference.delete();
					masterProductHandlingValue.deleteCurrent();
					log(node.getID() + " has been moved to " + masterProduct.getID());
					//web.showAlert("ACKNOWLEDGMENT", node.getName() + " has been moved to " + masterProduct.getName());
					web.showAlert("ACKNOWLEDGMENT", msgHeader, String(msg7).replace("%n", node.getName()));
				} else {
					//web.showAlert("ERROR", node.getName() + " is from a different product category than the selected master product.");
					dataIssuesReport.addError(additionalHeader + msg6, node);
					return dataIssuesReport;
				}
			} else {
				log("The Internal Source Record does not have an Alternate Master Product reference defined.");
				//web.showAlert("ERROR", "The Internal Source Record does not have an Alternate Master Product reference defined.");
				dataIssuesReport.addError(additionalHeader + msg4, node);
				return dataIssuesReport;
			}
		}

	} else {
		log("Internal Source Record already belongs to a Master Product.");
		//web.showAlert("ERROR", "Internal Source Record already belongs to a Master Product.");
		dataIssuesReport.addError(additionalHeader + msg1, node);
		return dataIssuesReport;
	}

} else {
	log("No Master Product Handling option is selected.");
	//web.showAlert("ERROR", "No Master Product Handling option is selected.");
	dataIssuesReport.addError(additionalHeader + msg3, node);
	return dataIssuesReport;
}

}