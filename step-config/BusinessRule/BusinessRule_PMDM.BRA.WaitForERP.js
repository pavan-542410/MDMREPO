/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.WaitForERP",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Wait For ERP",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
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
    "contract" : "ObjectTypeBindContract",
    "alias" : "productFamilyType",
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
exports.operation0 = function (node,logger,productFamilyType,manager,logLib) {
var forceLog = false;
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_AutoSubmittedBySKURequest").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // Auto-submitted by SKU_Request

function log(message) {
	logLib.log(logger, "Wait for ERP: " + message, forceLog);
}

function submitEvents(sku){
	var task = sku.getTaskByID("PMDM.WF.ProductCreation", "SKU_Request");
	var errorText = node.getValue("PMDM.AT.ErrorText").getID(); 

	if (task != null){
		if (errorText != null && errorText == "0") {		
			var result = task.triggerByID("SKU_Request.Proceed", msg1).isRejectedByScript(); //  "Auto-submitted by SKU_Request"
			log("Proceed [" + sku.getTitle() + "] result=" + result);
		}
		else if (errorText != null && errorText != "0") {
			var result = task.triggerByID("Error_Review", msg1).isRejectedByScript(); // "Auto-submitted by SKU_Request"
			log("Revision Error [" + sku.getTitle() + "] result=" + result);
		}
		else if(errorText == null) {
			var result = task.triggerByID("Error_Review", msg1).isRejectedByScript(); // "Auto-submitted by SKU_Request"
			log("Attribute 'Error Text' Empty [" + sku.getTitle() + "] result=" + result);
		}		
	}	
	else {
		log("Found no sku creation Task for " + sku.getTitle());
	}
}

var parent = node.getParent();
var parentType = parent.getObjectType().getID();
log("parentType: " + parentType);
if(parentType.equals(productFamilyType.getID())) {
	//ProductFamily so check if all child variants has a SKU
	var SendSubmitEvent = true;
	var variants = node.getParent().getChildren();
	for(var i=0; i<variants.size(); i++){
		var variant = variants.get(i);
		log("variant: " + variant);
		var sku = variant.getValue("PMDM.AT.SKU").getSimpleValue();
		log("sku: " + sku);
		if(!variant.getValue("PMDM.AT.SKU").getSimpleValue()) {
			SendSubmitEvent = false;
			break;
		}
	}
	if (SendSubmitEvent){
		submitEvents(parent);
	}
}
else {
	submitEvents(node);
}
}