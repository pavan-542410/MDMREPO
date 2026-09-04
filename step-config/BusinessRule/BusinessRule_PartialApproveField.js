/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PartialApproveField",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "PartialApproveField",
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
function partialApproveFields(node, IDArray, parentBool, nameBool){
	var set = new java.util.HashSet();
	var IDArray = new java.util.ArrayList(IDArray);
	var setUnapproved = node.getNonApprovedObjects();
	var unapprovedIterator = setUnapproved.iterator();

	while(unapprovedIterator.hasNext()){
		var partObject = unapprovedIterator.next();
		var partObjectStr = partObject.toString();
		
		if(partObjectStr.indexOf("ValuePartObject") != -1 && IDArray.indexOf(partObject.getAttributeID()) != -1){
			set.add(partObject);
		}

		else if(partObjectStr.indexOf("ReferencePartObject") != -1 && IDArray.indexOf(partObject.getReferenceType()) != -1){
			set.add(partObject);
		}

		else if(partObjectStr.indexOf("ClassificationLinkPartObject") != -1 && IDArray.indexOf(partObject.getLinkTypeID()) != -1){
			set.add(partObject);
		}

		else if(partObjectStr.indexOf("EntityReferencePartObject") != -1 && IDArray.indexOf(partObject.getReferenceType()) != -1){
			set.add(partObject);
		}
		
		else if(partObjectStr.indexOf("ParentPartObject") != -1 && parentBool == true){
			set.add(partObject);
		}
		
		else if(partObjectStr.indexOf("NamePartObject") != -1 && nameBool == true){
			set.add(partObject);
		}
		
		else if(partObjectStr.indexOf("DataContainerPartObject") != -1 && IDArray.indexOf(partObject.getDataContainerTypeID()) != -1){
			set.add(partObject);
		}	

	}
    
	if(set.size() > 0){
		node.approve(set);
	}
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.partialApproveFields = partialApproveFields