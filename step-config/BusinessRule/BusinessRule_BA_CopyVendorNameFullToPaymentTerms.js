/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CopyVendorNameFullToPaymentTerms",
  "type" : "BusinessAction",
  "setupGroups" : [ "VendorManagement" ],
  "name" : "Copy Vendor Name Full To Payment Terms",
  "description" : "Reads the value from MDM_VendorNamefull and sets it on MDM_PaymentTerms",
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
  var sourceAttrId = "MDM_VendorNamefull";
  var targetAttrId = "MDM_PaymentTerms";

  var sourceValue = node.getValue(sourceAttrId).getSimpleValue();

  if (sourceValue === null || sourceValue === "") {
    logger.info("BA_CopyVendorNameFullToPaymentTerms: " + sourceAttrId + " is empty — skipping.");
    return;
  }

  node.getValue(targetAttrId).setSimpleValue(sourceValue);
  logger.info("BA_CopyVendorNameFullToPaymentTerms: Copied [" + sourceValue + "] from " + sourceAttrId + " to " + targetAttrId + ".");
};
