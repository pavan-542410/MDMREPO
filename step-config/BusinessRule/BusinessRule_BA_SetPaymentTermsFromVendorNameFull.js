/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetPaymentTermsFromVendorNameFull",
  "type" : "BusinessAction",
  "setupGroups" : [ "VendorManagement" ],
  "name" : "Set Payment Terms From Vendor Name Full",
  "description" : "Reads the value from MDM_VendorNameFull and sets it on MDM_PaymentTerms",
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

function log(severity, message) {
  if (severity === "ERROR" || severity === "WARNING") { logger.warning(message); }
  else                                                { logger.info(message); }
}

exports.operation0 = function (node, logger) {
  var sourceAttrId = "MDM_VendorNameFull";
  var targetAttrId = "MDM_PaymentTerms";

  var sourceValue = node.getValue(sourceAttrId).getSimpleValue();

  if (sourceValue === null || sourceValue === "") {
    log("WARNING", "BA_SetPaymentTermsFromVendorNameFull: " + sourceAttrId + " is empty — skipping.");
    return;
  }

  node.getValue(targetAttrId).setSimpleValue(sourceValue);
  log("INFO", "BA_SetPaymentTermsFromVendorNameFull: Copied [" + sourceValue + "] from " + sourceAttrId + " to " + targetAttrId + ".");
};
