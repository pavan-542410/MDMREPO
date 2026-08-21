/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "CheckRAMValue",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "CheckRAMValue",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "ProductVariant" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
// Get the product object
var ramAttr = node.getValue("RAM").getSimpleValue();   
//
//logger.info(ramAttr);


if (!ramAttr || ramAttr.trim() === "") {
	logger.info("RAM is null");
    node.getValue("RAM").setSimpleValue("32GB");
} else {
	logger.info("RAM is not null");
}

logger.info(node.getValue("RAM").getSimpleValue());
 
// Move to the next workflow state (Review) by firing the workflow event
//triggerWorkflowEvent("SUBMIT");
}