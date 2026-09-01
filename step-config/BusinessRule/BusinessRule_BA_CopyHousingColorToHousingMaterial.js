/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CopyHousingColorToHousingMaterial",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Copy Housing Color To Housing Material",
  "description" : "Copies Housing Color to Housing Material, clears Housing Color, and partially approves the node",
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

  var sourceAttrId = "HousingColor";
  var targetAttrId = "HousingMaterial";

  p("BA_CopyHousingColorToHousingMaterial: Starting execution for node: " + node.getId(), debug);

  var sourceValue = node.getValue(sourceAttrId).getSimpleValue();
  p("[DEBUG] BA_CopyHousingColorToHousingMaterial: " + sourceAttrId + " value = " + sourceValue, debug);

  if (sourceValue === null || sourceValue === "") {
    p("BA_CopyHousingColorToHousingMaterial: " + sourceAttrId + " is empty — approving without changes.", debug);
    node.approve();
    return;
  }

  node.getValue(targetAttrId).setSimpleValue(sourceValue);
  node.getValue(sourceAttrId).deleteCurrent();
  p("BA_CopyHousingColorToHousingMaterial: Copied [" + sourceValue + "] to " + targetAttrId + " and cleared " + sourceAttrId + ".", debug);

  node.approve();
  p("BA_CopyHousingColorToHousingMaterial: Partial approve completed for node: " + node.getId(), debug);
};