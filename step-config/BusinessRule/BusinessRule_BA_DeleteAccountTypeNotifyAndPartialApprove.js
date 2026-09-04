/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DeleteAccountTypeNotifyAndPartialApprove",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Delete AccountType Notify And Partial Approve",
  "description" : "Deletes AccountType, sends email notification, and partially approves AccountType change",
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
  }, {
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/

/**
 * Deletes AccountType, sends an email notification, and partially approves AccountType.
 */
exports.operation0 = function (node, logger, mailHome, partialApproveLib) {
  var debug = logger;

  /**
   * Logs business action execution details through the mandatory logger wrapper.
   */
  function p(message, debugLogger) {
    if (debugLogger) {
      debugLogger.info(message);
    }
  }

  var attrId = "AccountType";
  p("BA_DeleteAccountTypeNotifyAndPartialApprove: Starting execution for node: " + node.getId(), debug);

  node.getValue(attrId).deleteCurrent();
  p("BA_DeleteAccountTypeNotifyAndPartialApprove: Deleted value for attribute: " + attrId, debug);

  try {
    var email = mailHome.mail();
    email.addTo("test@gmail.com");
    email.subject("AccountType deleted for node: " + node.getId());
    email.message("Business Action BA_DeleteAccountTypeNotifyAndPartialApprove deleted AccountType for node " + node.getId() + ".");
    email.send();
    p("BA_DeleteAccountTypeNotifyAndPartialApprove: Notification email sent to test@gmail.com.", debug);
  } catch (e) {
    p("BA_DeleteAccountTypeNotifyAndPartialApprove: Failed to send email: " + e, debug);
  }

  if (partialApproveLib && partialApproveLib.partialApproveFields) {
    partialApproveLib.partialApproveFields(node, [attrId], false, false);
    p("BA_DeleteAccountTypeNotifyAndPartialApprove: Partially approved field " + attrId + " for node: " + node.getId(), debug);
    return;
  }

  p("BA_DeleteAccountTypeNotifyAndPartialApprove: PartialApproveField library unavailable; running standard approve.", debug);
  node.approve();
};