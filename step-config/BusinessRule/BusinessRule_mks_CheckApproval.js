/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "mks_CheckApproval",
  "type" : "BusinessAction",
  "setupGroups" : [ "mks_Actions" ],
  "name" : "mks_CheckApproval",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "mks_PrimaryRoot", "mks_SecondaryRoot", "mks_Sku" ],
  "allObjectTypesValid" : false,
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger) {
var approvalStatus = node.getValue("mks_ApprovalStatus").getSimpleValue();

if (approvalStatus == null || approvalStatus.trim() == "")
{
	logger.info("Approval Status is empty")
}
else if (approvalStatus == "Completely Approved")
{
	logger.info("Product is Approved Completely")
}
else if (approvalStatus == "Party Approved")
{
	logger.info("Product is Approved Partially")
}
else if (approvalStatus == "Last Approved")
{
	logger.info("Product is Approved Recently")
}
else{
	logger.info("Product is not Approved")
}

}