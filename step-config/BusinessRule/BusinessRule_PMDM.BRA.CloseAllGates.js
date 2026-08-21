/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.CloseAllGates",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.GoldenRecordGatingActions" ],
  "name" : "Close All Gates",
  "description" : "Closes all Gates.",
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
    "alias" : "current",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "outboundIntegrationGatesAttributeGroup",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "PMDM.ATG.OutboundIntegrationGates",
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (current,outboundIntegrationGatesAttributeGroup,logger) {
/* Closes all Gates. */
function closeGate(gateAttribute) {
	var value = current.getValue(gateAttribute.getID());
	if(value) {
		value.setLOVValueByID("N");
	}
}

outboundIntegrationGatesAttributeGroup.getAllAttributes().toArray().forEach(closeGate);
}