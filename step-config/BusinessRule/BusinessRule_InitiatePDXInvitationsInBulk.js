/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "InitiatePDXInvitationsInBulk",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Initiate PDX Invitations In Bulk",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "SupplierClassification" ],
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
    "contract" : "AttributeBindContract",
    "alias" : "pdxClientIDAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXClientID",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "pdxInvitationEmailAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXInvitationEmail",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "pdxInvitationNameAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXInvitationName",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "initiatePDXInvitationsInBulkEventQueue",
    "parameterClass" : "com.stibo.core.domain.impl.eventprocessor.EventProcessorImpl",
    "value" : "step://eventprocessor?id=InitiatePDXInvitationsInBulk",
    "description" : null
  } ],
  "messages" : [ {
    "variable" : "returnMessage",
    "message" : "{text}",
    "translations" : [ ]
  } ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,pdxClientIDAttribute,pdxInvitationEmailAttribute,pdxInvitationNameAttribute,initiatePDXInvitationsInBulkEventQueue,returnMessage) {
function getSimpleValue(product, attributeID) {
	var value = product.getValue(attributeID);
	if (value) {
		return value.getSimpleValue();
	}
	return null;
}

function checkIfAlreadyLinked(supplier) {
	var pdxClientID = getSimpleValue(node, pdxClientIDAttribute.getID());
	if (pdxClientID) {
		errors.add(supplier.getName() + " is already linked to PDX Account so no invitation will be generated");
		return true;
	}
	return false;
}

function checkEmailAndName(supplier) {
	var pdxInvitationEmail = getSimpleValue(node, pdxInvitationEmailAttribute.getID());
	var pdxInvitationName = getSimpleValue(node, pdxInvitationNameAttribute.getID());
	if (!pdxInvitationEmail || !pdxInvitationName) {
		errors.add(supplier.getName() + " has no recepient information so no invitation will be generated");
	}
}

var errors = new java.util.ArrayList();

var isLinked = checkIfAlreadyLinked(node);
if (!isLinked) {
	checkEmailAndName(node);
}

if (errors.size() == 0) {
	initiatePDXInvitationsInBulkEventQueue.republish(node);
} else {
	var errorMessageText = "";
	errors.toArray().forEach(function (error) {if(errorMessageText) {errorMessageText = errorMessageText + ", ";} errorMessageText = errorMessageText + error;});
	var errorMessage = new returnMessage();
	errorMessage.text = errorMessageText;
	throw errorMessage;	
}

}