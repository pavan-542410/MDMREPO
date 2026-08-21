/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.MatchMakeAndPromoteFromMP",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Match, Make and Promote from Internal Master Product",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.InternalMasterProduct" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "TriggerAndApproveNewParts",
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
    "parameterClass" : "com.stibo.core.domain.impl.eventprocessor.EventProcessorImpl",
    "value" : "step://eventprocessor?id=PMDM.EP.ProductOnboarding",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,eventQueue) {
node.queryChildren().forEach(
	function(child) {
		eventQueue.republish(child);
		return true;
	}
);

}