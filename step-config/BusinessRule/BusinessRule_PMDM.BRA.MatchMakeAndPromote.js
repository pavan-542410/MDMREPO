/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.MatchMakeAndPromote",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Match, Make and Promote",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.ExternalSourceRecord", "PMDM.PRD.InternalSourceRecord" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "TriggerAndApproveNewParts",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "ReferenceOtherBABusinessAction",
  "parameters" : [ {
    "id" : "ReferencedBA",
    "type" : "com.stibo.core.domain.businessrule.BusinessAction",
    "value" : "PMDM.BRA.CalculateRankingForPromotion"
  } ],
  "pluginType" : "Operation"
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
