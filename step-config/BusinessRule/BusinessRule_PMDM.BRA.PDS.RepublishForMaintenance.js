/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.PDS.RepublishForMaintenance",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "PDX: Republish For Maintenance",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.ExternalSourceRecord" ],
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
    "contract" : "BusinessFunctionBindContract",
    "alias" : "getAllPackagingFromExternalBusinessFunction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>PMDM.BF.GetAllPackagingFromExternal</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "maintenanceEventQueue",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.FrontEventQueueImpl",
    "value" : "step://eventqueue?id=PMDM.EQ.PDS.EventQueueMaintenance",
    "description" : null
  }, {
    "contract" : "ClassificationProductLinkTypeBindContract",
    "alias" : "supplierLinkType",
    "parameterClass" : "com.stibo.core.domain.impl.ClassificationProductLinkTypeImpl",
    "value" : "PMDM.P2CLT.SupplierLink",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "maintenanceIDAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.PDS.MaintenanceID",
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
exports.operation0 = function (node,logger,getAllPackagingFromExternalBusinessFunction,maintenanceEventQueue,supplierLinkType,maintenanceIDAttribute,returnMessage) {
function checkMaintenanceID(obj) {
	if (!obj.getValue(maintenanceIDAttribute.getID()).getSimpleValue()) {
		errors.add(obj.getID() + " has no Mainenance ID");
	}
}

function checkSupplierLink(obj) {
	var classificationRefList = obj.getClassificationProductLinks(supplierLinkType);
	if (classificationRefList.size() == 0) {
		errors.add(obj.getID() + " has no Supplier Link");
	}
}

var errors = new java.util.ArrayList();

checkMaintenanceID(node);
checkSupplierLink(node);

var allPackaging = getAllPackagingFromExternalBusinessFunction.evaluate({"node" : node});
allPackaging.toArray().forEach(
	function (packagingObject) {
		checkMaintenanceID(packagingObject);
		checkSupplierLink(packagingObject);
	}
);

if (errors.size() == 0) {
	maintenanceEventQueue.republish(node);
} else {
	var errorMessageText = "";
	errors.toArray().forEach(function (error) {if(errorMessageText) {errorMessageText = errorMessageText + ", ";} errorMessageText = errorMessageText + error;});
	var errorMessage = new returnMessage();
	errorMessage.text = errorMessageText;
	throw errorMessage;	
}

}