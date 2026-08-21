/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.PDS.QueueEvent.Returned",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "PDX: Queue Event - Returned",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
    "contract" : "EventQueueBinding",
    "alias" : "eventQueue",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.FrontEventQueueImpl",
    "value" : "step://eventqueue?id=PMDM.EQ.PDS.EventQueue",
    "description" : null
  }, {
    "contract" : "BusinessFunctionBindContract",
    "alias" : "getAllPackagingFromExternalBusinessFunction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>PMDM.BF.GetAllPackagingFromExternal</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,eventQueue,getAllPackagingFromExternalBusinessFunction) {
function setStatusAndRepublish(node) {
	node.getValue("PMDM.AT.PDS.WorkflowEvent").setLOVValueByID("PDS_RETURNED");
	eventQueue.republish(node);
}

setStatusAndRepublish(node);

var allPackaging = getAllPackagingFromExternalBusinessFunction.evaluate({"node" : node});
allPackaging.toArray().forEach(
	function (packagingObject) {
		setStatusAndRepublish(packagingObject);
	}
);
}