/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.TranslationCompleted_enUS_deDE",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Translation Completed (en-US to de-DE)",
  "description" : null,
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
var task = node.getTaskByID("PMDM.WF.Translation", "GermanTranslationService");
if (task){
	task.triggerByID("GermanTranslationService.Proceed", "Auto-progressed");
}

}