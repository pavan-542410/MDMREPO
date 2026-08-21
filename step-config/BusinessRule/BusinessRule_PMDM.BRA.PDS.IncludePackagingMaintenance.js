/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.PDS.IncludePackagingMaintenance",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "PDX: Include Packaging In Maintenance",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.Case", "PMDM.PRD.ExternalSourceRecord", "PMDM.PRD.Pack", "PMDM.PRD.Pallet" ],
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
    "contract" : "CurrentEventQueueBinding",
    "alias" : "currentEventQueue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "externalSourceRecordObejctType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.ExternalSourceRecord",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "maintenanceEventType",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "Maintenance",
    "description" : null
  }, {
    "contract" : "CurrentEventTypeBinding",
    "alias" : "currentEventType",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ClassificationProductLinkTypeBindContract",
    "alias" : "supplierLinkType",
    "parameterClass" : "com.stibo.core.domain.impl.ClassificationProductLinkTypeImpl",
    "value" : "PMDM.P2CLT.SupplierLink",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,getAllPackagingFromExternalBusinessFunction,currentEventQueue,externalSourceRecordObejctType,maintenanceEventType,currentEventType,supplierLinkType) {
function isExternalSourceRecord() {
	if (externalSourceRecordObejctType.getID().equals(node.getObjectType().getID())) {
		return true;
	}
	return false;	
}

function hasSupplierLink() {
	var classificationRefList = node.getClassificationProductLinks(supplierLinkType);
	if (classificationRefList.size() > 0) {
		return true;
	}
	return false;	
}
// Generate derived event on EXT's with existing supplier link
if (currentEventType instanceof com.stibo.core.domain.eventqueue.BasicEventType) {
	if (isExternalSourceRecord() && hasSupplierLink()) {
		currentEventQueue.queueDerivedEvent(maintenanceEventType, node);

		// Generate derived event on packaging for included EXT
		var allPackaging = getAllPackagingFromExternalBusinessFunction.evaluate({"node" : node});
		allPackaging.toArray().forEach(
			function (packagingObject) {
				currentEventQueue.queueDerivedEvent(maintenanceEventType, packagingObject);
			}
		);
	}
}
}