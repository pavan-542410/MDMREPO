/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "AccumulativeSurvivorshipLib",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "Accumulative Survivorship Library",
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
/*
 This is an example, a template, showing how you could be implementing accumulative survivorship for data containers in STEP

 Disclaimer:
 - This javascript is NOT supported, and errors in this code can NOT be expected to be solved by STIBO support.
 - This code is intentionally left incomplete in areas. You may find these areas by searching on TODO
 - The code comes with substantial logging to help with understanding and building.
 -- You can find the log statements by searching on "log".
 -- You can enable all logging by replacing "//log" with "log" across the script.
 -- To disable all logging, replace "log" with "//log" and then after that replace "function //log" with "function log"

 Purpose:
 Accumulative survivorship allows your survivorship to update existing data container instances with additional information. This may be nessesary, if two different systems in your ecosystem provides different attribute values to the same data container instances. One example of this could be when storing line of business specific data on a Company Code Data Container. A CRM system could know the contact relations, while the ERP system knows the billing procedure. These systems should update their specific information in the a common data container instance, without deleting each others information.


 // ------------------------------------------- How to invoke this library in production ------------------------------------------------------
 This javascript is meant to be deployed in STEP as a Business Rule / JavaScript Library. That Library is meant to be used from one or more JavaScript Survivorship Business Actions.
 Your JavaScript Business Action code must include a data model and an invocation of the library code

 To setup the Business Action:
  - Depend on the Library as alias "AccumulativeSurvivorshipLib"
 - Bind
 -- sourceNodes  = "Survivorship Rule Source Objects"
 -- targetNode   = "Current Object"
 -- log          = "Logger"
 -- manager      = "STEP Manager"

 In your Business Action JavaScript add a data model like described later, and add the line below:
 AccumulativeSurvivorshipLib.promoteDataContainersAccumulatively(sourceNodes, targetNode, survivorDataContainerTypeIDsInput, survivorshipDataModelInput);


 // ------------------------------------------- How to invoke this library in test ------------------------------------------------------

 // To more easily test the library, you can run it against already existing entities in STEP
 // Create a seperate standard business action, and use JavaScript code to manually set the source and target nodes.

 var entityHome = manager.getEntityHome();
 var targetNode = entityHome.getEntityByID("128034");
 var sourceNode = entityHome.getEntityByID("128030");

 var sourceNodes = new java.util.ArrayList();
 sourceNodes.add(sourceNode);

 AccumulativeSurvivorshipLib.promoteDataContainersAccumulatively(sourceNodes, targetNode, survivorDataContainerTypeIDsInput, survivorshipDataModelInput);


 // ------------------------------------------- Example Data Model ----------------------------------------------

 The Accumulative Survivorship Library has to know your concrete Data Model. It requires two structures. First the list of data container types where this javascript applies, then a more complete structure:

 For each data container type,
  1.) a list of the attributes and references that forms the key of a specific data container instance,
  2.) the attributes and references to update,
  3.) attributes and references that should not be deleted by survivorship rules.

Here is an example of a model configuration for two data container types, with comments as to the meaning of each element in the model declaration.

 // The data container types that this survivorship javascript will handle.
 var survivorDataContainerTypeIDs = ["SAPCustomerSalesAreaData", "SAPCustomerCompanyCodeData"];

 // This description of your data model describes which attributes and references to handle for each data container type, and how.
 var survivorshipDataModel = {
 "SAPCustomerSalesAreaData": {
 // To compare if the source dc instance is the same as the target dc instance, we compare the CombinedUnique Attribute values and Reference targets.
 // This defines the equals key of your data container instances!
 "CombinedUniqueAttributeIDs" : [
 "SAPCustomerSalesAreaDataSalesArea"
 ],
 "CombinedUniqueDctReferenceTypes" : [
 "SAPCustomerSalesAreaDataSalesArea",
 ],
 // These are the attributes and references that will be surviving. Values of Attributes and References not listed will not be copied to the target.
 "SurvivingAttributes" : [
 "SAPCustomerSalesAreaDataSalesArea",
 "SAP-KTGRD",
 "SAP-AUTLF",
 "SAP-WAERS",
 "SAP-INCO1",
 "SAP-INCO2",
 "SAP-ANTLF",
 "SAP-KZTLF",
 "SAP-PLTYP",
 "SAP-PODKZ",
 "SAP-CASSD",
 "SAP-VSBED",
 "SAP-TAXKD",
 "SAP-ZTERM",
 ],
 "SurvivingDctReferenceTypes" : [
 "SAPCustomerSalesAreaDataSalesArea",
 "SAP Bill-to",
 "SAP Sold-to",
 "SAP Ship-to",
 ],
 // DoNotDelete attributes and references are automatically also surviving. You should not add the same attribute or
 // reference type to both arrays.
 // These references will not be deleted when any source system delivers a blank value.
 // Further: For a multi-target reference type, the total reference targets on the updated Golden Record will be the sum
 // of all reference targets on all sources
 // This delivers accumulative survivorship on multi valued references inside each data container instance.
 "SurvivingAttributesDoNotDelete" : [
 ],
 // Values of these attributes will not be deleted when any source system delivers a blank value.
 // For multi valued attributes the script does not deliver the same level of accumulative survivorship as for the
 // multi target references.
  "SurvivingDctRefTypesDoNotDelete" : [
 ]
 },
 // Here comes a second model for a second data container type:
 "SAPCustomerCompanyCodeData": {
 "CombinedUniqueAttributeIDs" : [
 "SAPCompanyCodeDataCompanyCode"
 ],
 "CombinedUniqueDctReferenceTypes" : [
 "SAPCustomerCompanyCodeDataCompanyCode",
 ],
 "SurvivingAttributes" : [
 "SAPCompanyCodeDataCompanyCode",
 "SAP-XAUSZ",
 "Bank Statement Comment",
 "SAP-NODEL",
 "SAP-LOEVM",
 "SAP-SPERR",
 "SAP-MAHNA",
 "SAP-XZVER",
 "SAP-ZAHLS",
 "SAP-AKONT",
 ],
 "SurvivingDctReferenceTypes" : [
 "SAPCustomerCompanyCodeDataCompanyCode",
 "Contact Person"
 ],
 "SurvivingAttributesDoNotDelete" : [
 ],
 "SurvivingDctRefTypesDoNotDelete" : [
 ]
 }
 }
 */

function arrayContainsEqual(array, obj) {
    var i = array.length;
    while (i--) {
        if (array[i] === obj || array[i].equals(obj)) {
            return true;
        }
    }
    return false;
}


function arrayContains(array, obj) {
    var i = array.length;
    while (i--) {
        if (array[i] === obj ) {
            return true;
        }
    }
    return false;
}

function normalize(str) {
    if (!str) {
        return "";
    }
    return java.lang.String.valueOf(str).replaceAll("[ \\xa0,\\.]+", " ").replaceAll("^[ ]+|[ ]+$", "").replaceAll("-", " ").toLowerCase().trim();
}

function getDcs(node, dctID) {
    //log.info("getDcs of node " + node + " for data container type " + dctID);
    var dcWrapper = node.getDataContainerByTypeID(dctID);
    var dcs = null;

    if(dcWrapper instanceof com.stibo.core.domain.datacontainer.SingleDataContainer) {
        dcs = new java.util.HashSet();
        if(dcWrapper.getDataContainerObject()) {
            dcs.add(dcWrapper);
        }
    } else {

        dcs = dcWrapper.getDataContainers();
    }
    if (dcs == null || (typeof dcs == 'undefined')) {
        dcs = new java.util.HashSet();
    }
    //log.info("getDcs of node " + node + " complete for data container type " + dctID + " returning " + dcs);
    return dcs;
}

function getCombinedUniqueAttributes(dctID, manager) {
    var attributes = new Array();
    if(survivorshipDataModel[dctID].CombinedUniqueAttributeIDs) {
        for(var i=0; i<survivorshipDataModel[dctID].CombinedUniqueAttributeIDs.length;i++) {
            var attributeID = survivorshipDataModel[dctID].CombinedUniqueAttributeIDs[i];
            var attribute = manager.getAttributeHome().getAttributeByID(attributeID);
            if(attribute) {
                attributes.push(attribute);
            }
        }
    }
    return attributes;
}

function getCombinedUniqueReferences(dctID, manager) {
    var references = new Array();
    if(survivorshipDataModel[dctID].CombinedUniqueDctReferenceTypes) {
        for(var i=0; i<survivorshipDataModel[dctID].CombinedUniqueDctReferenceTypes.length;i++) {
            var refTypeID = survivorshipDataModel[dctID].CombinedUniqueDctReferenceTypes[i];
            var reference = manager.getReferenceTypeHome().getReferenceTypeByID(refTypeID);
            if(reference) {
                references.push(reference);
            }
        }
    }
    return references;
}

function getSurvivingAttributes(dctID, manager) {
    var attributes = new Array();
    if(survivorshipDataModel[dctID].SurvivingAttributes) {
        for (var i = 0; i < survivorshipDataModel[dctID].SurvivingAttributes.length; i++) {
            var attributeID = survivorshipDataModel[dctID].SurvivingAttributes[i];
            var attribute = manager.getAttributeHome().getAttributeByID(attributeID);
            if (attribute) {
                attributes.push(attribute);
            }
        }
    }
    if(survivorshipDataModel[dctID].SurvivingAttributesDoNotDelete) {
        for (var i = 0; i < survivorshipDataModel[dctID].SurvivingAttributesDoNotDelete.length; i++) {
            var attributeID = survivorshipDataModel[dctID].SurvivingAttributesDoNotDelete[i];
            var attribute = manager.getAttributeHome().getAttributeByID(attributeID);
            if (attribute) {
                attributes.push(attribute);
            }
        }
    }
    //log.info("Surviving attributes are: " + attributes);
    return attributes;
}

function getSurvivingReferenceTypes(dctID, manager) {
    //log.info("Finding surviving reference types");
    var referenceTypes = new Array();
    if(survivorshipDataModel[dctID].SurvivingDctReferenceTypes) {
        for (var i = 0; i < survivorshipDataModel[dctID].SurvivingDctReferenceTypes.length; i++) {
            var referenceTypeID = survivorshipDataModel[dctID].SurvivingDctReferenceTypes[i];
            //log.info("surviving reference type: " + dctID + " : " + referenceTypeID);
            var refType = manager.getReferenceTypeHome().getReferenceTypeByID(referenceTypeID);
            if (refType) {
                referenceTypes.push(refType);
            }
        }
    }
    if(survivorshipDataModel[dctID].SurvivingDctRefTypesDoNotDelete) {
        for (var i = 0; i < survivorshipDataModel[dctID].SurvivingDctRefTypesDoNotDelete.length; i++) {
            var referenceTypeID = survivorshipDataModel[dctID].SurvivingDctRefTypesDoNotDelete[i];
            var refType = manager.getReferenceTypeHome().getReferenceTypeByID(referenceTypeID);
            if (refType) {
                referenceTypes.push(refType);
            }
        }
    }
    //log.info("Surviving reference types are: " + referenceTypes);
    return referenceTypes;
}

function logOutReferenceEqualsDetails(refType, refTargets1, refTargets2) {
    //log.info("Detailed Reference comparison. Ref1 count:" + refTargets1.size() + " ref2 count:"+ refTargets2.size() + " Reference Type: " + refType.getID());
    for(var k3=0;k3<refTargets1.size();k3++) {
        target = refTargets1.get(k3);
        //log.info("On dc1 found ref target " + target.getTarget().getID());
    }
    for(var k3=0;k3<refTargets2.size();k3++) {
        target = refTargets2.get(k3);
        //log.info("On dc2 found ref target " + target.getTarget().getID());
    }
}

// Equals will use the combination of all attributes and references said in the setup to be unique, to compare two dc instances.
// This can be used to determine, if these two dc instances are the same real object, and thus to say, if the incoming dc instance (dc1) is an
// update to the already existing dc2.
// So, when this returns true, we are in an update scenario. When this returns false, we are in clone (create-new-dc-instance) scenario.
function equals(dc1, dc2, attributes, refTypes) {
    log.info("SalesAreaManualSurvivorship Equals " + getDcIdString(dc1.getDataContainerObject()) + " == " + getDcIdString(dc2.getDataContainerObject()) + " by comparing attributes " + attributes + " and reference types " + refTypes);
    if(dc1 && dc2) {
        for (var i = 0; i < attributes.length; i++) {
            var attribute = attributes[i];
            if (!(normalize(dc1.getDataContainerObject().getValue(attribute.getID()).getSimpleValue()).equals(normalize(dc2.getDataContainerObject().getValue(attribute.getID()).getSimpleValue())))) {
                log.info("Equals false, normalized attribute values do not match for "+attribute.getID());
                return false;
            }
        }
        for (var i = 0; i < refTypes.length; i++) {
            var refType = refTypes[i];
            var refTargets1 = dc1.getDataContainerObject().getDataContainerReferences(refType);
            var refTargets2 = dc2.getDataContainerObject().getDataContainerReferences(refType);
            if(refTargets1 && refTargets2) {

                logOutReferenceEqualsDetails(refType, refTargets1, refTargets2);
                if (! (refTargets1.size() == refTargets2.size())) {
                    //log.info("Equals false, The number of Reference targets are different");
                    return false;
                }

                for(var k1=0;k1<refTargets1.size();k1++) {
                    compareTarget1 = refTargets1.get(k1);
                    var foundTarget = false;
                    for(var k2=0;k2<refTargets2.size();k2++) {
                        compareTarget2 = refTargets2.get(k2);
                        //log.info("Comparing " + compareTarget1.getTarget().getID() + " to "  + compareTarget2.getTarget().getID());
                        if(compareTarget1.getTarget().getID().equals(compareTarget2.getTarget().getID())){
                            // Pointing to the same target => equals.
                            foundTarget = true;
                        }
                    }
                    if(!foundTarget){
                        //log.info("Equals false, The entity " + compareTarget1.getTarget().getID() + " was only referenced by dc1");
                        return false;
                    }
                }
            } else {
                log.warn("TODO: You got null asking for reference targets of reference type "+refType.getID());
            }
        }
        return true;
    } else {
        return false;
    }
}

// Updates values for a specific reference type on the target golden record data container instance
// survRefType: The reference type to update
// dctID: Data Container Type of both surviving and source data container instance
// dcSource: The data container instance on the source recods, where we take the values from
// targetDcObject: The data container instance on the target golden record which has to have it's values updated.
function updateReferenceTypeOnTarget(survRefType, dctID, dcSource, targetDcObject){
    var refType = manager.getReferenceTypeHome().getReferenceTypeByID(survRefType.getID());

    var newRefValues = dcSource.getDataContainerObject().getDataContainerReferences(refType);
    var newRefValueSize = newRefValues.size();
    //log.info("The count of "+survRefType.getID()+" references on our source dc instance is: " + newRefValueSize);

    if(newRefValueSize == 0){
        // In delete/no-reference scenario
        if(survivorshipDataModel[dctID].SurvivingDctRefTypesDoNotDelete && arrayContainsEqual(survivorshipDataModel[dctID].SurvivingDctRefTypesDoNotDelete,survRefType.getID())) {
            // The above conditions say that this reference should never be deleted
            //log.info("Reference " + survRefType.getID() + " is on the do-not-delete-list, and was thus not deleted for " + getDcIdString(targetDcObject)); //.getDataContainerObject().

        } else {
            // Find old references and remove them:
            var oldReferences = targetDcObject.getDataContainerReferences(refType);
            //log.info("Found "+oldReferences.size()+ " references of type "+survRefType.getID()+" to delete");
            for(var oldRefIndex=0;oldRefIndex<oldReferences.size();oldRefIndex++) {
                //log.info("Removing old Data Container Reference: " + oldReferences.get(oldRefIndex));
                oldReferences.get(oldRefIndex).delete();
            }
        }

    } else { // We know, that there are new reference values to set. (newRefValueSize >= 1).

        // Iterating through all the reference targets on the source data container instance. For each such source reference, we
        // must ensure that node ID is also referenced on the target data container instance.
        for(var k=0;k<newRefValueSize;k++) {
            newFrontRefImpl = newRefValues.get(k);

            //log.info("Treating new reference: " + newFrontRefImpl.getSource().getTitle() + " references " + newFrontRefImpl.getTarget().getTitle());

            if(!newFrontRefImpl){
                //log.info("TODO: Handle new ");
                continue;
            }
            var oldFrontRefList = targetDcObject.getDataContainerReferences(refType);
            var oldRefTargetSize = oldFrontRefList.size();
            var alreadyReferenced = false;

            // We now try to find a similar reference on the golden record data container instance.
            for(var oldRefIdx=0;oldRefIdx<oldRefTargetSize;oldRefIdx++) {
                oldFrontRefImpl = oldFrontRefList.get(oldRefIdx);
                //log.info("Found existing reference on Data Container ID "+getDcIdString(targetDcObject)+". " + oldFrontRefImpl.getSource().getTitle() + " references " + oldFrontRefImpl.getTarget().getTitle());
                if(newFrontRefImpl.getTarget().getID() == oldFrontRefImpl.getTarget().getID()){
                    alreadyReferenced = true;
                }
            }

            if(alreadyReferenced) {
                //log.info("This new reference is already at the survivorship target");
                continue;
            } else {
                //log.info("SalesAreaManualSurvivorship about to update ref type " + survRefType.getID() + " to target " + newFrontRefImpl + " from data container " + targetDcObject);

                targetDcObject.createReference(newFrontRefImpl.getTarget(), survRefType);
            }
        }
    }
}

/**
 * Un-implemented aspects:
 * - TODO: LOV's with ID
 * - TODO: Last update date / trusted system
 */
function updateTarget(dctID, dcSource, targetDcObject, survivingAttributes, survivingReferences) {
    //log.info("SalesAreaManualSurvivorship updateTarget for data container type " + dctID + " with id " + getDcIdString(targetDcObject) );
    for(var i=0;i<survivingAttributes.length;i++) {
        var survAttr = survivingAttributes[i];
        var newValue = dcSource.getDataContainerObject().getValue(survAttr.getID()).getSimpleValue();

        if((!newValue || newValue.trim().length()<1) && survivorshipDataModel[dctID].SurvivingAttributesDoNotDelete && arrayContainsEqual(survivorshipDataModel[dctID].SurvivingAttributesDoNotDelete,survAttr.getID())) {
            // The above conditions say that this attribute should never be updated to null
            //log.info("The attribute " + survAttr.getID() + " value " + newValue + " was not applied to node " + targetNode.getID()+ " dcinstance " + targetDcObject + " dctID " + dctID + " because of SurvivingAttributesDoNotDelete");
            continue;
        }

        //log.info("Setting " + survAttr.getID() + " to " + newValue + ". dcinstance is " + targetDcObject + " dctID " + dctID);
        targetDcObject.getValue(survAttr.getID()).setSimpleValue(newValue);
    }
    for(var i=0;i<survivingReferences.length;i++) {
        var survRefType = survivingReferences[i];
        //log.info("Data Container Reference Survivorship for reftype " + survRefType.getID() + " on dctype " + dctID + ". DcSource is " + dcSource.getBaseObject().getTitle() + "  " + getDcIdString(dcSource.getDataContainerObject().toString()));
        updateReferenceTypeOnTarget(survRefType, dctID, dcSource, targetDcObject);
    }
    //log.info("SalesAreaManualSurvivorship Updated");
}

function getDcIdString(dcObject){
    var str = dcObject.toString();
    return str.substring(str.indexOf(":")+2).trim();
    /* This gets a substring from the beginning of the string
     to the first index of the character "+".
     */
}

function logOutAllDataContainersOnNode(messageHeader, node, dcTypeID, survivingAttributes, survivingReferences){
    dcs = getDcs(node, dcTypeID).iterator();
    var dcInstancesText = "";
    while (dcs.hasNext()) {
        var dc = dcs.next();
        var dcInstancesText = + dcInstancesText + "\n" + dcInstanceToString(dc, survivingAttributes, survivingReferences);
    }
    //log.info(messageHeader + " " + node.getID() + " " + dcInstancesText);
}

function dcInstanceToString(dcObject, survivingAttributes, survivingReferences){
    var dcInstancePrintString = "";
    for(var i=0;i<survivingAttributes.length;i++) {
        var survAttr = survivingAttributes[i];
        var value = dcObject.getDataContainerObject().getValue(survAttr.getID()).getSimpleValue();
        dcInstancePrintString += ", " + survAttr.getID()+"="+value;
    }
    for(var i=0;i<survivingReferences.length;i++) {
        var survRefType = survivingReferences[i];
        var refValues = dcObject.getDataContainerObject().getDataContainerReferences(survRefType).iterator();
        var refValuesString = "";
        while (refValues.hasNext()) {
            var refValue = refValues.next();
            refValuesString += refValue.getTarget().getID() + ", ";
        }
        dcInstancePrintString += ", " + survRefType.getID() + "=" + refValuesString;
    }
    return dcInstancePrintString;
}


function cloneToTarget(dctID, dcSource, targetNode, survivingAttributes, survivingReferences) {
    //log.info("SalesAreaManualSurvivorship cloneToTarget for data container type " + dctID );
    dcKeyHome = manager.getHome(com.stibo.core.domain.datacontainerkey.keyhome.DataContainerKeyHome);
    dctHome = manager.getHome(com.stibo.core.domain.datacontainertype.DataContainerTypeHome);

    //isDcKeyType = dctHome.getDataContainerTypeByID(dctID).hasKeyDefinition();
    isDcKeyType = false;
    try {
        dcKeyHome.getDataContainerKeyBuilder(dctID);
        isDcKeyType = true;
    }
    catch(err) {
        isDcKeyType = false;
    }

    keyBuilder = null;
    //TODO: LOV by value ID as part of key

    if(isDcKeyType) {
        keyBuilder = dcKeyHome.getDataContainerKeyBuilder(dctID);

        if(!dcKeyHome.hasValidKey(dcSource.getDataContainerObject())){
            throw "CloneToTarget failed. Source Data Container instance has incomplete key, and cannot be cloned.";
        }

        // Create the data container key to be used
        if(survivorshipDataModel[dctID].CombinedUniqueAttributeIDs) {
            for(var i=0; i<survivorshipDataModel[dctID].CombinedUniqueAttributeIDs.length;i++) {
                var attributeID = survivorshipDataModel[dctID].CombinedUniqueAttributeIDs[i];
                var attribute = manager.getAttributeHome().getAttributeByID(attributeID);
                if(attribute) {
                    attributeValue = dcSource.getDataContainerObject().getValue(attributeID).getSimpleValue();
                    log.info("cloneToTarget using attribute dc key " +attributeID+ " for data container type " + dctID );
                    keyBuilder.withAttributeValue(attributeID, attributeValue);
                }

            }
        }

        if(survivorshipDataModel[dctID].CombinedUniqueDctReferenceTypes) {
            for(var i=0; i<survivorshipDataModel[dctID].CombinedUniqueDctReferenceTypes.length;i++) {
                var refTypeID = survivorshipDataModel[dctID].CombinedUniqueDctReferenceTypes[i];
                //log.info("cloneToTarget detects data container type " + dctID + " uses reference " +refTypeID+ " as part of dc key");
                var refType = manager.getReferenceTypeHome().getReferenceTypeByID(refTypeID);
                if(refType) {
                    var newRefValues = dcSource.getDataContainerObject().getDataContainerReferences(refType);
                    for(var r=0;r<newRefValues.size();r++) {
                        targetID = newRefValues.get(r).getTarget().getID();
                        log.info("cloneToTarget using reference dc key target ID " +targetID+ " for data container type " + dctID );
                        keyBuilder.withReferenceTarget(refTypeID, targetID);
                    }

                }
            }
        }



    }

    var targetDcObject = null;
    var dcWrapper = targetNode.getDataContainerByTypeID(dctID);
    if(dcWrapper instanceof com.stibo.core.domain.datacontainer.SingleDataContainer) {
        //log.info("SalesAreaManualSurvivorship cloneToTarget deleteLocal for data container type " + dctID );
        dcWrapper.deleteLocal();
        if(!isDcKeyType) {
            targetDcObject= dcWrapper.createDataContainerObject(null);
        } else {
            targetDcObject= dcWrapper.createDataContainerObjectWithKey(keyBuilder.build())
        }
    } else {
        if(!isDcKeyType) {
            targetDcObject = dcWrapper.addDataContainer().createDataContainerObject(null);
            //log.info("SalesAreaManualSurvivorship cloneToTarget added new data container " + getDcIdString(targetDcObject) );
        }  else {
            targetDcObject= dcWrapper.addDataContainer().createDataContainerObjectWithKey(keyBuilder.build())
        }
    }
    updateTarget(dctID, dcSource, targetDcObject, survivingAttributes, survivingReferences);



}


function logOutAllCurrentValuesOnNode(logMessageHeader, node){
    var it2= node.getValues().iterator();
    var logMessage = logMessageHeader;
    while (it2.hasNext()) {
        var value = it2.next();
        var attribute = value.getAttribute().getID();

        logMessage = logMessage + "\n" + attribute + " = " + value.getSimpleValue();
    }
    //log.info(logMessage);

}

var survivorDataContainerTypeIDs;
var survivorshipDataModel;
var manager;

// This is the main function, taking a number of source records, and the surviving golden record, and promoting attribute and reference values as appropriate.
function promoteDataContainersAccumulatively(sourceNodes, targetNode, survivorDataContainerTypeIDsInput, survivorshipDataModelInput) {
    //log.info("Accumulative Survivorship Library");

    survivorDataContainerTypeIDs = survivorDataContainerTypeIDsInput;
    survivorshipDataModel = survivorshipDataModelInput;

    if(targetNode == null) {
        throw "promoteDataContainersAccumulatively failed because Target Node is null or Undefined";
    }

    //logOutAllCurrentValuesOnNode("Target Node Attribute Values:", targetNode);


    manager = targetNode.getManager();

    if(sourceNodes == null || sourceNodes.iterator().hasNext() == false) {
        throw "promoteDataContainersAccumulatively failed because no source nodes were supplied";
    }

    var sourceNodesIter = sourceNodes.iterator();
    var sourceNodeCount = 0;

    // For each source node for which we are to promote values
    while(sourceNodesIter.hasNext()) {
        var sourceNode = sourceNodesIter.next();
        sourceNodeCount = sourceNodeCount+1;

        if(sourceNode == null) {
            throw "promoteDataContainersAccumulatively failed because source node "+sourceNodeCount+" was null or undefined";
        }

        //logOutAllCurrentValuesOnNode("Source Node " + sourceNodeCount + " Attribute Values:", sourceNode);


        // For each data container type in our defined model
        for (var i=0;i< survivorDataContainerTypeIDs.length;i++) {
            var dcTypeID = survivorDataContainerTypeIDs[i];
            //log.info("Data Container Type ID = " + dcTypeID);
            var combinedUniqueAttributes = getCombinedUniqueAttributes(dcTypeID, manager);
            var combinedUniqueReferences = getCombinedUniqueReferences(dcTypeID, manager);
            var survivingAttributes = getSurvivingAttributes(dcTypeID, manager);
            var survivingReferences = getSurvivingReferenceTypes(dcTypeID, manager);

            //logOutAllDataContainersOnNode("Source Node "+dcTypeID+" Data Containers before Survivorship:", sourceNode, dcTypeID, survivingAttributes, survivingReferences);
            //logOutAllDataContainersOnNode("Target Node "+dcTypeID+" Data Containers before Survivorship:", targetNode, dcTypeID, survivingAttributes, survivingReferences);

            var dcsTargetNode = getDcs(targetNode, dcTypeID);
            //log.info("Did we find data containers on the Target node = " + dcsTargetNode.iterator().hasNext());
            var dcsSourceNodeIter = getDcs(sourceNode, dcTypeID).iterator();
            //log.info("Did we find data containers on this Source node = " + dcsSourceNodeIter.hasNext());


            // Iterate each data container instance on the source node, to promote from source record to target golden record.
            while (dcsSourceNodeIter.hasNext()) {

                var dcSource = dcsSourceNodeIter.next();

                var dcsTargetNodeIter = dcsTargetNode.iterator();
                var existingTargetDcFound = false;

                // Find out if a data container instance on the surviving golden record already has an instance with the same equals key.
                // If so, update, if not, create new data container instance.
                while (dcsTargetNodeIter.hasNext() && !existingTargetDcFound) {
                    var dcTarget = dcsTargetNodeIter.next();
                    if (equals(dcSource, dcTarget, combinedUniqueAttributes, combinedUniqueReferences)) {
                        updateTarget(dcTypeID, dcSource, dcTarget.getDataContainerObject(), survivingAttributes, survivingReferences);
                        existingTargetDcFound = true;
                    }
                }
                if(!existingTargetDcFound) {
                    cloneToTarget(dcTypeID, dcSource, targetNode, survivingAttributes, survivingReferences);
                }
            }

            //logOutAllDataContainersOnNode("Target Node "+dcTypeID+" Data Containers after Survivorship:", targetNode, dcTypeID, survivingAttributes, survivingReferences);

        }
    }
}



/*===== business library exports - this part will not be imported to STEP =====*/
exports.arrayContainsEqual = arrayContainsEqual
exports.arrayContains = arrayContains
exports.normalize = normalize
exports.getDcs = getDcs
exports.getCombinedUniqueAttributes = getCombinedUniqueAttributes
exports.getCombinedUniqueReferences = getCombinedUniqueReferences
exports.getSurvivingAttributes = getSurvivingAttributes
exports.getSurvivingReferenceTypes = getSurvivingReferenceTypes
exports.logOutReferenceEqualsDetails = logOutReferenceEqualsDetails
exports.equals = equals
exports.updateReferenceTypeOnTarget = updateReferenceTypeOnTarget
exports.updateTarget = updateTarget
exports.getDcIdString = getDcIdString
exports.logOutAllDataContainersOnNode = logOutAllDataContainersOnNode
exports.dcInstanceToString = dcInstanceToString
exports.cloneToTarget = cloneToTarget
exports.logOutAllCurrentValuesOnNode = logOutAllCurrentValuesOnNode
exports.survivorDataContainerTypeIDs = survivorDataContainerTypeIDs
exports.survivorshipDataModel = survivorshipDataModel
exports.manager = manager
exports.promoteDataContainersAccumulatively = promoteDataContainersAccumulatively