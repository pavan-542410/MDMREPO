/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BusinessRuleLogging",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "PMDM.BusinessRuleLibraries" ],
  "name" : "Business Rule Logging",
  "description" : "Used to control debug logging for business rules.",
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
const enableGlobalDebugLogging = true;
// Change enableGlobalDebugLogging to false to disable general logging for all business rules.
// Logging from a single business rule can be enabled by setting forceLog = true in the individual business rule,

function log(logger, message, forceLog) {
	if (enableGlobalDebugLogging || forceLog) {
		logger.info(message);
	}
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.enableGlobalDebugLogging = enableGlobalDebugLogging
exports.log = log