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
exports.operation0 = function (node, logger) {
  var debug = logger;

  function p(message, debug) {
    if (debug) {
      debug.info(message);
    }
  }

  if (!node) {
    p("Revert_Workflow_Action: node is null — aborting.", debug);
    return;
  }

  p("Revert_Workflow_Action: Starting revert for node: " + node.getId(), debug);

  revertBPandReferencesRecursively(node);

  var instance = node.getWorkflowInstanceByID("wf_OfficeEnrichment");
  if (instance) {
    node.getValue("a_Status").setLOVValueByID("001");
    instance.delete("Reverting to Original state");
    p("Revert_Workflow_Action: Workflow instance deleted for node: " + node.getId(), debug);
  } else {
    p("Revert_Workflow_Action: No workflow instance found for node: " + node.getId(), debug);
  }

  function revertBPandReferencesRecursively(_node) {
    var targets = new java.util.Stack();
    var collectedNodes = new java.util.ArrayList();

    stackReferences(_node, targets, collectedNodes);

    p("Revert_Workflow_Action: Collected " + targets.size() + " node(s) to revert.", debug);
    while (!targets.empty()) {
      revertNode(targets.pop());
    }
  }

  function stackReferences(_node, stack, _collectedNodes) {
    if (!_node) { return; }
    if (_collectedNodes.contains(_node)) { return; }

    stack.push(_node);
    _collectedNodes.add(_node);

    var referencesItr = _node.getReferences().asList().iterator();
    while (referencesItr.hasNext()) {
      var ref = referencesItr.next();
      var target = ref.getTarget();
      if (!target) {
        p("[DEBUG] Revert_Workflow_Action: Skipping null target reference on node: " + _node.getId(), debug);
        continue;
      }
      if (!target.getObjectType().getID().equals("DnBOrganization")) {
        stackReferences(target, stack, _collectedNodes);
      }
    }
  }

  function revertNode(_node) {
    if (!_node) {
      p("[DEBUG] Revert_Workflow_Action: revertNode called with null node — skipping.", debug);
      return;
    }

    var approveStatus = _node.getApprovalStatus().toString();
    p("[DEBUG] Revert_Workflow_Action: Reverting node: " + _node.getId() + " | status: " + approveStatus, debug);

    if (approveStatus.contains("Not in Approved workspace")) {
      try {
        _node.delete();
        p("Revert_Workflow_Action: Deleted node not in Approved workspace: " + _node.getId(), debug);
      } catch (e) {
        if (e.javaException instanceof com.stibo.core.domain.DeleteObjectionException) {
          p("[DEBUG] Revert_Workflow_Action: DeleteObjectionException suppressed for node: " + _node.getId(), debug);
        } else {
          throw e;
        }
      }
    } else {
      var approvedManager = _node.getManager().executeInWorkspace("Approved", function (apprSTEP) {
        return apprSTEP;
      });

      if (!approvedManager) {
        p("Revert_Workflow_Action: Could not obtain Approved workspace manager for node: " + _node.getId(), debug);
        return;
      }

      var approvedNode = approvedManager.getObjectFromOtherManager(_node);
      if (!approvedNode) {
        p("Revert_Workflow_Action: No Approved counterpart found for node: " + _node.getId() + " — skipping.", debug);
        return;
      }

      var partObjectToApprove = new java.util.HashSet();

      // Collect non-approved objects into a list first to avoid modification during iteration
      var nonApprovedList = new java.util.ArrayList(_node.getNonApprovedObjects());
      var iter = nonApprovedList.iterator();
      while (iter.hasNext()) {
        var part = iter.next();
        if (part.toString().contains(" NamePartObject")) {
          _node.setName(approvedNode.getName());
        } else if (part.toString().contains("ValuePartObject")) {
          var attrId = part.getAttributeID();
          var approvedValue = approvedNode.getValue(attrId);
          if (approvedValue) {
            _node.getValue(attrId).setSimpleValue(approvedValue.getSimpleValue());
          }
          partObjectToApprove.add(part);
        } else if (part.toString().contains("ReferencePartObject")) {
          var refTypeId = part.getReferenceType();
          revertReferences(_node, approvedNode, refTypeId, approvedManager);
          partObjectToApprove.add(part);
        } else if (part.toString().indexOf("DataContainerPartObject") > -1) {
          var dcTypeID = part.getDataContainerTypeID();
          revertDataContainers(_node, approvedNode, dcTypeID);
          // Re-collect DataContainerPartObjects after revert since new ones may have been created
          var dcIter = _node.getNonApprovedObjects().iterator();
          while (dcIter.hasNext()) {
            var dcPart = dcIter.next();
            if (dcPart.toString().indexOf("DataContainerPartObject") > -1) {
              partObjectToApprove.add(dcPart);
            }
          }
        }
      }

      _node.approve(partObjectToApprove);
      p("Revert_Workflow_Action: Approved " + partObjectToApprove.size() + " part(s) for node: " + _node.getId(), debug);
    }
  }

  function revertReferences(nodeMain, approvedNode, refTypeID, approvedManager) {
    var refType = nodeMain.getManager().getReferenceTypeHome().getReferenceTypeByID(refTypeID);
    if (!refType) {
      p("[DEBUG] Revert_Workflow_Action: Reference type not found: " + refTypeID, debug);
      return;
    }

    var refsMain = nodeMain.getReferences(refType);
    var refsAppr = approvedNode.getReferences(refType);
    var approvedTargets = new java.util.ArrayList();
    var mainTargetsMap = new java.util.HashMap();

    for (var i = 0; i < refsAppr.size(); i++) {
      approvedTargets.add(refsAppr.get(i).getTarget().getID());
    }

    for (var j = 0; j < refsMain.size(); j++) {
      var mainRef = refsMain.get(j);
      mainTargetsMap.put(mainRef.getTarget().getID(), mainRef);
      if (!approvedTargets.contains(mainRef.getTarget().getID())) {
        var mainTarget = mainRef.getTarget();
        mainRef.delete();
        revertNode(mainTarget);
      }
    }

    for (var k = 0; k < refsAppr.size(); k++) {
      var approvedRef = refsAppr.get(k);
      if (!mainTargetsMap.containsKey(approvedRef.getTarget().getID())) {
        var mainNewTarget = approvedManager.getObjectFromOtherManager(approvedRef.getTarget());
        if (mainNewTarget) {
          var newRef = nodeMain.createReference(mainNewTarget, refTypeID);
          copyAllValues(approvedRef, newRef);
        }
      } else {
        var existingMainRef = mainTargetsMap.get(approvedRef.getTarget().getID());
        copyAllValues(approvedRef, existingMainRef);
      }
    }
  }

  function copyAllValues(srcNode, trgtNode) {
    if (!srcNode || !trgtNode) { return; }
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

    if (!containerAppws || !containerMain) {
      p("[DEBUG] Revert_Workflow_Action: Null data container for type: " + dcTypeID + " — skipping.", debug);
      return;
    }

    if (containerAppws instanceof com.stibo.core.domain.datacontainer.MultiDataContainer) {
      containerMain.deleteLocal();

      var singleDateContainers = containerAppws.getDataContainers();
      var sdCitr = singleDateContainers.iterator();
      while (sdCitr.hasNext()) {
        var sdC = sdCitr.next();
        var dcApprovedObject = sdC.getDataContainerObject();
        if (!dcApprovedObject) { continue; }

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
        containerMain.deleteLocal();
      } else {
        var sdcMain = containerMain.getDataContainerObject();
        // Fix: dcNewMain must be in scope for the values loop below
        var dcNewMain = sdcMain ? sdcMain : containerMain.createDataContainerObject();
        var dcApprovedObject = sdcApproved;

        var valuesItr = dcNewMain.getValues().iterator();
        while (valuesItr.hasNext()) {
          var value = valuesItr.next();
          var attributeID = value.getAttribute().getID();
          dcNewMain.getValue(attributeID).setSimpleValue(dcApprovedObject.getValue(attributeID).getSimpleValue());
        }
      }
    }
  }

  p("Revert_Workflow_Action: Completed for node: " + node.getId(), debug);
};

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