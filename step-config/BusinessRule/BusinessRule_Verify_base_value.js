/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "Verify_base_value",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Verify_base_value",
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
var requiredRAM = 4; 
 
var ramObj = node.getValue("RAM");
var ramValStr = ramObj ? ramObj.getSimpleValue() : "";
 
var ramNumber = parseInt(ramValStr);  

if (ramNumber >= requiredRAM) {
    logger.info("Moved to Approve because RAM is " + ramNumber + "GB");
} else {
    logger.info("Moved to Enrich because RAM is " + ramNumber + "GB");
}
}