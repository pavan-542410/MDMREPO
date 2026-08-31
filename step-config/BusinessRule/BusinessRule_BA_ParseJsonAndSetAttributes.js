/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ParseJsonAndSetAttributes",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Parse JSON And Set Attributes",
  "description" : "Parses an incoming JSON string from a bind and sets the key-value pairs as attribute values on the current node",
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
    "contract" : "StringBindContract",
    "alias" : "jsonPayload",
    "parameterClass" : "null",
    "value" : null,
    "description" : "Incoming JSON string containing attribute ID to value mappings"
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node, logger, jsonPayload) {
  var debug = logger;

  if (!node) {
    p("BA_ParseJsonAndSetAttributes: node is null — aborting.", debug);
    return;
  }

  if (!jsonPayload || jsonPayload.trim() === "") {
    p("BA_ParseJsonAndSetAttributes: jsonPayload is empty — aborting.", debug);
    return;
  }

  p("BA_ParseJsonAndSetAttributes: Starting for node: " + node.getId(), debug);
  p("[DEBUG] BA_ParseJsonAndSetAttributes: Raw JSON payload: " + jsonPayload, debug);

  var parsedJson;
  try {
    parsedJson = JSON.parse(jsonPayload);
  } catch (e) {
    p("BA_ParseJsonAndSetAttributes: Failed to parse JSON — " + e.message, debug);
    return;
  }

  var keys = Object.keys(parsedJson);
  p("[DEBUG] BA_ParseJsonAndSetAttributes: Found " + keys.length + " attribute(s) in payload.", debug);

  for (var i = 0; i < keys.length; i++) {
    var attrId = keys[i];
    var attrValue = parsedJson[attrId];

    if (attrValue === null || attrValue === undefined) {
      p("[DEBUG] BA_ParseJsonAndSetAttributes: Skipping null/undefined value for attribute: " + attrId, debug);
      continue;
    }

    try {
      node.getValue(attrId).setSimpleValue(String(attrValue));
      p("BA_ParseJsonAndSetAttributes: Set [" + attrId + "] = [" + attrValue + "] on node: " + node.getId(), debug);
    } catch (e) {
      p("BA_ParseJsonAndSetAttributes: Failed to set attribute [" + attrId + "] — " + e.message, debug);
    }
  }

  p("BA_ParseJsonAndSetAttributes: Completed for node: " + node.getId(), debug);

  function p(message, debug) {
    if (debug) {
      debug.info(message);
    }
  }
};
