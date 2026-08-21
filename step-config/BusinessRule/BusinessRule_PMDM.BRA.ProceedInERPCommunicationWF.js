/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.ProceedInERPCommunicationWF",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Proceed In ERP Communication Workflow",
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
    "contract" : "AttributeBindContract",
    "alias" : "erpStatusCodeAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.ERPStatusCode",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "internalSourceRecordObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.InternalSourceRecord",
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
exports.operation0 = function (node,logger,erpStatusCodeAttribute,internalSourceRecordObjectType,manager,logLib) {
var forceLog = false;

function log(message) {
	logLib.log(logger, "ERP Communication: " + message, forceLog);
}

function initiateInWorkflow(node) {
	var erpCommunicationWorkflowInstance = node.startWorkflowByID("PMDM.WF.ERPCommunication", msg1); // "Started"
	log(node.getID() + " has been started in workflow");
	var result = null;
	if (erpCommunicationWorkflowInstance) {
		var initTask = erpCommunicationWorkflowInstance.getTaskByID("Init");
		if (initTask) {
			result = initTask.triggerByID("Proceed",msg2).isRejectedByScript(); //  "Error from ERP"
			return result;
		}
		var waitingForERPTask = erpCommunicationWorkflowInstance.getTaskByID("Waiting_For_ERP");
		if (waitingForERPTask) {
			result = waitingForERPTask.triggerByID("Waiting_For_ERP.Error",msg2).isRejectedByScript(); //  "Error from ERP"
			return result;
		}
	}
}

// System Messages are stored on entities, for localization purpose.
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.ProceedInERPComWF_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Started"
var msg2 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.ProceedInERPComWF_msg2").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Error from ERP"
var msg3 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.ProceedInERPComWF_msg3").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "No error from ERP so proceed to End"
var msg4 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.ProceedInERPComWF_msg4").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "Error from ERP so proceed to error state"
var msg5 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.ProceedInERPComWF_msg5").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // "No ERP Status Code received from ERP sp proceed to error state"


var nodeObjectTypeID = node.getObjectType().getID();
if (nodeObjectTypeID.equals(internalSourceRecordObjectType.getID())) {
	var erpCommunicationWorkflowID = "PMDM.WF.ERPCommunication";
	var erpStatusCode = node.getValue(erpStatusCodeAttribute.getID()).getID();
	
	if (node.isInWorkflow(erpCommunicationWorkflowID)) {
		var waitingForERPTask = node.getTaskByID(erpCommunicationWorkflowID, "Waiting_For_ERP");
		var errorInERPTask = node.getTaskByID(erpCommunicationWorkflowID, "Error_In_ERP");
	
		if (waitingForERPTask != null) {
			if (erpStatusCode != null && erpStatusCode == "0") {
				var result = waitingForERPTask.triggerByID("Waiting_For_ERP.Proceed", msg3).isRejectedByScript(); // "No error from ERP so proceed to End"
				log("Proceed [" + node.getTitle() + "] result=" + result);
			} else if (erpStatusCode != null && erpStatusCode != "0") {
				var result = waitingForERPTask.triggerByID("Waiting_For_ERP.Error", msg4).isRejectedByScript(); // "Error from ERP so proceed to error state"
				log("Error [" + node.getTitle() + "] result=" + result);
			} else if (erpStatusCode == null) {
				var result = waitingForERPTask.triggerByID("Waiting_For_ERP.Error", msg5).isRejectedByScript(); // "No ERP Status Code received from ERP sp proceed to error state"
				log("Attribute 'ERP Status Code' Empty [" + node.getTitle() + "] result=" + result);
			}
		} else if (errorInERPTask != null) {
			if (erpStatusCode != null && erpStatusCode == "0") {
				var result = errorInERPTask.triggerByID("Error_In_ERP.Proceed", msg3).isRejectedByScript(); // "No error from ERP so proceed to End"
				log("Proceed [" + node.getTitle() + "] result=" + result);
			}
		}
	} 
	
	if (!node.isInWorkflow(erpCommunicationWorkflowID)) {
		if (erpStatusCode != null && erpStatusCode != "0") {
			var result = initiateInWorkflow(node);
			log("Error [" + node.getTitle() + "] result=" + result);
		} else if (erpStatusCode == null) {
			var result = initiateInWorkflow(node);
			log("Attribute 'ERP Status Code' Empty [" + node.getTitle() + "] result=" + result);
		}
	}
}
}