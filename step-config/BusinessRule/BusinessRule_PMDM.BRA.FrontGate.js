/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.FrontGate",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.GoldenRecordGatingActions" ],
  "name" : "Front Gate",
  "description" : "Checks Mandatory Attributes (PMDM.ATG.FrontGateMandatoryAttributes).  Checks Mandatory References and Links (PMDM.ATG.FrontGateMandatoryReferences).",
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
    "alias" : "frontGateErrorsAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.FrontGateErrors",
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
    "alias" : "publishToEcommerceAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.PublishToEcommerce",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "blockPublishToEcommerceAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.BlockPublishToEcommerce",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "frontGateMandatoryAttributesGroup",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "PMDM.ATG.FrontGateMandatoryAttributes",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "frontGateMandatoryReferencesGroup",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "PMDM.ATG.FrontGateMandatoryReferences",
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
    "contract" : "ObjectTypeBindContract",
    "alias" : "goldenRecordObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.GoldenRecord",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "firstGatingDoneAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.FirstGatingDone",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "matchingMessagesAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.MatchingMessages",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (current,logger,frontGateErrorsAttribute,publishToERPAttribute,blockPublishToERPAttribute,publishToEcommerceAttribute,blockPublishToEcommerceAttribute,frontGateMandatoryAttributesGroup,frontGateMandatoryReferencesGroup,manager,getInternalFromGoldenBusinessFunction,goldenRecordObjectType,firstGatingDoneAttribute,matchingMessagesAttribute,logLib) {
/* Checks Mandatory Attributes (PMDM.ATG.FrontGateMandatoryAttributes).  Checks Mandatory References and Links  (PMDM.ATG.FrontGateMandatoryReferences). */
var forceLog = false;
var errors = new java.util.ArrayList();

function log(message) {
	logLib.log(logger, "Front Gate: " + message, forceLog);
}

function getErrorsForMultiValue() {
	var result = "";
	errors.toArray().forEach(function (error) {if(result) {result = result + "<multisep/>";} result = result + error;});
	return result;
}

function pushNodeFromWaiting(waitingTask) {
	if(errors.size() > 0) {
		waitingTask.triggerByID("Waiting_For_Front_Gating.Error", msg1); // "Front Gate errors exists on Golden Record"
	} else {
		waitingTask.triggerByID("Waiting_For_Front_Gating.Proceed", msg2); // "All good"	
	}
}

function pushNodeFromHandleError(handleErrorTask) {
	if(errors.size() > 0) {
		log("... ... Doing nothing as INT is already in Handle Front Gating Error");
	} else {
		handleErrorTask.triggerByID("Handle_Front_Gating_Error.Proceed", msg2); // "All good"
	}
}

function pushNodeAfterStartingWorkflow(handleGatingErrorInstance) {
	var initTask = handleGatingErrorInstance.getTaskByID("Init");
	if(initTask) {
		initTask.triggerByID("Init.Proceed", msg1); // "Front Gate errors exists on Golden Record"
	}
	var waitingForFrontGatingTask = handleGatingErrorInstance.getTaskByID("Waiting_For_Front_Gating");
	if(waitingForFrontGatingTask) {
		waitingForFrontGatingTask.triggerByID("Waiting_For_Front_Gating.Error", msg1); // "Front Gate errors exists on Golden Record"
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
			var waitingTask = handleGatingErrorInstance.getTaskByID("Waiting_For_Front_Gating");
			var handleErrorTask = handleGatingErrorInstance.getTaskByID("Handle_Front_Gating_Error");
			if(waitingTask) {
				pushNodeFromWaiting(waitingTask);
			} else if(handleErrorTask) {
				pushNodeFromHandleError(handleErrorTask);
			} else {
				log("... ... ... INT is active in Handle Gating Error workflow but is not in Waiting for Front Gating. Doing nothing.");
			}
		} else {
			if(errors.size() > 0) {
				log("... ... Gating errors found but INT is not active in a workflow so start in Handle Gating Error");
				var handleGatingErrorInstance = internalSourceRecord.startWorkflowByID("PMDM.WF.HandleGatingError", msg3); // "Started since Front Gate errors exist on Golden Record"
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
													message = message.replace("{attributeID}", attribute.getID() ); 
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
							// The message is: "{referenceTypeTitle}: Missing {referenceTypeTitle}: product to classificatiaon link(s)"
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

function gateMatchingMessages(node, matchingMessagesAttribute) {
	var matchingMessagesValues = node.getValue(matchingMessagesAttribute.getID()).getValues();
	for (var i = 0; i < matchingMessagesValues.size(); i++) {
		var matchingMessagesValue = matchingMessagesValues.get(i).getSimpleValue();
		log("... ... matchingMessagesValue: " + matchingMessagesValue);
		errors.add(matchingMessagesValue);
	}
}

function isBlocked(node) {
	var result = false;
	var blockPublishToERPValue = node.getValue(blockPublishToERPAttribute.getID());
	var blockPublishToEcommerceValue = node.getValue(blockPublishToEcommerceAttribute.getID());
	if(blockPublishToERPValue && blockPublishToEcommerceValue) {
		if("Y".equals(blockPublishToERPValue.getID()) && "Y".equals(blockPublishToEcommerceValue.getID())) {
			log("... ... Blocked!");
			result = true;				
		}
	}	
	return result;
}

function gateGoldenRecord(node) {

	//  Check for matching messages (split, merge and orphan INT)
	gateMatchingMessages(node, matchingMessagesAttribute)
	
	// Simple mandatory attributes
	gateSimpleMandatory(node, frontGateMandatoryAttributesGroup);

	// Simple mandatory references
	gateSimpleMandatoryReferences(current, frontGateMandatoryReferencesGroup);

	// Complex attribute gating criteria		
	//handleResult(checkBaseUoMBusinessFunction.evaluate({"node" : node}));		

	workflowHandling(node);
}

function gate(node) {
	log("... Gating Criteria");
	gateGoldenRecord(node);
	log("... End gating Criteria");
}

function passFrontGate(current) {
	log("Passing front gate");
	var frontGateTask = current.getTaskByID("PMDM.WF.GoldenRecordGating", "Front_Gate");
	if(frontGateTask) {
		frontGateTask.triggerLaterByID("Open", msg7); // "Passing front gate"
	}
}

function closeAllGates(current) {
	log("Closing all gates");
	var frontGateTask = current.getTaskByID("PMDM.WF.GoldenRecordGating", "Front_Gate");
	if(frontGateTask) {
		frontGateTask.triggerLaterByID("AllGatesClosed", msg8); // "Closing all gates"
	}
}

function gateCheckBlocked(node) {
	log("... Checking for force block");
	if(isBlocked(node)) {
		errors.add(msg9); // "Node has been blocked"
	} else {
		log("... ... Not blocked");
		gate(node);
	}

	var internalSourceRecord = getInternalFromGoldenBusinessFunction.evaluate({"node" : node});
	if(errors.size() > 0) {
		node.getValue(frontGateErrorsAttribute.getID()).setSimpleValue(getErrorsForMultiValue());
		if(internalSourceRecord != null) {
			internalSourceRecord.getValue(frontGateErrorsAttribute.getID()).setSimpleValue(getErrorsForMultiValue());
		}
		closeAllGates(node);
	} else {
		node.getValue(frontGateErrorsAttribute.getID()).setSimpleValue("");
		if(internalSourceRecord != null) {
			internalSourceRecord.getValue(frontGateErrorsAttribute.getID()).setSimpleValue("");
		}
		passFrontGate(node);
	}
}
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.FrontGate_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Front Gate errors exists on Golden Record"
var msg2 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.FrontGate_msg2").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "All good" 
var msg3 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.FrontGate_msg3").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Started since Front Gate errors exist on Golden Record"
var msg4 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.FrontGate_msg4").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "{referenceTypeTitle}: Missing value in attribute {attributeID} for referenced target {targetID}"
var msg5 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.FrontGate_msg5").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "{referenceTypeTitle}: Missing {referenceTypeTitle} reference(s)"
var msg6 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.FrontGate_msg6").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "{referenceTypeTitle}: Missing {referenceTypeTitle}: product to classificatiaon link(s)"
var msg7 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.FrontGate_msg7").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Passing front gate"
var msg8 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.FrontGate_msg8").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Closing all gates"
var msg9 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.FrontGate_msg9").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Node has been blocked"

log("Gating " + current.getID());
gateCheckBlocked(current);
log("Done gating " + current.getID());
}