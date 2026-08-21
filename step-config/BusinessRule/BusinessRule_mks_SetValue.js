/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "mks_SetValue",
  "type" : "BusinessAction",
  "setupGroups" : [ "mks_Actions" ],
  "name" : "mks_SetValue",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "mks_PrimaryRoot", "mks_SecondaryRoot", "mks_Sku" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger) {
var value = node.getValue("mks_SText").getSimpleValue();

if (value == null || value.trim() == "") {
    node.getValue("mks_SText").setSimpleValue("Default Value");
    logger.info("mks_SText was empty and has been updated.");
} else {
    throw "A value has already been assigned to the attribute mks_SText. Please review the existing value before running this action again.";
}
}