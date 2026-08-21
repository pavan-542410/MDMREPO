/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "InitiatePDXInvitationSupplier",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Initiate PDX Invitation Supplier",
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
    "contract" : "GatewayBinding",
    "alias" : "gateway",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.gateway.FrontGatewayIntegrationEndpointImpl",
    "value" : "PDXChannelAccountGateway",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "pdxChannelAccountUsers",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "PDXChannelAccountUsers",
    "description" : null
  }, {
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "EntityBindContract",
    "alias" : "configurationEntity",
    "parameterClass" : "com.stibo.core.domain.impl.entity.FrontEntityImpl$$Generated$$28",
    "value" : "ConfigurationObject",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "emailReceiverAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXInvitationEmail",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "emailReceiverNameAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXInvitationName",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "emailFromAddressAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXInvitationFromAddress",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "emailSubjectAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXInvitationSubject",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "emailHeadingAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXInvitationHeading",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "emailBodyAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXInvitationBody",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "emailFooterAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PDXInvitationFooter",
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
    "contract" : "BusinessFunctionBindContract",
    "alias" : "passwordGeneratorBusinessFunction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>PasswordGenerator</BusinessFunction>\n</BusinessFunctionReference>\n",
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
exports.operation0 = function (node,logger,manager,gateway,pdxChannelAccountUsers,mailHome,configurationEntity,emailReceiverAttribute,emailReceiverNameAttribute,emailFromAddressAttribute,emailSubjectAttribute,emailHeadingAttribute,emailBodyAttribute,emailFooterAttribute,pdxInvitationsAttribute,pdxClientIDAttribute,passwordGeneratorBusinessFunction,returnMessage,logLib) {
var forceLog = false;

// Get message strings from translatable system message entities
var msg1 = "Cannot start PDX Invitation Flow";
var msg1Entity = manager.getEntityHome().getEntityByID("SysMsg_InitiatePDXInvitation_msg1");
if (msg1Entity) {
	msg1 = msg1Entity.getValue("PMDM.AT.SystemMessage").getSimpleValue();
}

var msg2 = "The Supplier Account must have a name";
var msg2Entity = manager.getEntityHome().getEntityByID("SysMsg_InitiatePDXInvitation_msg2");
if (msg2Entity) {
	msg2 = msg2Entity.getValue("PMDM.AT.SystemMessage").getSimpleValue();
}

var msg3 = "'%s' must have a value";
var msg3Entity = manager.getEntityHome().getEntityByID("SysMsg_InitiatePDXInvitation_msg3");
if (msg3Entity) {
	msg3 = msg3Entity.getValue("PMDM.AT.SystemMessage").getSimpleValue();
}

var msg4 = "The Supplier Account is already linked to a PDX Client";
var msg4Entity = manager.getEntityHome().getEntityByID("SysMsg_InitiatePDXInvitation_msg4");
if (msg4Entity) {
	msg4 = msg4Entity.getValue("PMDM.AT.SystemMessage").getSimpleValue();
}

var msg5 = "PDX Invitation";
var msg5Entity = manager.getEntityHome().getEntityByID("SysMsg_InitiatePDXInvitation_msg5");
if (msg5Entity) {
	msg5 = msg5Entity.getValue("PMDM.AT.SystemMessage").getSimpleValue();
}

var msg6 = "PDX Invitation was successfully initiated";
var msg6Entity = manager.getEntityHome().getEntityByID("SysMsg_InitiatePDXInvitation_msg6");
if (msg6Entity) {
	msg6 = msg6Entity.getValue("PMDM.AT.SystemMessage").getSimpleValue();
}

function log(message) {
	logLib.log(logger, "Initiate PDX invitation: " + message, forceLog);
}

function checkAlreadyLinked() {
	var pdxClientID = node.getValue(pdxClientIDAttribute.getID()).getSimpleValue();
	return pdxClientID !== null;
}

function checkMissingValues() {
	var missingValues = false;
	var suggestedChannelAccountIdentifier = node.getName();
	if (suggestedChannelAccountIdentifier === null) {
		//dataIssuesReport.addError(msg2, node);
		throw msg2;
		missingValues = true;
	}
	var pdxInvitationEmail = node.getValue(emailReceiverAttribute.getID()).getSimpleValue();
	if (pdxInvitationEmail === null) {
		var message = String(msg3).replace("%s", emailReceiverAttribute.getName());
		//dataIssuesReport.addError(message, node, emailReceiverAttribute);
		throw emailReceiverAttribute.getName() + " must have a value";
		missingValues = true;
	}
	var pdxInvitationName = node.getValue(emailReceiverNameAttribute.getID()).getSimpleValue();
	if (pdxInvitationName === null) {
		var message = String(msg3).replace("%s", emailReceiverNameAttribute.getName());
		//dataIssuesReport.addError(message, node, emailReceiverNameAttribute);
		throw emailReceiverNameAttribute.getName() + " must have a value";
		missingValues = true;
	}
	return missingValues;
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

function startInvitationFlowInPDX(userID, password) {
	// Build request body
	var requestJSON = {};
	requestJSON.channelAccount = String(node.getName());
	requestJSON.email = String(node.getValue(emailReceiverAttribute.getID()).getSimpleValue());
	requestJSON.credentials = {};
	requestJSON.credentials.user = String(userID);
	requestJSON.credentials.password = String(password);
	requestJSON.credentials.supplierId = String(node.getID());
	var requestBody = JSON.stringify(requestJSON);
	
	// Build request
	var request = gateway
		.post()
		.pathElements("invitation")
		.bodyContentType("application/json;charset=UTF-8")
		.body(requestBody);
	
	// Invoke request
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
				//var errorMessage = new returnMessage();
				//errorMessage.text = "<b>" + msg1 + "</b>\n" + "Error from PDX: " + body + " (" + statusCode + ")";
				//throw errorMessage;	
				throw msg1 + "\n" + "Error from PDX: " + body + " (" + statusCode + ")";
			} else if (e.javaException instanceof com.stibo.gateway.rest.RESTGatewayStatusCodeException) {
				var statusCode = e.javaException.getHttpStatusCode();
				log("... RESTGatewayStatusCodeException - statusCode: " + statusCode + " - message: " + javaExceptionMessage);
				//var errorMessage = new returnMessage();
				//errorMessage.text = "<b>" + msg1 + "</b>\n" + "Error from PDX: " + javaExceptionMessage + " (" + statusCode + ")";
				//throw errorMessage;
				throw msg1 + "\n" + "Error from PDX: " + javaExceptionMessage + " (" + statusCode + ")";
			} else if (e.javaException instanceof com.stibo.gateway.rest.RESTGatewayIOException) {
				log("... RESTGatewayIOException - message: " + javaExceptionMessage);
				//var errorMessage = new returnMessage();
				//errorMessage.text = "<b>" + msg1 + "</b>\n" + javaExceptionMessage;
				//throw errorMessage;
				throw msg1 + "\n" + javaExceptionMessage;
			} else {
				throw (e);
			}
		} else {
			throw (e);		
		}
	}
	return response;
}

function storeInvitationDetails(invitationExpirationDate) {
	var formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
	var creationDateLocalDateTime = java.time.LocalDateTime.now();
	var creationDate = creationDateLocalDateTime.format(formatter);
	var expirationDateZoned = new java.time.ZonedDateTime.parse(invitationExpirationDate).withZoneSameInstant(java.time.ZoneId.systemDefault());
	var expirationDate = expirationDateZoned.format(formatter);
	log("creationDate: " + creationDate);
	log("invitationExpirationDate: " + invitationExpirationDate);
	log("expirationDate: " + expirationDate);
	
	var invitationJSON = {};
	invitationJSON.id = invitationID;
	invitationJSON.url = invitationURL;
	invitationJSON.expirationDate = String(expirationDate);
	invitationJSON.creationDate = String(creationDate);
	invitationJSON.status = "Sent";
	invitationJSON.error = "";
	invitationJSON.channelAccountUserID = String(userID);
	invitationJSON.channelAccount = String(node.getName());
	invitationJSON.clientID = "";
	invitationJSON.email = String(node.getValue(emailReceiverAttribute.getID()).getSimpleValue());

	//var newInvitation = JSON.stringify(invitationJSON);
	var newInvitation = JSON.stringify(invitationJSON, Object.keys(invitationJSON).sort());
	log("newInvitation: " + newInvitation);
	node.getValue(pdxInvitationsAttribute.getID()).addValue(newInvitation);
}

function createBody(body, url) {
	var emailRecipientName = node.getValue(emailReceiverNameAttribute.getID()).getSimpleValue();
	if (emailRecipientName) {
		body = body.replaceAll("\\{EmailReceiverName\}", emailRecipientName);	
	}
	body = body.replaceAll("<gt/>", ">");
	body = body.replaceAll("<lt/>", "<");
	body = body.replaceAll("\n", "<br>");
	if (url) {
		body = body.replaceAll("\\{InvitationURL\}", '<a href="' + url + '">Link</a>');
	}
	var htmlBody = "<html>" + body + "</html>";
	return htmlBody;
}

function sendEmail(url) {
	var emailFromAddress = configurationEntity.getValue(emailFromAddressAttribute.getID()).getSimpleValue();
	var emailSubject = configurationEntity.getValue(emailSubjectAttribute.getID()).getSimpleValue();
	var emailHeading = configurationEntity.getValue(emailHeadingAttribute.getID()).getSimpleValue();
	var emailBodyRaw = configurationEntity.getValue(emailBodyAttribute.getID()).getSimpleValue();
	var emailFooter = configurationEntity.getValue(emailFooterAttribute.getID()).getSimpleValue();

	log('Building email');
	var email = node.getValue(emailReceiverAttribute.getID()).getSimpleValue();

	var theMail = mailHome.mail();
	theMail.addTo(email);
	theMail.from(emailFromAddress);
	theMail.subject(emailSubject);

	var emailBody = createBody(emailBodyRaw, url);

	var HTMLTemplate = manager.getAssetHome().getAssetByID("EmailTemplate");
	var outputStream = new java.io.ByteArrayOutputStream();
	HTMLTemplate.download(outputStream);

	var htmlBody = outputStream.toString("UTF-8");
	htmlBody = htmlBody.replaceAll("!HEADING!", emailHeading);
	htmlBody = htmlBody.replaceAll("!TEXTBODY!", emailBody);
	htmlBody = htmlBody.replaceAll("!FOOTER!", emailFooter);

	htmlBody = htmlBody.replaceAll("<bold>", "<strong>");
	htmlBody = htmlBody.replaceAll("</bold>", "</strong>");
	htmlBody = htmlBody.replaceAll("<italic>", "<p>");
	htmlBody = htmlBody.replaceAll("</italic>", "</p>");
	htmlBody = htmlBody.replaceAll("®", "&reg;");
	theMail.htmlMessage(htmlBody);

	try {
		theMail.send();
	} catch (e) {
		log("--- ERROR ---");
		log(e);
		//we ignore that mails cannot be sent...	
	}
}

function setDeadlineOfTask(workflow, state, date) {
	var task = node.getTaskByID(workflow, state);
	if (task) {
		task.setDeadline(date);
		log("... deadline set to " + date);
	}
}

function workflowHandling(invitationExpirationDate) {
	log("Workflow handling");
	var workflowID = "PDXInvitationHandling";
	var erroredInvitationsStateID = "Errored_Invitations";
	var expiredInvitationsStateID = "Expired_Invitations";
	var handledInvitationsStateID = "Handled_Invitations";
	var openInvitationsStateID = "Open_Invitations";

	var expirationDateInstant = new java.time.Instant.parse(invitationExpirationDate);
	var expirationDateLocalDateTime = java.time.LocalDateTime.ofInstant(expirationDateInstant, java.time.ZoneId.systemDefault());
	var expirationDateForDeadline = java.sql.Timestamp.valueOf(expirationDateLocalDateTime);
	log("expirationDateForDeadline: " + expirationDateForDeadline);

	if (node.isInState(workflowID, erroredInvitationsStateID)) {
		log("Node is in Errored Invitations state. Transition to Open Invitations and set deadline.");
		var task = node.getTaskByID(workflowID, erroredInvitationsStateID);
		task.triggerByID("Errored_Invitations.ToStart", "New invitation initiated");
		setDeadlineOfTask(workflowID, openInvitationsStateID, expirationDateForDeadline);
	}

	if (node.isInState(workflowID, expiredInvitationsStateID)) {
		log("Node is in Expired Invitations state. Transition to Open Invitations and set deadline.");
		var task = node.getTaskByID(workflowID, expiredInvitationsStateID);
		task.triggerByID("Expired_Invitations.ToStart", "New invitation initiated");
		setDeadlineOfTask(workflowID, openInvitationsStateID, expirationDateForDeadline);
	} 

	if (node.isInState(workflowID, handledInvitationsStateID)) {
		log("Node is in Handled Invitations state. Transition to Open Invitations and set deadline.");
		var task = node.getTaskByID(workflowID, handledInvitationsStateID);
		task.triggerByID("Handled_Invitations.ToStart", "New invitation initiated");
		setDeadlineOfTask(workflowID, openInvitationsStateID, expirationDateForDeadline);
	} 

	if (!node.isInWorkflow(workflowID)) {
		log("Not in workflow. Initiate in workflow and set deadline.");
		var instance = node.startWorkflowByID(workflowID, "Initiated in workflow");
		setDeadlineOfTask(workflowID, openInvitationsStateID, expirationDateForDeadline);
	}
}

///////
// MAIN
///////

log("Check if already linked");
var alreadyLinked = checkAlreadyLinked();
if (alreadyLinked) {
	//dataIssuesReport.addIssuesReportHeader(msg1);
	//dataIssuesReport.addError(msg4, node, pdxClientIDAttribute);
	//return dataIssuesReport;
	throw msg4;
}

log("Check for missing values");
var missingValues = checkMissingValues();
if (missingValues) {
	// checkMissingValues is throwing error so this is not needed
	//dataIssuesReport.addIssuesReportHeader(msg1);
	//return dataIssuesReport;
}

log("Create new PDX Channel Account user");
var userID = java.util.UUID.randomUUID().toString().toUpperCase();
var password = passwordGeneratorBusinessFunction.evaluate({"length" : 16});
var user = pdxChannelAccountUsers.createUser(userID, password, "");
user.setName(node.getName());

log("Start invitation flow in PDX");
var response = startInvitationFlowInPDX(userID, password);
if (response) {
	var responseJSON = JSON.parse(response);
	var invitationID = responseJSON.invitationId;
	var invitationURL = responseJSON.invitationUrl;
	var invitationExpirationDate = responseJSON.expirationDate;

	log("Store Invitation Details");
	storeInvitationDetails(invitationExpirationDate);
	
	log("Send PDX Invitation email");
	sendEmail(invitationURL);
	
	log("Workflow handling - Proceed workflow task");
	workflowHandling(invitationExpirationDate);
}
}