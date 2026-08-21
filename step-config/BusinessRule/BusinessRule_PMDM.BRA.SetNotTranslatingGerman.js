/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.SetNotTranslatingGerman",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Set \"Not Translating\" - German",
  "description" : "This always sets the PMDM.AT.TranslationStatusGerman attribute with a value of \"NOT\" as a baseline value. Called from BuyerReview - OnEntry.",
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
/* This always sets the PMDM.AT.TranslationStatusGerman attribute with a value of "NOT" as a baseline value. Called from BuyerReview - OnEntry. */

var translationStatusValue = node.getValue("PMDM.AT.TranslationStatusGerman");
if (!translationStatusValue.getID()) {
	translationStatusValue.setLOVValueByID("NOT");
}
}