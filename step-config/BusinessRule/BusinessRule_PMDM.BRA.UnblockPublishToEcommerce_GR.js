/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.UnblockPublishToEcommerce_GR",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Unblock Publish To Ecommerce (on Golden Record)",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.GoldenRecord", "PMDM.PRD.InternalSourceRecord" ],
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
    "contract" : "BusinessFunctionBindContract",
    "alias" : "getGoldenFromSourceBusinessFunction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>PMDM.BF.GetGoldenFromSource</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "blockPublishToERPAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.BlockPublishToERP",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "blockPublishToEcommerceAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.BlockPublishToEcommerce",
    "description" : null
  }, {
    "contract" : "BusinessFunctionBindContract",
    "alias" : "getInternalFromGoldenBusinessFunction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>PMDM.BF.GetInternalFromGolden</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "goldenRecordObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.GoldenRecord",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "InternalSourceRecordObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.InternalSourceRecord",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,getGoldenFromSourceBusinessFunction,blockPublishToERPAttribute,blockPublishToEcommerceAttribute,getInternalFromGoldenBusinessFunction,goldenRecordObjectType,InternalSourceRecordObjectType,logLib) {
var forceLog = false;

function log(message) {
	logLib.log(logger, "Unblock Publish To Ecommerce: " + message, forceLog);
}

function unblockPublishToEcommerce(node) {
	node.getValue(blockPublishToEcommerceAttribute.getID()).setLOVValueByID("N");
}

var objectTypeID = node.getObjectType().getID();
if(goldenRecordObjectType.getID().equals(objectTypeID)) {
	unblockPublishToEcommerce(node);
} else if(InternalSourceRecordObjectType.getID().equals(objectTypeID)) {
	var goldenRecord = getGoldenFromSourceBusinessFunction.evaluate({"node" : node});
	if (goldenRecord) {
		unblockPublishToEcommerce(goldenRecord);
	}	
}

}