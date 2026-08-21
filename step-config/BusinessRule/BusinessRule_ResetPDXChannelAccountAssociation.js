/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "ResetPDXChannelAccountAssociation",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Reset PDX Channel Account Association",
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
    "contract" : "WebUiContextBind",
    "alias" : "web",
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,manager,web,pdxClientIDAttribute,pdxChannelAccountIdentifierAttribute,pdxChannelAccountUserAttribute,channelAccountUserGroup,channelAccountUserGroupInactive,logLib) {
var forceLog = false;

var msg1 = "The PDX Channel Account Association has been reset";
var msg1Entity = manager.getEntityHome().getEntityByID("SysMsg_ResetPDXChanAccAssociation_msg1");
if (msg1Entity) {
	msg1 = msg1Entity.getValue("PMDM.AT.SystemMessage").getSimpleValue();
}

function log(message) {
	logLib.log(logger, "Reset PDX Channel Account Association: " + message, forceLog);
}

function getSimpleValue(product, attributeID) {
	var value = product.getValue(attributeID);
	if (value) {
		return value.getSimpleValue();
	}
	return null;
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

node.getValue(pdxClientIDAttribute.getID()).deleteCurrent();
node.getValue(pdxChannelAccountIdentifierAttribute.getID()).deleteCurrent();

var pdxChannelAccountUserID = getSimpleValue(node, pdxChannelAccountUserAttribute.getID());
moveUserToInactive(pdxChannelAccountUserID);
node.getValue(pdxChannelAccountUserAttribute.getID()).deleteCurrent();

web.showAlert("WARNING", msg1);
}