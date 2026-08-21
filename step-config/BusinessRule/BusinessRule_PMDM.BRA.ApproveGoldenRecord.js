/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.ApproveGoldenRecord",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Approve Golden Record",
  "description" : "Approves the Golden Record.",
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.GoldenRecord" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BusinessRuleLogging",
    "libraryAlias" : "logLib"
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,manager,logLib) {
var forceLog = false;

function log(message) {
	logLib.log(logger, "Approve Node and Packaging: " + message, forceLog);
}

function approveNode(node) {
  log("Will now approve: " + node.getID());
  try{
    node.approve();
  } catch(e){
    log(e);
    throw(e);
  }
}

// Starts here
log("Approving node: " + node.getID() + " cross-context");
var contextsToApprove = ["Context1", "Context2", "Context3"];
for (var i = 0; i < contextsToApprove.length; i++) {
	var contextToApprove = contextsToApprove[i];
	log("contextToApprove: " + contextToApprove);
	manager.executeInContext(contextToApprove, function(managerInContext){
		var nodeInContext = managerInContext.getObjectFromOtherManager(node);
		approveNode(nodeInContext);
	});
}
log("Finished approving node: " + node.getID() +  " cross-context");
}