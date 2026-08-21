/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.ApproveMasterFromInternal",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Approve Internal Master Product from Internal Source Record",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.InternalSourceRecord" ],
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
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "internalMasterProductObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.InternalMasterProduct",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,manager,internalMasterProductObjectType,logLib) {
var forceLog = false;
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.ApproveInterna_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // 'Parent node has never been approved so "%s" cannot be approved.'
var msg2 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.ApproveInterna_msg2").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // '"{object}" cannot be fully approved because of the following:{exceptions}'

function log(message) {
	logLib.log(logger, "Approve Internal Master Product from Internal Source Record: " + message, forceLog);
}

function approveNode(nodeToApprove) {
	// Check is parent product is approved
	var parent = nodeToApprove.getParent();
	if (parent.getApprovalStatus().name().equals("NotInApproved")) {
		var message = (msg1 + "").replace("%s", nodeToApprove.getName()); // 'Parent node has never been approved so %s cannot be approved.'
		throw(message);
	}
	
	// Approve node cross-context
	var contextsToApprove = ["Context1", "Context2", "Context3"];
	for (var i = 0; i < contextsToApprove.length; i++) {
		var contextToApprove = contextsToApprove[i];
		log("... Will now appove node in context: " + contextToApprove);
		manager.executeInContext(contextToApprove, function(managerInContext){
			var nodeInContext = managerInContext.getObjectFromOtherManager(nodeToApprove);
			var exceptions = nodeInContext.approve();
			if (exceptions.size() > 0) {
				var exceptionString = "";
				for(var i=0; i<exceptions.size(); i++) {
					log(exceptions.get(i));
					//exceptionString = exceptionString + "\n" + exceptions.get(i).getMessage();
					exceptionString = exceptionString + "<br><br>" + exceptions.get(i).getMessage();
				}
				var message = (msg2 + "").replace("{object}", nodeToApprove.getName()).replace("{exceptions}", exceptionString); // '"{object}" cannot be fully approved because of the following:{exceptions}'
				throw(message);
			}
		});
	}
}


// Starts here
log("Approving potential parent master product to node: " + node.getID());

var parentNode = node.getParent();
if (internalMasterProductObjectType.getID().equals(parentNode.getObjectType().getID())) {
	log("Master Product (" + parentNode.getID() + ") was found and will now be approved");
	approveNode(parentNode);	
}

log("Finished approving potential parent master product to node: " + node.getID());
}