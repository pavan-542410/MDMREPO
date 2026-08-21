/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "AssetAnalyzer.SetAssetKeywords",
  "type" : "BusinessAction",
  "setupGroups" : [ "AssetAnalyzer.SetupGroup" ],
  "name" : "Set Asset Keywords",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "SetAssetKeywordsBusinessAction",
  "parameters" : [ {
    "id" : "ScoreThreshold",
    "type" : "java.lang.Integer",
    "value" : null
  }, {
    "id" : "AssetReferenceTypes",
    "type" : "java.util.List",
    "values" : [ ]
  }, {
    "id" : "AssetTypes",
    "type" : "java.util.List",
    "values" : [ ]
  } ],
  "pluginType" : "Operation"
}
*/
