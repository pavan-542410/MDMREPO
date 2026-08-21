/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.StartTranslation_enUS_deDE",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Start Translation (en-US to de-DE)",
  "description" : "Starts the Translation workflow.",
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
  "pluginId" : "StartTranslationAction",
  "parameters" : [ {
    "id" : "AsyncConfiguration",
    "type" : "java.lang.String",
    "value" : "PMDM.ASC.TranslationService"
  }, {
    "id" : "BusinessFunctionProxy",
    "type" : "com.stibo.integration.asynctranslation.impl.businessaction.StartTranslationAction$TranslationBusinessFunctionProxy",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionProxy>\n  <Mappings/>\n</BusinessFunctionProxy>\n"
  }, {
    "id" : "IncludeSuperType",
    "type" : "java.lang.String",
    "value" : "Products"
  }, {
    "id" : "JobCompleteBusinessAction",
    "type" : "com.stibo.core.domain.businessrule.BusinessAction",
    "value" : "PMDM.BRA.TranslationCompleted_enUS_deDE"
  }, {
    "id" : "JobFailureBusinessAction",
    "type" : "com.stibo.core.domain.businessrule.BusinessAction",
    "value" : "PMDM.BRA.TranslationFailure_enUS_deDE"
  }, {
    "id" : "Node",
    "type" : "com.stibo.core.domain.Node",
    "value" : null
  }, {
    "id" : "ObjectTypes",
    "type" : "java.util.List",
    "values" : [ ]
  }, {
    "id" : "RefreshCollection",
    "type" : "java.lang.Boolean",
    "value" : "false"
  }, {
    "id" : "TranslationConfiguration",
    "type" : "java.lang.String",
    "value" : "English to German"
  } ],
  "pluginType" : "Operation"
}
*/
