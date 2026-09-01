/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CopyCameraToCamera1AndNotify",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Copy Camera To Camera1 And Notify",
  "description" : "Copies values from Camera to Camera1, clears Camera, approves the node, and sends a notification email",
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

  var sourceAttrId = "Camera";
  var targetAttrId = "Camera1";
  var notificationEmail = "hbpavan1@gmail.com";

  p("BA_CopyCameraToCamera1AndNotify: Starting execution for node: " + node.getId(), debug);

  var sourceValue = node.getValue(sourceAttrId).getSimpleValue();
  p("[DEBUG] BA_CopyCameraToCamera1AndNotify: " + sourceAttrId + " value = " + sourceValue, debug);

  if (sourceValue !== null && sourceValue !== "") {
    node.getValue(targetAttrId).setSimpleValue(sourceValue);
    node.getValue(sourceAttrId).deleteCurrent();
    p("BA_CopyCameraToCamera1AndNotify: Copied [" + sourceValue + "] to " + targetAttrId + " and cleared " + sourceAttrId + ".", debug);
  } else {
    p("BA_CopyCameraToCamera1AndNotify: " + sourceAttrId + " is empty — skipping copy and clear.", debug);
  }

  node.approve();
  p("BA_CopyCameraToCamera1AndNotify: Approved node: " + node.getId(), debug);

  try {
    var theMail = mailHome.mail();
    theMail.addTo(notificationEmail);
    theMail.subject("Camera attribute update completed");
    theMail.htmlMessage("<p>Camera values were copied to Camera1 for node " + node.getId() + " and the node was approved.</p>");
    theMail.send();
    p("BA_CopyCameraToCamera1AndNotify: Notification email sent to " + notificationEmail + ".", debug);
  } catch (e) {
    p("BA_CopyCameraToCamera1AndNotify: Email send failed - " + e, debug);
  }
};