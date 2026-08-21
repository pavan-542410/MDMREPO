/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PDXInvitationUpdateHandler",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "PDX Invitation Update Handler",
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "InboundBusinessProcessorImporterSourceBindContract",
    "alias" : "inboundMessage",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "InboundBusinessProcessorExecutionReportLoggerBindContract",
    "alias" : "executionReportLogger",
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
    "alias" : "pdxInvitationsAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXInvitations",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "channelAccountUserGroup",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "PDXChannelAccountUsers",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "channelAccountUserGroupInactive",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "PDXChannelAccountUsersInactive",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "pdxClientIDAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXClientID",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "pdxChannelAccountIdentifierAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXChannelAccountIdentifier",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "pdxChannelAccountUserAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXChannelAccountUser",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,inboundMessage,executionReportLogger,logger,pdxInvitationsAttribute,channelAccountUserGroup,channelAccountUserGroupInactive,pdxClientIDAttribute,pdxChannelAccountIdentifierAttribute,pdxChannelAccountUserAttribute,logLib) {
var forceLog = false;

function log(message) {
	logLib.log(logger, "PDX Invitation Update Receiver: " + message, forceLog);
}

function getSimpleValue(product, attributeID) {
	var value = product.getValue(attributeID);
	if (value) {
		return value.getSimpleValue();
	}
	return null;
}

function setValue(node, attributeId, value, isMandatory) {
	log("setValue - node: " + node.getID() + ", attributeId: " + attributeId + ", value: " + value);
	executionReportLogger.logInfo("Value of " + attributeId + " set to: " + value);
	try {
		node.getValue(attributeId).setSimpleValue(value);
	} catch (e) {
		if (e.javaException instanceof com.stibo.core.domain.ValidatorException) {
			var message = "Could not set value '" + value + "' for attribute with ID '" + attributeId + "' on node with ID '" + node.getID() + "': " + e.javaException.getMessage();
			if (isMandatory) {
				throw new java.lang.RuntimeException(message);
			} else {
				log(message);
				executionReportLogger.logWarning(message);
			}
		} else {
			throw(e);
		}
	}
}

function moveUserToInactive(userID) {
	if (userID) {			
		var user = manager.getUserHome().getUserByID(userID);
		if (user) {
			log("... user: " + user.getID() + " found");
			channelAccountUserGroupInactive.addUser(user);
			log("... user linked to " + channelAccountUserGroupInactive.getID());
			if (channelAccountUserGroup.isMember(user)) {
				channelAccountUserGroup.removeUser(user);					
				log("... user unlinked from " + channelAccountUserGroup.getID());
			}
		}
	}
}

// ############
// ### MAIN ###
// ############
executionReportLogger.logInfo("Callback being processed");

var callbackMessage = JSON.parse(inboundMessage.getMessage());
var callbackMessageSupplierClassificationID = callbackMessage.supplierClassificationId;
log("callbackMessageSupplierClassificationID: " + callbackMessageSupplierClassificationID);
executionReportLogger.logInfo("Callback content - Supplier Account ID: " + callbackMessageSupplierClassificationID);

if (!callbackMessageSupplierClassificationID) {
	throw new java.lang.RuntimeException("No Supplier Account ID. This is a required field.");
}

var supplierClassfication = manager.getClassificationHome().getClassificationByID(callbackMessageSupplierClassificationID);
if (supplierClassfication) {
	executionReportLogger.logInfo("Supplier Account found: " + supplierClassfication.getName());

	var callbackMessageClientID = callbackMessage.clientId;
	var callbackMessageInvitationUserID = callbackMessage.userId;
	var callbackMessageChannelAccount = callbackMessage.channelAccount;
	var callbackMessageStatus = callbackMessage.status;
	var callbackMessageError = callbackMessage.error;
	
	executionReportLogger.logInfo("Callback content - PDX Client ID: " + callbackMessageClientID);
	executionReportLogger.logInfo("Callback content - Channel Account User ID: " + callbackMessageInvitationUserID);
	executionReportLogger.logInfo("Callback content - Channel Account Name: " + callbackMessageChannelAccount);
	executionReportLogger.logInfo("Callback content - Invitation Status: " + callbackMessageStatus);
	if (callbackMessageError) {
		executionReportLogger.logInfo("Callback content - Invitation Error: " + callbackMessageError);
	}

	var invitationHandled = false;
	var newerOpenInvitation = false;
	var alreadyLinked = false;

	// Check if Supplier is already linked to a PDX client
	var pdxClientID = getSimpleValue(supplierClassfication, pdxClientIDAttribute.getID());
	var pdxChannelAccountIdentifier = getSimpleValue(supplierClassfication, pdxChannelAccountIdentifierAttribute.getID());
	var pdxChannelAccountUser = getSimpleValue(supplierClassfication, pdxChannelAccountUserAttribute.getID());
	if (pdxClientID || pdxChannelAccountIdentifier || pdxChannelAccountUser) {
		log("Supplier Account is already linked to a PDX Client!");
		executionReportLogger.logInfo("Supplier Account is already linked to a PDX Client");
		alreadyLinked = true;
	}

	var invitationValues = supplierClassfication.getValue(pdxInvitationsAttribute.getID()).getValues();
	for (var i = 0; i < invitationValues.size(); i++) {
		var invitationValue = invitationValues.get(i).getSimpleValue();
		var invitationJSON = JSON.parse(invitationValue);
		var invitationID = invitationJSON.id;
		var invitationUserID = invitationJSON.channelAccountUserID;
		var invitationStatus = invitationJSON.status;
		var invitationError = invitationJSON.error
		
		if (callbackMessageInvitationUserID && callbackMessageInvitationUserID.equals(invitationUserID)) {
			log("Invitation with User ID " + invitationUserID + " found");
			executionReportLogger.logInfo("Invitation with User ID " + invitationUserID + " found");

			invitationHandled = true;
			var invitationUpdated = false;

			if ("Success".equals(callbackMessageStatus) && alreadyLinked) {
				invitationJSON.status = "Error";
				invitationJSON.error = "Supplier linked to multiple channel accounts";
				invitationUpdated = true;
				executionReportLogger.logInfo("Status changed and error added as supplier is linked to multiple channel accounts");
			} else {
				if (callbackMessageStatus && !invitationStatus.equals(callbackMessageStatus)) {
					invitationJSON.status = callbackMessageStatus;
					invitationUpdated = true;
				} 
				if (callbackMessageError && !invitationError.equals(callbackMessageError)) {
					invitationJSON.error = callbackMessageError;
					invitationUpdated = true;
				}
			}
			var invitationChannelAccount = invitationJSON.channelAccount;
			if (callbackMessageChannelAccount && !invitationChannelAccount.equals(callbackMessageChannelAccount)) {
				invitationJSON.channelAccount = callbackMessageChannelAccount;
				invitationUpdated = true;
			}
			var invitationClientID = invitationJSON.clientID
			if (callbackMessageClientID && !invitationClientID.equals(callbackMessageClientID)) {
				invitationJSON.clientID = callbackMessageClientID;
				invitationUpdated = true;
			}
			
			// Update invitation if changed
			if (invitationUpdated) {
				var updatedinvitationJSON = JSON.stringify(invitationJSON);
				invitationValues.get(i).setSimpleValue(updatedinvitationJSON);
				executionReportLogger.logInfo("Invitation details has been updated");
			}
		} else if (invitationHandled && "Sent".equals(invitationStatus)) {
			log("Newer open invitation with ID " + invitationID + " found");
			executionReportLogger.logInfo("Newer open invitation with ID " + invitationID + " found");
			newerOpenInvitation = true;
			break;
		}
	}

	// Workflow handling
	var workflowID = "PDXInvitationHandling";
	var openInvitationsStateID = "Open_Invitations";
	
	if ("Success".equals(callbackMessageStatus) && !"Success".equals(invitationStatus)) { // If existing status is already Success then don't do anything
		log("Status: Success - Workflow handling");
		executionReportLogger.logInfo("Status: Success - Workflow handling");
		if (!newerOpenInvitation && supplierClassfication.isInState(workflowID, openInvitationsStateID)) {
			var task = supplierClassfication.getTaskByID(workflowID, openInvitationsStateID);
			if (alreadyLinked) {
				task.triggerByID("Open_Invitations.Errored", "Supplier Account is already linked to a PDX Client");
				moveUserToInactive(invitationUserID);
				executionReportLogger.logInfo("Workflow has been forwarded to 'Errored Invitations' as Supplier Account is already linked to a PDX Client and no newer open invitation exists");
			} else {
				task.triggerByID("Open_Invitations.Accepted", "Invitation was accepted");
				executionReportLogger.logInfo("Workflow has been forwarded to 'Accepted Invitations' as no newer open invitation exists");
			}
		} else if (!newerOpenInvitation && !supplierClassfication.isInWorkflow(workflowID) && alreadyLinked) { // Errror handling if 
			log("Already linked but not in workflow");
			var instance = supplierClassfication.startWorkflowByID(workflowID, "Initiated in workflow");
			if (instance) {
				var task = instance.getTaskByID(openInvitationsStateID);
				task.triggerByID("Open_Invitations.Errored", "Invitation errored");
				moveUserToInactive(invitationUserID);
				executionReportLogger.logInfo("Workflow has been forwarded to 'Errored Invitations' as Supplier Account is already linked to a PDX Client and no newer open invitation exists");
			}			
		}

		if (!alreadyLinked) {
			executionReportLogger.logInfo("PDX Client has been linked to Supplier so set PDX relevant values on Supplier Account");
			setValue(supplierClassfication, pdxClientIDAttribute.getID(), callbackMessageClientID, false);
			setValue(supplierClassfication, pdxChannelAccountIdentifierAttribute.getID(), callbackMessageChannelAccount, false);
			setValue(supplierClassfication, pdxChannelAccountUserAttribute.getID(), callbackMessageInvitationUserID, false);
		}
	}

	if ("Error".equals(callbackMessageStatus)) {
		log("Status: Error - Workflow handling");
		executionReportLogger.logInfo("Status: Error - Workflow handling");
		moveUserToInactive(invitationUserID);
		executionReportLogger.logInfo("Channel Account user has been made inactive");

		if (!newerOpenInvitation && supplierClassfication.isInState(workflowID, openInvitationsStateID)) {
			var task = supplierClassfication.getTaskByID(workflowID, openInvitationsStateID);
			task.triggerByID("Open_Invitations.Errored", "Invitation errored");
			executionReportLogger.logInfo("Error received from PDX so workflow has been forwarded to 'Errored Invitations'");
		} else if (!newerOpenInvitation && !supplierClassfication.isInWorkflow(workflowID)) {
			log("Errored but not in workflow");
			var instance = supplierClassfication.startWorkflowByID(workflowID, "Initiated in workflow");
			if (instance) {
				var task = instance.getTaskByID(openInvitationsStateID);
				task.triggerByID("Open_Invitations.Errored", "Invitation errored");
				executionReportLogger.logInfo("Error received from PDX so workflow has been forwarded to 'Errored Invitations'");
			}
		}
	}
} else {
	throw new java.lang.RuntimeException("Supplier Classification doesn't exist.");
}

executionReportLogger.logInfo("Processing done");
}