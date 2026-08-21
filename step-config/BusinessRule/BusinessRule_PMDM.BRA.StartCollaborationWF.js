/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.StartCollaborationWF",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Start Collaboration WF",
  "description" : "Starts the Collaboration workflow.",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
    "contract" : "WebUiContextBind",
    "alias" : "web",
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
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "messageReceiver",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">PMDM.AT.Collaboration.MessageReceiver</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">1</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "message",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">PMDM.AT.Collaboration.Message</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">2</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
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
exports.operation0 = function (node,web,logger,messageReceiver,message,manager) {
function getCurrentISODateAndTime() {
	var rightNow = new java.util.Date();
	var simpleDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	var dateStr = simpleDateFormat.format(rightNow);
	return dateStr;
}

function addMessage(task, messageReceiverName, message) {
	var instance = task.getWorkflowInstance();
	var currentISODateAndTime = getCurrentISODateAndTime();
	var currentUserName = manager.getCurrentUser().getName();

	var existingMessage = instance.getSimpleVariable("Messages");
	if (existingMessage) {
		instance.setSimpleVariable("Messages", currentISODateAndTime + "\n" + currentUserName + " → " + messageReceiverName + "\n" + message + "<multisep/>" + existingMessage);
	} else {
		instance.setSimpleVariable("Messages", currentISODateAndTime + "\n" + currentUserName + " → " + messageReceiverName + "\n" + message);
	}
}

var msg1 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.StartCollabWF_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "A task has been assigned to %s"
var msg2 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.StartCollabWF_msg2").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Both Receiver and Message are required"


if (messageReceiver && message) {
	var workflowID = "PMDM.WF.ProductCollaboration";
	var startStateID = messageReceiver + "Start";
	var messageStateID = messageReceiver + "Message";
	var doneStateID = messageReceiver + "Done";

	var workflow = manager.getWorkflowHome().getWorkflowByID(workflowID);
	var startState = workflow.getStateByID(startStateID);
	var messageState = workflow.getStateByID(messageStateID);
	var doneState = workflow.getStateByID(doneStateID);

	var messageReceiverName = manager.getAttributeHome().getAttributeByID("PMDM.AT.Collaboration.MessageReceiver").getListOfValues().getListOfValuesValueByID(messageReceiver).getValue();

	// check to see if object is already in workflow
	var inWorkflow = node.getWorkflowInstanceByID(workflowID);
	if (!inWorkflow){
		// not in workflow - initiate
		var wf = workflow.start(node, null);
		var startStateTask = wf.getTask(startState);
		if (startStateTask) {
			addMessage(startStateTask, messageReceiverName, message);
			startStateTask.triggerByID("ToMessage", "");
		}
	} else {
		// already in workflow
		var startStateTask = node.getTask(startState);
		var messageStateTask = node.getTask(messageState);
		var doneStateTask = node.getTask(doneState);
		if (startStateTask){
			// add message and forward to message state
			addMessage(startStateTask, messageReceiverName, message);
			startStateTask.triggerByID("ToMessage", "");
		} 
		if (messageStateTask) {
			// already in message state so just add message
			addMessage(messageStateTask, messageReceiverName, message);
		}
		if (doneStateTask){
			// add message and forward to message state
			addMessage(doneStateTask, messageReceiverName, message);
			doneStateTask.triggerByID("ToMessage", "");
		}
	}
	var msg = (msg1+"").replace("%s", messageReceiverName); // "A task has been assigned to %s"
	web.showAlert("ACKNOWLEDGMENT", msg);
} else {
	web.showAlert("ERROR", "Error", msg2); // "Both Receiver and Message are required"
}
}