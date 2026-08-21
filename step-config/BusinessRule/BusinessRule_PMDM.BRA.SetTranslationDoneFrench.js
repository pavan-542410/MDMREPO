/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.SetTranslationDoneFrench",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Set \"Translation Done\" - French",
  "description" : "Sets the value of the PMDM.AT.TranslationStatusFrench attribute to \"DONE\".",
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.InternalMasterProduct", "PMDM.PRD.InternalSourceRecord" ],
  "allObjectTypesValid" : false,
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
/* Sets the value of the PMDM.AT.TranslationStatusFrench attribute to "DONE" */

node.getValue("PMDM.AT.TranslationStatusFrench").setLOVValueByID("DONE");
}