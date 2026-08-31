/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CopyDLNToTestRecord",
  "type" : "BusinessAction",
  "setupGroups" : [ "VendorManagement" ],
  "name" : "Copy DLN To Test Record",
  "description" : "Reads the value from a_DLN and sets it on a_TestRecord",
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

exports.operation0 = function (node, logger) {
  var debug = logger;

  function p(message, debug) {
    if (debug) {
      debug.info(message);
    }
  }

  var sourceAttrId = "a_DLN";
  var targetAttrId = "a_TestRecord";

  p("BA_CopyDLNToTestRecord: Starting execution for node: " + node.getId(), debug);

  var sourceValue = node.getValue(sourceAttrId).getSimpleValue();
  p("[DEBUG] BA_CopyDLNToTestRecord: " + sourceAttrId + " value = " + sourceValue, debug);

  if (sourceValue === null || sourceValue === "") {
    p("BA_CopyDLNToTestRecord: " + sourceAttrId + " is empty — skipping.", debug);
    return;
  }

  node.getValue(targetAttrId).setSimpleValue(sourceValue);
  p("BA_CopyDLNToTestRecord: Copied [" + sourceValue + "] from " + sourceAttrId + " to " + targetAttrId + ".", debug);
};
