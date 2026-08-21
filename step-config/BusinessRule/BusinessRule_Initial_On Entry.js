/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "Initial:On Entry",
  "type" : "BusinessAction",
  "setupGroups" : [ "Workflows" ],
  "name" : "Initial:On Entry",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Organizations" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "BulkUpdateTriggerStateFlowEvent",
  "parameters" : [ {
    "id" : "currentStateID",
    "type" : "java.lang.String",
    "value" : "Initiate"
  }, {
    "id" : "eventID",
    "type" : "java.lang.String",
    "value" : "Submit"
  }, {
    "id" : "processNote",
    "type" : "java.lang.String",
    "value" : "Initiate to WF"
  }, {
    "id" : "stateFlowID",
    "type" : "java.lang.String",
    "value" : "wf_Create"
  } ],
  "pluginType" : "Operation"
}
*/
