/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.CategorizeManually",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Categorize Manually",
  "description" : "Moves product to a user-selected category in the Primary Product Hierarchy.",
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "masterProductObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.InternalMasterProduct",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,web,manager,masterProductObjectType) {
// System Messages are stored on entities, for localization purpose.
var msg_Success = manager.getEntityHome().getEntityByID("SysMsg_msgSuccess").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // 'Success'
var msg_Error = manager.getEntityHome().getEntityByID("SysMsg_msgError").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // 'Error'
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.CategorizeManually_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // 'Object has been successfully moved.'
var msg2 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.CategorizeManually_msg2").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // 'Object move was unsuccessful because a valid parent was not selected. Please try again by selecting a category within the hierarchy.'
var msg3 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.CategorizeManually_msg3").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // 'To move, please select a single category only.'
var msg4 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.CategorizeManually_msg4").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // 'To make this record part of a master product, please use the Master Product Handling process.'

var selectedSetOfNodes = web.getSelectedSetOfNodes();

if (selectedSetOfNodes.size() > 1) {
	web.showAlert("ERROR", msg_Error, msg3); // "To move, please select a single category only."
} else {
	var newParent = selectedSetOfNodes.iterator().next();
	if (newParent.getObjectType().getID().equals(masterProductObjectType.getID())) {
		web.showAlert("ERROR", msg_Error, msg4); // "To make this record part of a master product, please use the Master Product Handling process."
	} else {
		try{
			node.setParent(newParent);
			web.showAlert("ACKNOWLEDGMENT", msg_Success, msg1); // "Object has been successfully moved."
			
		}catch (e){
			if (e.javaException instanceof com.stibo.core.domain.ObjectTypeConstraintException){
				web.showAlert("ERROR", msg_Error, msg2); // "Object move was unsuccessful because a valid parent was not selected. Please try again by selecting a category within the hierarchy."
			} else if (e.javaException instanceof com.stibo.core.domain.CycleConstraintException){
				web.showAlert("ERROR", msg_Error, msg2); // "Object move was unsuccessful because a valid parent was not selected. Please try again by selecting a category within the hierarchy."
			} else {
				throw(e);
			}
		}
	}	
}
}