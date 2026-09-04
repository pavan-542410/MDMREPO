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
  "description" : "Copies CarColour to CardType, clears CarColour, approves the node, and sends an approval email",
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
  var sourceValue = node.getValue(sourceAttrId).getSimpleValue();

  p("BA_CopyCarColourToCardTypeAndNotify: Starting execution for node: " + node.getId(), debug);

  if (sourceValue !== null && sourceValue !== "") {
    node.getValue(targetAttrId).setSimpleValue(sourceValue);
    node.getValue(sourceAttrId).deleteCurrent();
    p("BA_CopyCarColourToCardTypeAndNotify: Copied value to " + targetAttrId + " and cleared " + sourceAttrId + ".", debug);
  } else {
    p("BA_CopyCarColourToCardTypeAndNotify: Source attribute is empty; skipping copy and delete.", debug);
  }

  node.approve();
  p("BA_CopyCarColourToCardTypeAndNotify: Node approved for node: " + node.getId(), debug);

  try {
    var email = mailHome.mail();
    email.addTo("abc@gmail.com");
    email.subject("Node approved: " + node.getId());
    email.message("Node " + node.getId() + " was approved by BA_CopyCarColourToCardTypeAndNotify.");
    email.send();
    p("BA_CopyCarColourToCardTypeAndNotify: Approval email sent to abc@gmail.com.", debug);
  } catch (e) {
    p("BA_CopyCarColourToCardTypeAndNotify: Email send failed: " + e, debug);
  }
};