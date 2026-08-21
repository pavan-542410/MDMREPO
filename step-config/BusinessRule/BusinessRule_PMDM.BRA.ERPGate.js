/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.ERPGate",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.GoldenRecordGatingActions" ],
  "name" : "ERP Gate",
  "description" : "Enacted on entry.  Checks Mandatory Attributes (PMDM.ATG.ERPGateMandatoryAttributes).  Checks Mandatory References and Links (PMDM.ATG.ERPGateMandatoryReferences).",
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
    "alias" : "current",
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
    "contract" : "AttributeBindContract",
    "alias" : "publishToERPAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.PublishToERP",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "blockPublishToERPAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.BlockPublishToERP",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "erpGateErrorsAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.ERPGateErrors",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "goldenRecordObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.GoldenRecord",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "erpQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=PMDM.OIEP.ProductOutboundERP",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "erpGateMandatoryAttributesGroup",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "PMDM.ATG.ERPGateMandatoryAttributes",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "erpGateMandatoryReferencesGroup",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "PMDM.ATG.ERPGateMandatoryReferences",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "packagingUnitReferencesAttributeGroup",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "PMDM.ATG.PackagingUnitReferences",
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
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
    "contract" : "AttributeBindContract",
    "alias" : "firstGatingDoneAttribute ",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.FirstGatingDone",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (current,logger,publishToERPAttribute,blockPublishToERPAttribute,erpGateErrorsAttribute,goldenRecordObjectType,erpQueue,erpGateMandatoryAttributesGroup,erpGateMandatoryReferencesGroup,packagingUnitReferencesAttributeGroup,manager,getInternalFromGoldenBusinessFunction,firstGatingDoneAttribute ,logLib) {
/* Enacted on entry.  Checks Mandatory Attributes (PMDM.ATG.ERPGateMandatoryAttributes).  Checks Mandatory References and Links (PMDM.ATG.ERPGateMandatoryReferences). */

var forceLog = false;
var errors = new java.util.ArrayList();

function log(message) {
	logLib.log(logger, "ERP Gate: " + message, forceLog);
}

function getErrorsForMultiValue() {
	var result = "";
	errors.toArray().forEach(function (error) {if(result) {result = result + "<multisep/>";} result = result + error;});
	return result;
}

function pushNodeFromWaiting(waitingTask) {
	if(errors.size() > 0) {
		waitingTask.triggerByID("Waiting_For_ERP_Gating.Error", msg1); // "ERP Gate errors exists on Golden Record"
	} else {
		waitingTask.triggerByID("Waiting_For_ERP_Gating.Proceed", "All good");	
	}
}

function pushNodeFromHandleError(handleErrorTask) {
	if(errors.size() > 0) {
		log("... ... Doing nothing as INT is already in Handle ERP Gating Error");
	} else {
		handleErrorTask.triggerByID("Handle_ERP_Gating_Error.Proceed", "All good");
	}
}

function pushNodeAfterStartingWorkflow(handleGatingErrorInstance) {
	var initTask = handleGatingErrorInstance.getTaskByID("Init");
	if(initTask) {
		initTask.triggerByID("Init.Proceed", msg1); // "ERP Gate errors exists on Golden Record"
	}
	var waitingForFrontGatingTask = handleGatingErrorInstance.getTaskByID("Waiting_For_Front_Gating");
	if(waitingForFrontGatingTask) {
		waitingForFrontGatingTask.triggerByID("Waiting_For_Front_Gating.Proceed", msg2); // "Front Gate errors exists on Golden Record"
	}
	var waitingForERPGatingTask = handleGatingErrorInstance.getTaskByID("Waiting_For_ERP_Gating");
	if(waitingForERPGatingTask) {
		waitingForERPGatingTask.triggerByID("Waiting_For_ERP_Gating.Error", msg1); // "ERP Gate errors exists on Golden Record"
	}
}

function setStatusFlag(goldenRecord, handleGatingErrorInstance) {
	var firstGatingDoneValue = goldenRecord.getValue(firstGatingDoneAttribute.getID()).getID();
	if("Y".equals(firstGatingDoneValue)) {
		var statusFlagOnboarding = manager.getAttributeHome().getAttributeByID("PMDM.AT.StatusFlag").getListOfValues().getListOfValuesValueByID("PMDM.SF.Update").getValue();
		handleGatingErrorInstance.setSimpleVariable('StatusFlag', statusFlagOnboarding);
	} else {
		var statusFlagOnboarding = manager.getAttributeHome().getAttributeByID("PMDM.AT.StatusFlag").getListOfValues().getListOfValuesValueByID("PMDM.SF.Onboarding").getValue();
		handleGatingErrorInstance.setSimpleVariable('StatusFlag', statusFlagOnboarding);
	}
}

function workflowHandling(goldenRecord) {
	log("... ... Handle INT in workflow");
	var internalSourceRecord = getInternalFromGoldenBusinessFunction.evaluate({"node" : goldenRecord});
	if(internalSourceRecord != null) {
		var handleGatingErrorInstance = internalSourceRecord.getWorkflowInstanceByID("PMDM.WF.HandleGatingError");
		if(handleGatingErrorInstance) {
			log("... ... INT is in Handle Gating Error workflow");
			var waitingTask = handleGatingErrorInstance.getTaskByID("Waiting_For_ERP_Gating");
			var handleErrorTask = handleGatingErrorInstance.getTaskByID("Handle_ERP_Gating_Error");
			if(waitingTask) {
				pushNodeFromWaiting(waitingTask);
			} else if(handleErrorTask) {
				pushNodeFromHandleError(handleErrorTask);
			} else {
				log("... ... ... INT is active in Handle Gating Error workflow but is not in Waiting for ERP Gating. Doing nothing.");
			}
		} else {
			if(errors.size() > 0) {
				log("... ... Gating errors found but INT is not active in Handle Gating Error workflow so start in workflow");
				var handleGatingErrorInstance = internalSourceRecord.startWorkflowByID("PMDM.WF.HandleGatingError", msg3); // "Started since ERP Gate errors exist on Golden Record"
				if(handleGatingErrorInstance) {
					log("... ... ... Handle Gating Error workflow started");
					setStatusFlag(goldenRecord, handleGatingErrorInstance);
					pushNodeAfterStartingWorkflow(handleGatingErrorInstance);
				}
			}
		}
	}
}

function handleResult(result) {
	var validationResult = eval('(' + result + ')');
	if(validationResult) {
		if(!validationResult.isValid) {
			var messages = new java.lang.String(validationResult.errorMessage).split("\\n");	
			messages.forEach(
				function (message) {
					log("... ... " + message);					
					errors.add(message);
				}
			);
		}					
	}
}

function gateSimpleMandatory(node, attributeGroup) {
	attributeGroup.getAllAttributes().toArray().forEach(function (attribute) {
		var value = node.getValue(attribute.getID());
		if(value) {
			var simpleValue = value.getSimpleValue();	
			if(!simpleValue) {
				var message = "Missing value in attribute " + attribute.getID();
				log("... ... " + message);
				errors.add(message);
			}
		}
	});		
}

function gateSimpleMandatoryReferences(node, attributeGroup) {	
	attributeGroup.getChildren().toArray().forEach (
		function (attributeGroupChild) {				
			attributeGroupChild.getLinkTypes().toArray().forEach (
				function (referenceType) {					
					if(referenceType instanceof com.stibo.core.domain.ReferenceType) { 
						var references = node.getReferences(referenceType);
						//Check if the node has at least one referece of the type
						if(references.size() > 0) {
							references.toArray().forEach(
								function (reference) {
									attributeGroupChild.getAttributes().toArray().forEach(
										function (attribute) {										
											var target = reference.getTarget();
											var value = target.getValue(attribute.getID());	
											//Check that the reference target has a value for the attribute
											if(value != null) {											
												var simpleValue = value.getSimpleValue();
												if(!simpleValue) {
													// The message is: "{referenceTypeTitle}: Missing value in attribute {attributeID} for referenced target {targetID}"

													// Non-localized syntax:
													// errors.add(referenceType.getTitle() + ": Missing value in attribute " + attribute.getID() + " for referenced target " + target.getID());

													var message = (msg4+"");
													message = message.replace("{referenceTypeTitle}", referenceType.getTitle()); 
													message = message.replace("{attributeID}", attribute.getID()); 
													message = message.replace("{targetID}", target.getID()); 
													errors.add(message);
													
													log("... ... " + referenceType.getTitle() + ": Missing value in attribute " + attribute.getID() + " for referenced target " + target.getID());
												}
											}
										}
									);	
								}
							);
						} else {
							// The message is: "{referenceTypeTitle}: Missing {referenceTypeTitle} reference(s)"

							// Non-localized syntax:
							// errors.add(referenceType.getTitle() + ": Missing " + referenceType.getTitle() + " reference(s)");

							var message = (msg5+"");
							message = message.replace("{referenceTypeTitle}", referenceType.getTitle()); 
							errors.add(message);
							
							log("... ... " + referenceType.getTitle() + ": Missing " + referenceType.getTitle() + " reference(s)");
						}
					} else if(referenceType instanceof com.stibo.core.domain.ClassificationProductLinkType) { 
						var classificationProductLinks = node.getClassificationProductLinks(referenceType);
						//Check if the node has at least one link of the type
						if(classificationProductLinks.size() > 0) {
							//Do nothing
							//A check for a mandatory meta data value on the link etc. can be added here.
						} else {
							// The message is: "{referenceTypeTitle}: Missing {referenceTypeTitle} product to classificatiaon link(s)"

							// Non-localized syntax:
							// errors.add(referenceType.getTitle() + ": Missing " + referenceType.getTitle() + " product to classificatiaon link(s)");

							var message = (msg6+"");
							message = message.replace("{referenceTypeTitle}", referenceType.getTitle()); 
							errors.add(message);

							log("... ... " + referenceType.getTitle() + ": Missing " + referenceType.getTitle() + " product to classificatiaon link(s)");
						}
					}
				}
			);					
		}
	);					
}

function isBlocked(node) {
	var result = false;
	var blockPublishToERPValue = node.getValue(blockPublishToERPAttribute.getID());
	if(blockPublishToERPValue) {
		if("Y".equals(blockPublishToERPValue.getID())) {
			log("... ... Blocked!");
			result = true;				
		}
	}	
	return result;
}

function gateGoldenRecord(node) {
	// Simple mandatory attributes
	gateSimpleMandatory(node, erpGateMandatoryAttributesGroup);

	// Simple mandatory references
	gateSimpleMandatoryReferences(current, erpGateMandatoryReferencesGroup);

	// Complex attribute gating criteria		
	//handleResult(checkBaseUoMBusinessFunction.evaluate({"node" : node}));		
	
	workflowHandling(node);
}

function gateERP(node) {
	log("... Gating Criteria");
	gateGoldenRecord(node);
	log("... End gating Criteria");
}

function gateERPCheckBlocked(node) {
	log("... Checking for force block");
	if(isBlocked(node)) {
		node.getValue(publishToERPAttribute.getID()).setLOVValueByID("N");
		errors.add("Node has been blocked");
	} else {
		log("... ... Not blocked");
		gateERP(node);
	}
	
	var internalSourceRecord = getInternalFromGoldenBusinessFunction.evaluate({"node" : node});
	if(errors.size() > 0) {
		node.getValue(publishToERPAttribute.getID()).setLOVValueByID("N");
		node.getValue(erpGateErrorsAttribute.getID()).setSimpleValue(getErrorsForMultiValue());
		if(internalSourceRecord != null) {
			internalSourceRecord.getValue(erpGateErrorsAttribute.getID()).setSimpleValue(getErrorsForMultiValue());
		}
	} else {
		node.getValue(erpGateErrorsAttribute.getID()).setSimpleValue("");
		if(internalSourceRecord != null) {
			internalSourceRecord.getValue(erpGateErrorsAttribute.getID()).setSimpleValue("");
		}
		var oldValue = node.getValue(publishToERPAttribute.getID()).getID();
		if("Y".equals(oldValue)) {
			erpQueue.republish(node); // make sure it goes to ERP
		} else {
			node.getValue(publishToERPAttribute.getID()).setLOVValueByID("Y");
		}
	}
}

var msg1 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.ERPGate_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "ERP Gate errors exists on Golden Record"
var msg2 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.ERPGate_msg2").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Front Gate errors exists on Golden Record"
var msg3 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.ERPGate_msg3").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Started since ERP Gate errors exist on Golden Record"
var msg4 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.ERPGate_msg4").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "{referenceTypeTitle}: Missing value in attribute {attributeID} for referenced target {targetID}"
var msg5 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.ERPGate_msg5").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "{referenceTypeTitle}: Missing {referenceTypeTitle} reference(s)"
var msg6 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.ERPGate_msg6").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "{referenceTypeTitle}: Missing {referenceTypeTitle} product to classificatiaon link(s)"



log("Gating " + current.getID());
gateERPCheckBlocked(current);
log("Done gating " + current.getID());
}