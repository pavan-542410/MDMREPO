/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.SetNotTranslatingFrench",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Set \"Not Translating\" - French",
  "description" : "This always sets the PMDM.AT.TranslationStatusFrench attribute with a value of \"NOT\" as a baseline value. Called from BuyerReview - OnEntry.",
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
/* This always sets the PMDM.AT.TranslationStatusFrench attribute with a value of "NOT" as a baseline value. Called from BuyerReview - OnEntry. */

var translationStatusValue = node.getValue("PMDM.AT.TranslationStatusFrench");
if (!translationStatusValue.getID()) {
	translationStatusValue.setLOVValueByID("NOT");
}
}