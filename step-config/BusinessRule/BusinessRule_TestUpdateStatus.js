/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "TestUpdateStatus",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Update Status",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "TestCombos", "TestDish" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "SetAttributeValueBusinessAction",
  "parameters" : [ {
    "id" : "FromAttribute",
    "type" : "com.stibo.core.domain.Attribute",
    "value" : null
  }, {
    "id" : "FromWorkflow",
    "type" : "com.stibo.core.domain.state.unstable.stateflow.StateFlow",
    "value" : null
  }, {
    "id" : "FromWorkflowVariableName",
    "type" : "java.lang.String",
    "value" : ""
  }, {
    "id" : "TextValue",
    "type" : "java.lang.String",
    "value" : "Available"
  }, {
    "id" : "ToAttribute",
    "type" : "com.stibo.core.domain.Attribute",
    "value" : "Status"
  } ],
  "pluginType" : "Operation"
}
*/
