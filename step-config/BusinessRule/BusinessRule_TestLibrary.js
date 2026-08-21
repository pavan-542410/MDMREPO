/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "TestLibrary",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "TestLibrary",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
function getReferences(node){
	var manager = node.getManager();
	var refType = manager.getReferenceTypeHome().getReferenceTypeByID("PMDM.IDRT.PrimaryProductImage");
	var ref = node.queryReferences(refType).asList(10);
	return ref.get(0).getTarget();
}


function add(num1, num2){
	return num1+num2;
}


function getAssetReference(node, manager){
	var refType = manager.getReferenceTypeHome().getReferenceTypeByID("PMDM.IDRT.PrimaryProductImage");
	var references = node.queryReferences(refType);
	var res = new java.util.ArrayList();
	references.forEach(function (ref){
		res.add(ref.getTarget());
		return true;	
	});
	return res;
}

/*===== business library exports - this part will not be imported to STEP =====*/
exports.getReferences = getReferences
exports.add = add
exports.getAssetReference = getAssetReference