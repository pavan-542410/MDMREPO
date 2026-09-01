/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_AddressLine1WordLimit",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "AddressLine1 Word Limit Condition",
  "description" : "Validates that AddressLine1 does not exceed 30 words.",
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
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
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

/**
 * Validate AddressLine1 against a 30-word limit.
 * @param {*} node STEP current object bind.
 * @param {*} logger STEP logger bind.
 * @returns {boolean|string} true when valid, otherwise an error string.
 */
exports.operation0 = function (node, logger) {
  var debug = logger;

  function p(message, debug) {
    if (debug) {
      debug.info(message);
    }
  }

  var attrId = "AddressLine1";
  var maxWords = 30;
  var rawValue = node.getValue(attrId).getSimpleValue();

  p("BC_AddressLine1WordLimit: Starting execution for node: " + node.getId(), debug);
  p("[DEBUG] BC_AddressLine1WordLimit: Raw AddressLine1 value = " + rawValue, debug);

  if (rawValue === null) {
    return true;
  }

  var normalizedValue = String(rawValue).trim();
  if (normalizedValue === "") {
    return true;
  }

  var words = normalizedValue.split(/\s+/);
  var wordCount = words.length;

  p("[DEBUG] BC_AddressLine1WordLimit: Word count = " + wordCount, debug);

  if (wordCount > maxWords) {
    var errorMessage = "AddressLine1 must not exceed 30 words.";
    p("BC_AddressLine1WordLimit: Validation failed. " + errorMessage, debug);
    return errorMessage;
  }

  return true;
};