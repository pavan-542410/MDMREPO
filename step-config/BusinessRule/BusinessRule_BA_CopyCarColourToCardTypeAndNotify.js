/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CopyCarColourToCardTypeAndNotify",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Copy CarColour To CardType And Notify",
  "description" : "Copies CarColour to CardType, clears CarColour, approves the node, and sends an email notification",
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

exports.operation0 = function (node, logger, mailHome) {
  var debug = logger;
  function p(message, debug) {
    if (debug) {
      debug.info(message);
    }
  }

  var sourceAttrId = "CarColour";
  var targetAttrId = "CardType";
  var notificationEmail = "abc@gmail.com";

  p("BA_CopyCarColourToCardTypeAndNotify: Starting execution for node: " + node.getId(), debug);

  var sourceValueObject = node.getValue(sourceAttrId);
  var sourceValue = sourceValueObject.getSimpleValue();
  p("[DEBUG] BA_CopyCarColourToCardTypeAndNotify: " + sourceAttrId + " value = " + sourceValue, debug);

  if (sourceValue !== null && sourceValue !== "") {
    node.getValue(targetAttrId).setSimpleValue(sourceValue);
    p("BA_CopyCarColourToCardTypeAndNotify: Copied [" + sourceValue + "] to " + targetAttrId + ".", debug);
  } else {
    p("BA_CopyCarColourToCardTypeAndNotify: " + sourceAttrId + " is empty, skipping copy.", debug);
  }

  sourceValueObject.deleteCurrent();
  p("BA_CopyCarColourToCardTypeAndNotify: Cleared " + sourceAttrId + ".", debug);

  node.approve();
  p("BA_CopyCarColourToCardTypeAndNotify: Approved node: " + node.getId(), debug);

  try {
    var theMail = mailHome.mail();
    theMail.addTo(notificationEmail);
    theMail.subject("CarColour to CardType update completed");
    theMail.htmlMessage("<p>CarColour values were copied to CardType and the node was approved for node " + node.getId() + ".</p>");
    theMail.send();
    p("BA_CopyCarColourToCardTypeAndNotify: Notification email sent to " + notificationEmail + ".", debug);
  } catch (e) {
    p("BA_CopyCarColourToCardTypeAndNotify: Email send failed - " + e, debug);
  }
};