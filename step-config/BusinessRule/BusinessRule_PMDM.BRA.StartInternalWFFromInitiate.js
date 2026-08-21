/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.StartInternalWFFromInitiate",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Start Internal WF from Initiate",
  "description" : "Starts the Internal Source Record Creation workflow.",
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.ExternalSourceRecord" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "web",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,web) {
// System Messages are stored on entities, for localization purpose.
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_ProductStartedinWorkflow").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // 'Product started in workflow'
var msg2 = manager.getEntityHome().getEntityByID("SysMsg_NavigatingToWorkflowScreen").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // Navigating to workflow screen

var workflowID = "PMDM.WF.InternalSourceRecordCreation";
var buyerReviewStateID = "Buyer_Review";
var forwardScreenID = "Forwarding Switch Screen";

var workflow = manager.getWorkflowHome().getWorkflowByID(workflowID);

// check to see if EXT is already in workflow
var inWorkflow = node.getWorkflowInstanceByID(workflowID);
if (!inWorkflow){
	// not in workflow - initiate
	workflow.start(node, null);
	web.showAlert("ACKNOWLEDGMENT", msg1); // "Product started in workflow"
	
	// Navigate user to appropriate state
	var buyerReviewState = workflow.getStateByID(buyerReviewStateID);
	if (node.getTask(buyerReviewState)){
		web.navigate(forwardScreenID, node, buyerReviewState);
	}
}
}