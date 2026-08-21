/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.RepublishEventForMatching",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Republish Event For Matching",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.ExternalSourceRecord", "PMDM.PRD.InternalSourceRecord" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "RepublishEventQueueOperation",
  "parameters" : [ {
    "id" : "HasEventQueue",
    "type" : "com.stibo.core.domain.haseventqueue.HasEventQueue",
    "value" : "step://eventprocessor?id=PMDM.EP.ProductOnboarding"
  } ],
  "pluginType" : "Operation"
}
*/
