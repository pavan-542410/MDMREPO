/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DeleteAccountTypeAndPartialApprove",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Delete AccountType And Partial Approve",
  "description" : "Deletes AccountType attribute value and partially approves only the AccountType change",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "PartialApproveField",
    "libraryAlias" : "partialApproveLib"
  } ]
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

exports.operation0 = function (node, logger, partialApproveLib) {
  var debug = logger;
  var attrId = "AccountType";

  function p(message, debugLogger) {
    if (debugLogger) {
      debugLogger.info(message);
    }
  }

  p("BA_DeleteAccountTypeAndPartialApprove: Starting execution for node: " + node.getId(), debug);

  node.getValue(attrId).deleteCurrent();
  p("BA_DeleteAccountTypeAndPartialApprove: Deleted value for attribute: " + attrId, debug);

  if (partialApproveLib && partialApproveLib.partialApproveFields) {
    partialApproveLib.partialApproveFields(node, [attrId], false, false);
    p("BA_DeleteAccountTypeAndPartialApprove: Partially approved AccountType change for node: " + node.getId(), debug);
    return;
  }

  p("BA_DeleteAccountTypeAndPartialApprove: PartialApproveField library unavailable; running standard approve.", debug);
  node.approve();
};