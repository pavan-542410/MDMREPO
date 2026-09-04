/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DeleteAGLNAndPartialApprove",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Delete a_GLN And Partial Approve",
  "description" : "Deletes a_GLN attribute value and partially approves the a_GLN change",
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

/**
 * Deletes a_GLN and performs partial approve for that field when possible.
 */
exports.operation0 = function (node, logger, partialApproveLib) {
  var debug = logger;

  /**
   * Routes all BR log output through the mandatory logger wrapper.
   */
  function p(message, debugLogger) {
    if (debugLogger) {
      debugLogger.info(message);
    }
  }

  var attrId = "a_GLN";
  p("BA_DeleteAGLNAndPartialApprove: Starting execution for node: " + node.getId(), debug);

  node.getValue(attrId).deleteCurrent();
  p("BA_DeleteAGLNAndPartialApprove: Deleted value for attribute: " + attrId, debug);

  if (partialApproveLib && partialApproveLib.partialApproveFields) {
    partialApproveLib.partialApproveFields(node, [attrId], false, false);
    p("BA_DeleteAGLNAndPartialApprove: Partially approved field " + attrId + " for node: " + node.getId(), debug);
    return;
  }

  p("BA_DeleteAGLNAndPartialApprove: PartialApproveField library unavailable; running standard approve.", debug);
  node.approve();
};