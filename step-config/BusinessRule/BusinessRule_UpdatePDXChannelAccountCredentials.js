/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "UpdatePDXChannelAccountCredentials",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Update PDX Channel Account Credentials",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "SupplierClassification" ],
  "allObjectTypesValid" : false,
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
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssuesReport",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "GatewayBinding",
    "alias" : "gateway",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.gateway.FrontGatewayIntegrationEndpointImpl",
    "value" : "PDXChannelAccountGateway",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "pdxInvitationsAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXInvitations",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "pdxClientIDAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXClientID",
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "web",
    "parameterClass" : "null",
    "value" : null,
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
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "userID",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">UserID</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">a_user_id</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "userPassword",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">userPassword</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">b_user_password</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
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
exports.operation0 = function (node,logger,manager,dataIssuesReport,gateway,pdxInvitationsAttribute,pdxClientIDAttribute,web,channelAccountUserGroup,channelAccountUserGroupInactive,pdxChannelAccountIdentifierAttribute,pdxChannelAccountUserAttribute,userID,userPassword,returnMessage,logLib) {
var forceLog = false;

var msg1 = "Update PDX Channel Account Credentials";
var msg1Entity = manager.getEntityHome().getEntityByID("SysMsg_UpdatePDXChanAccCredentials_msg1");
if (msg1Entity) {
	msg1 = msg1Entity.getValue("PMDM.AT.SystemMessage").getSimpleValue();
}

var msg2 = "The Supplier Classification is not linked to a PDX Client";
var msg2Entity = manager.getEntityHome().getEntityByID("SysMsg_UpdatePDXChanAccCredentials_msg2");
if (msg2Entity) {
	msg2 = msg2Entity.getValue("PMDM.AT.SystemMessage").getSimpleValue();
}

var msg3 = "PDX Channel Account Credentials sucessfully updated";
var msg3Entity = manager.getEntityHome().getEntityByID("SysMsg_UpdatePDXChanAccCredentials_msg3");
if (msg3Entity) {
	msg3 = msg3Entity.getValue("PMDM.AT.SystemMessage").getSimpleValue();
}

var msg4 = "A user ID must be provided";
var msg4Entity = manager.getEntityHome().getEntityByID("SysMsg_UpdatePDXChanAccCredentials_msg4");
if (msg4Entity) {
	msg4 = msg4Entity.getValue("PMDM.AT.SystemMessage").getSimpleValue();
}

var msg5 = "A password must be provided";
var msg5Entity = manager.getEntityHome().getEntityByID("SysMsg_UpdatePDXChanAccCredentials_msg5");
if (msg5Entity) {
	msg5 = msg5Entity.getValue("PMDM.AT.SystemMessage").getSimpleValue();
}

var msg6 = "No user exists with the provided user ID";
var msg6Entity = manager.getEntityHome().getEntityByID("SysMsg_UpdatePDXChanAccCredentials_msg6");
if (msg6Entity) {
	msg6 = msg6Entity.getValue("PMDM.AT.SystemMessage").getSimpleValue();
}

function log(message) {
	logLib.log(logger, "Update PDX channel account credentials: " + message, forceLog);
}

function getSimpleValue(product, attributeID) {
	var value = product.getValue(attributeID);
	if (value) {
		return value.getSimpleValue();
	}
	return null;
}

function checkAlreadyLinked() {
	var pdxClientID = getSimpleValue(node, pdxClientIDAttribute.getID());
	if (pdxClientID === null) {
		return false;
	}
	
	var pdxChannelAccountIdentifier = getSimpleValue(node, pdxChannelAccountIdentifierAttribute.getID());
	if (pdxChannelAccountIdentifier === null) {
		return false;
	}
	
	var pdxChannelAccountUser = getSimpleValue(node, pdxChannelAccountUserAttribute.getID());
	if (pdxChannelAccountUser === null) {
		return false;
	}
	return true;
}

function parseMessage(msg) {
	try {  
		var msgJSON = JSON.parse(msg);  
		var errorMessage = msgJSON.message;
		if (errorMessage) {
			return errorMessage;
		} else {
			return msg;
		}
	} catch (e) {  
		return msg;
	}
}

function moveUserToInactive(userID) {
	log("... user to move: " + userID);
	if (userID) {			
		var user = manager.getUserHome().getUserByID(userID);
		if (user) {
			log("... user found");
			channelAccountUserGroupInactive.addUser(user);
			log("... user linked to " + channelAccountUserGroupInactive.getID());
			if (channelAccountUserGroup.isMember(user)) {
				channelAccountUserGroup.removeUser(user);					
				log("... user unlinked from " + channelAccountUserGroup.getID());
			}
		}
	}
}


///////
// MAIN
///////

// Sanity checks
var showError = false;
if(userID === null) {
	dataIssuesReport.addError(msg4);
	showError = true;
}

if(userPassword === null){
	dataIssuesReport.addError(msg5);
	showError = true;
}

if (userID) {
	var user = manager.getUserHome().getUserByID(userID);
	if (!user) {
		dataIssuesReport.addError(msg6);
		showError = true;	
	}
}

var alreadyLinked = checkAlreadyLinked();
if (!alreadyLinked) {
	log("No linked PDX Channel Account found");
	dataIssuesReport.addError(msg2, node, pdxClientIDAttribute);
	showError = true;
}

if (showError) {
	dataIssuesReport.addIssuesReportHeader(msg1);
	return dataIssuesReport;
}

log("Get existing PDX Channel Account user");
var existingUserID = getSimpleValue(node, pdxChannelAccountUserAttribute.getID());

log("Update channel account credentials in PDX");

// Create request body
var pdxChannelAccountIdentifier = getSimpleValue(node, pdxChannelAccountIdentifierAttribute.getID());
var supplierClassificationID = node.getID();

var requestJSON = {};
requestJSON.channelAccount = String(pdxChannelAccountIdentifier);
requestJSON.credentials = {};
requestJSON.credentials.user = String(userID);
requestJSON.credentials.password = String(userPassword);
requestJSON.credentials.supplierId = String(supplierClassificationID);
var requestBody = JSON.stringify(requestJSON);
log("requestBody: " + requestBody); // Remove logging to not logout password...!

// Build request
var pdxClientID = getSimpleValue(node, pdxClientIDAttribute.getID());
var request = gateway
	.put()
	.pathElements("client", pdxClientID, "channelAccount", "credentials")
	.bodyContentType("application/json;charset=UTF-8")
	.body(requestBody);

// Send request
try {
	var response = request.invoke();
	log("Response: " + response);
} catch (e) {
	if (e.javaException instanceof com.stibo.gateway.rest.RESTGatewayException) {
		var javaExceptionMessage = e.javaException.getMessage();
		if (e.javaException instanceof com.stibo.gateway.rest.exception.RESTGatewayStatusCodeWithBodyException) {
			var body = parseMessage(e.javaException.getBody());
			var statusCode = e.javaException.getHttpStatusCode();
			log("... RESTGatewayStatusCodeWithBodyException - statusCode: " + statusCode + " - body: " + body + " - message: " + javaExceptionMessage);
			var errorMessage = new returnMessage();
			errorMessage.text = body + " (" + statusCode + ")";
			throw errorMessage;	
		} else if (e.javaException instanceof com.stibo.gateway.rest.RESTGatewayStatusCodeException) {
			var statusCode = e.javaException.getHttpStatusCode();
			log("... RESTGatewayStatusCodeException - statusCode: " + statusCode + " - message: " + javaExceptionMessage);
			var errorMessage = new returnMessage();
			errorMessage.text = javaExceptionMessage + " (" + statusCode + ")";
			throw errorMessage;	
		} else if (e.javaException instanceof com.stibo.gateway.rest.RESTGatewayIOException) {
			log("... RESTGatewayIOException - message: " + javaExceptionMessage);
			var errorMessage = new returnMessage();
			errorMessage.text = javaExceptionMessage;
			throw errorMessage;	
		} else {
			throw (e);
		}
	} else {
		throw (e);		
	}
}

// Credentials updated so store new user ID and move old user to inactive
log("Store new user ID and move existing user");
log("set value of " + pdxChannelAccountUserAttribute.getID() + " to " + user.getID());
node.getValue(pdxChannelAccountUserAttribute.getID()).setSimpleValue(user.getID());
moveUserToInactive(existingUserID);

web.showAlert("ACKNOWLEDGMENT", msg3);

}