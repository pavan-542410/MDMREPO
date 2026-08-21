/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.StartInternalWF",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Start Internal WF",
  "description" : "Starts the Internal Source Record Creation workflow.",
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.InternalSourceRecord" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "BulkUpdateInitiateMultipleItemsInWorkflow",
  "parameters" : [ {
    "id" : "processNote",
    "type" : "java.lang.String",
    "value" : "Workflow started."
  }, {
    "id" : "stateFlowID",
    "type" : "java.lang.String",
    "value" : "PMDM.WF.InternalSourceRecordCreation"
  } ],
  "pluginType" : "Operation"
}
*/

/*===== business rule plugin definition =====
{
  "pluginId" : "OrBusinessCondition",
  "parameters" : [ {
    "id" : "BusinessConditions",
    "type" : "java.util.List",
    "values" : [ ]
  }, {
    "id" : "BusinessConditionsBooleans",
    "type" : "java.util.List",
    "values" : [ "false", "false", "false" ]
  }, {
    "id" : "ReturnMessage",
    "type" : "java.lang.String",
    "value" : "Translation was not started because no target language was specififed.  Please indicate \"Yes\" in at least one of the \"Translate to _?\" attributes and then try again."
  } ],
  "pluginType" : "Precondition"
}
*/
