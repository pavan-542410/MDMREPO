/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "SurvMasterDeleteDeactivatedsHousehRefs",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Survivorship - Master - Delete Duplicate Household References",
  "description" : "Deletes duplicate household references caused by merge of master records",
  "scope" : "Global",
  "validObjectTypes" : [ ],
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
    "contract" : "SurvivorshipSourcesBindContract",
    "alias" : "sources",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,sources) {
/*var correctID = node.getValue("HouseholdID").getSimpleValue();
if(correctID) {
	var refByIter = node.getReferencedBy().iterator();
	while(refByIter.hasNext()) {
		var ref = refByIter.next();
		if(ref.getReferenceTypeString().equals("HouseholdMembers")) {
			if(!ref.getSource().getID().equals(correctID)) {
				ref.delete();
			}
		}
	}
}*/

var iter = sources.iterator();
while(iter.hasNext()) {
	var source = iter.next();
	if(!source.getID().equals(node.getID())){
		var refByIter = node.getReferencedBy().iterator();
		while(refByIter.hasNext()) {
			var ref = refByIter.next();
			if(ref.getReferenceTypeString().equals("HouseholdMembers")) {
				ref.delete();
			}
		}
	}
}

}