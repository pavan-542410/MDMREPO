/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "Revert_Workflow_Action",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Revert Workflow Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Office_Object" ],
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
revertBPandReferencesRecursively(node);


var instance = node.getWorkflowInstanceByID("wf_OfficeEnrichment");
if (instance){
	node.getValue("a_Status").setLOVValueByID("001");
	instance.delete("Reverting to Original state");
}

function revertBPandReferencesRecursively(node) {
    var targets = new java.util.Stack();
    var collectedNodes = new java.util.ArrayList();

    stackReferences(node, targets, collectedNodes);

    logger.info(targets.size());
    while (!targets.empty()) {
        revertNode(targets.pop());
    }
}


function stackReferences(_node, stack, _collectedNodes) {

    if (!_collectedNodes.contains(_node)) {

        stack.push(_node);
        _collectedNodes.add(_node);

        var referencesItr = _node.getReferences().asList().iterator();
        while (referencesItr.hasNext()) {
            var ref = referencesItr.next();

            var target = ref.getTarget();
            if (!target.getObjectType().getID().equals("DnBOrganization")) {
                stackReferences(target, stack, _collectedNodes);
            }

        }
    }
}

function revertNode(_node) {
    var approveStatus = _node.getApprovalStatus().toString();

    if (approveStatus.contains("Not in Approved workspace")) {
        try {
            _node.delete();
            logger.info("NotInApproved");
        } catch (e) {
            if (e.javaException instanceof com.stibo.core.domain.DeleteObjectionException) {
            } else {
                throw e; 
            }
        }
    } else {
        var partObjectToApprove = new java.util.HashSet();
        var approvedManager = _node.getManager().executeInWorkspace("Approved", function (apprSTEP) {
            return apprSTEP;
        });
        var approvedNode = approvedManager.getObjectFromOtherManager(_node);
        var iter = _node.getNonApprovedObjects().iterator();
        while (iter.hasNext()) {

            var part = iter.next();
            if (part.toString().contains(" NamePartObject")) {
                _node.setName(approvedNode.getName());
            } else if (part.toString().contains("ValuePartObject")) {
                var attrId = part.getAttributeID();
                    _node.getValue(attrId).setSimpleValue(approvedNode.getValue(attrId).getSimpleValue());
                    partObjectToApprove.add(part);

            } else if (part.toString().contains("ReferencePartObject")) {
                var refTypeId = part.getReferenceType();
                    revertReferences(_node, approvedNode, refTypeId, approvedManager);
                    partObjectToApprove.add(part);

            } else if (part.toString().indexOf("DataContainerPartObject") > -1) {
                var dcTypeID = part.getDataContainerTypeID();
                    revertDataContainers(_node, approvedNode, dcTypeID);
                    //adding new data container part object in set
				 var iterator = _node.getNonApprovedObjects().iterator();
        			 while (iterator.hasNext()) {
            			part = iterator.next();
            			if (part.toString().indexOf("DataContainerPartObject") > -1) {
            				partObjectToApprove.add(part);  
            			}
        			 }
            }
        }
        _node.approve(partObjectToApprove);

    }

}

function revertReferences(nodeMain, approvedNode, refTypeID, approvedManager) {
    var refType = nodeMain.getManager().getReferenceTypeHome().getReferenceTypeByID(refTypeID);
    var refsMain = nodeMain.getReferences(refType);
    var refsAppr = approvedNode.getReferences(refType);
    var approvedTargets = new java.util.ArrayList();
    var mainTargetsMap = new java.util.HashMap();

    for (var i = 0; i < refsAppr.size(); i++) {
        approvedTargets.add(refsAppr.get(i).getTarget().getID());
    }

    for (var i = 0; i < refsMain.size(); i++) {
        mainTargetsMap.put(refsMain.get(i).getTarget().getID(), refsMain.get(i));
        var mainRef = refsMain.get(i);
        if (!approvedTargets.contains(mainRef.getTarget().getID())) {
            var mainTarget = mainRef.getTarget();
            mainRef.delete();
            revertNode(mainTarget);
        }
    }

    for (var i = 0; i < refsAppr.size(); i++) {
        var approvedRef = refsAppr.get(i);
        if (!mainTargetsMap.containsKey(approvedRef.getTarget().getID())) {
            var mainNewTarget = approvedManager.getObjectFromOtherManager(approvedRef.getTarget());
            var newRef = nodeMain.createReference(mainNewTarget, refTypeID);
            copyAllValues(approvedRef, newRef);
        } else {
            var mainRef = mainTargetsMap.get(approvedRef.getTarget().getID());
            copyAllValues(approvedRef, mainRef);
        }
    }

}

function copyAllValues(srcNode, trgtNode) {
    var valuesItr = srcNode.getValues().iterator();
    while (valuesItr.hasNext()) {
        var value = valuesItr.next();
        var attributeID = value.getAttribute().getID();
        trgtNode.getValue(attributeID).setSimpleValue(srcNode.getValue(attributeID).getSimpleValue());
    }
}

function revertDataContainers(nodeMain, approvedNode, dcTypeID) {

    var containerAppws = approvedNode.getDataContainerByTypeID(dcTypeID);
    var containerMain = nodeMain.getDataContainerByTypeID(dcTypeID);

    if (containerAppws instanceof com.stibo.core.domain.datacontainer.MultiDataContainer) {
        containerMain.deleteLocal();

        var singleDateContainers = containerAppws.getDataContainers();
        var sdCitr = singleDateContainers.iterator();
        while (sdCitr.hasNext()) { 

            var sdC = sdCitr.next();
            var dcApprovedObject = sdC.getDataContainerObject();
            var dcNewMain = containerMain.addDataContainer().createDataContainerObject(null);

            var valuesItr = dcNewMain.getValues().iterator();
            while (valuesItr.hasNext()) {
                var value = valuesItr.next();
                var attributeID = value.getAttribute().getID();
                dcNewMain.getValue(attributeID).setSimpleValue(dcApprovedObject.getValue(attributeID).getSimpleValue());
            }
        }
    } else {

        var sdcApproved = containerAppws.getDataContainerObject();
        if (!sdcApproved) {
            var dcMain = nodeMain.getDataContainerByTypeID(dcTypeID);
            dcMain.deleteLocal();
        } else {
            var sdcMain = containerMain.getDataContainerObject();
            if (!sdcMain) {
                var dcNewMain = containerMain.createDataContainerObject();
            }

            var valuesItr = dcNewMain.getValues().iterator();
            while (valuesItr.hasNext()) {
                var value = valuesItr.next();
                var attributeID = value.getAttribute().getID();
                dcNewMain.getValue(attributeID).setSimpleValue(dcApprovedObject.getValue(attributeID).getSimpleValue());
            }

        }

    }

}
}