/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "Initial_OnEntry",
  "type" : "BusinessAction",
  "setupGroups" : [ "Workflows" ],
  "name" : "Initial: OnEntry",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Office_Object" ],
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
node.getValue("a_Status").setLOVValueByID("002");


node.getWorkflowInstanceByID("wf_OfficeEnrichment").getTaskByID("Initial").triggerLaterByID("Initiate", "Auto submit from Initial State.");

}