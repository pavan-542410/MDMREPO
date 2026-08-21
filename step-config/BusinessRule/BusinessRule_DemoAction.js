/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "DemoAction",
  "type" : "BusinessAction",
  "setupGroups" : [ "DemoRules" ],
  "name" : "DemoAction",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "TestLibrary",
    "libraryAlias" : "lib"
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessFunctionBindContract",
    "alias" : "func",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>DemoFunction</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,func,lib) {
var res = lib.getAssetReference(node, manager);
logger.info(res);



//var refType = manager.getReferenceTypeHome().getReferenceTypeByID("PMDM.IDRT.PrimaryProductImage");
//
//var references = node.queryReferences(refType);
//
//references.forEach(function (ref){
//	//logger.info(ref.getTarget());
//	return true;	
//});
//
//var param = new java.util.HashMap();
//param.put("node",node);
////logger.info(param);
//
//var res = func.evaluate(param);
//logger.info(res);
//logger.info(references);


//logger.info(node.getValue("TestBrand").getSimpleValue());
}