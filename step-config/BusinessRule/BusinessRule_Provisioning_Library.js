/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "Provisioning_Library",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "Provisioning Library",
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
====================================
ID                  : bl_Provisioning
Name                : Provisioning Library
Description         : Functions and process related to provisioning
Type                : Library
Valid Object Types  : NA
On Approve          : N
Scope               : NA
Run as Privileged   : NA
--------------
Dependencies

====================================
 */

/**
* Core provisioning function creates the supplier classification structure and also corresponding user groups
* @author Mahesh Goud, Athelli 
* @param {Manager} manager
* @param {js String} vendorID
* @param {js String} supplierName
* @param {gateway} gateway Integration endpoint
* @param {Logger} logger
* @returns {null} 
*/
function coreProcessProvisioning(manager, vendorID, supplierName,logger){
    createSupplierClassificationStructure(manager, vendorID, supplierName,logger);
    //createUserGroupStructure(manager, vendorID, supplierName,logger)
}

/**
* creates the supplier classification structure 
* @author Mahesh Goud, Athelli 
* @param {Manager} manager
* @param {js String} vendorID
* @param {js String} supplierName
* @param {js String} BPID Business partner step id
* @param {Logger} logger
* @returns {null} 
*/
function createSupplierClassificationStructure(manager, vendorID, supplierName, logger) {
    var classificationHome = manager.getClassificationHome();
    var mainvendorsRootClassification = classificationHome.getClassificationByID('Vendor Group Root');
    var rootClassificationObjectTpe = manager.getObjectTypeHome().getObjectTypeByID('Vendor Group');
    var supplierAssetObjectTpe = manager.getObjectTypeHome().getObjectTypeByID('VendorGrp_Assets');
    try {
        var rootClassification = mainvendorsRootClassification.createClassification('Vendor_' + vendorID, rootClassificationObjectTpe);
        rootClassification.setName(vendorID + ' - ' + supplierName)
        var supplierAssetClassification = rootClassification.createClassification('Vendor_' + vendorID + '_Assets', supplierAssetObjectTpe);
        supplierAssetClassification.setName('Assets');
    }
    catch (e) {
        logger.info("Exceptions occured during provisioning  supplier ID = " + vendorID + " Classification creation failed, classification already exist " + "\n Exception : " + e);
        throw new Error("Exceptions occured during provisioning  supplier ID = " + vendorID + " Classification creation failed, classification already exist " + "\n Exception : " + e)
    }
    /*
    var businessPartner = manager.getEntityHome().getEntityByID(BPID);
    if(businessPartner){
        var supplierReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID('SupplierEntities');​
        businessPartner.createReference​(rootClassification, supplierReferenceType)
    }
    else{
        logger.info("Exceptions occured during provisioning  supplier ID = " + vendorID + " Business partner referenc to classification failed, Business partner doesn't exit" );
        throw new Error("Exceptions occured during provisioning  supplier ID = " + vendorID + " Business partner referenc to classification failed, Business partner doesn't exit")
    }*/
    //partial approve classification
    rootClassification.approve();
    supplierAssetClassification.approve();
}

/**
* creates the supplier User Group structure
* @author Mahesh Goud, Athelli 
* @param {Manager} manager
* @param {js String} vendorID
* @param {js String} supplierName
* @param {Logger} logger
* @returns {null} 
*/
function createUserGroupStructure(manager, vendorID, supplierName,logger){
    var suppplierUserGroup = manager.getGroupHome().getGroupByID(vendorID);
    if(suppplierUserGroup != null){
        logger.info("Exceptions occured during provisioning  supplier ID = " + vendorID + " User Group creation failed, User group already exist  ");
        throw new Error("Exceptions occured during provisioning  supplier ID = " + vendorID + " User Group creation failed, User group already exist  ");  
    }
    var vendorRootUserGroup = manager.getGroupHome().getGroupByID('Vendors');
    suppplierUserGroup =  vendorRootUserGroup.createGroup(vendorID);
    suppplierUserGroup.setName(vendorID + " - " + supplierName);
    var supplierClassification = manager.getClassificationHome().getClassificationByID('Vendor_' + vendorID);
    suppplierUserGroup.setVendorRoot(supplierClassification);
    //setPrivilege(gateway, suppplierUserGroup.getID(), BPID)

}

/**
* creates the supplier User Group structure
* @author Shiva
* @param {gateway} gateway Integration endpoint
* @param {groupID} Supplied Group ID
* @param {nodeID} Node ID
* @returns {null/void} 
*/
function setPrivilege(gateway, groupID, nodeID) {
    var stepXML = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
        "<STEP-ProductInformation>\n" +
        "\t<UserGroupList>\n" +
        "\t\t<UserGroup ID=\"" + groupID + "\">\n" +
        "\t\t\t<PrivilegeRule ActionSetID=\"VMDMUserActions\" EntityID=\"" + nodeID + "\"/>\n" +
        "\t\t\t<PrivilegeRule ActionSetID=\"VendorUserActions\" EntityID=\"" + nodeID + "\" AttributeGroupID=\"ag_VendorAttributes\"/>\n" +
        "\t\t</UserGroup>\n" +
        "\t</UserGroupList>\n" +
        "</STEP-ProductInformation>";

    var iiepID = "iiep_StepXMLFromGateway";
    gateway.post().pathElements("restapiv2", "inbound-integration-endpoints", iiepID, "upload-and-invoke").pathQuery({
        workspace: "Main",
        context: "Context1"
    }).body(stepXML).bodyContentType("application/octet-stream").invoke();
}

/*
* @author Mahesh Goud, Athelli 
* @param {Manager} manager
* @param {classification Object} supplierObj
* @param {gateway} gateway Integration endpoint
* @param {java.util.Set<BP Node>} BPSet
* @param {webUIContext} portal
* @param {Logger} logger
* @returns {null} 
*/
function linkBPToSupplier(manager, supplierObj,gateway,BPSet,portal,logger){
    var BPSetItr = BPSet.iterator();
    var supplierReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID('VendorLink');​
    var groupID = supplierObj.getID().substring(supplierObj.getID().indexOf​('_')+1);
    while(BPSetItr.hasNext()){
        var currentBPObj = BPSetItr.next();
        var currentBPObjSupplierRefList = currentBPObj.queryReferences​(supplierReferenceType).asList(1);
        if(currentBPObjSupplierRefList.size() >0){
            var currentBPObjSupplierRef = currentBPObjSupplierRefList.get(0);
            portal.showAlert("ERROR", "Business partner "+ currentBPObj.getID() + "(" +currentBPObj.getName()+ ")" +
            " is already linked to supplier " + currentBPObjSupplierRef.getTarget().getID() +
            "(" + currentBPObjSupplierRef.getTarget().getName() + ")");
            logger.info("Business partner "+ currentBPObj.getID() + "(" +currentBPObj.getName()+ ")" +
            " is already linked to supplier " + currentBPObjSupplierRef.getTarget().getID() +
            "(" + currentBPObjSupplierRef.getTarget().getName() + ")");
            return false;
        }   
    }
    BPSetItr = BPSet.iterator();
    while(BPSetItr.hasNext()){
        var currentBPObj = BPSetItr.next();
        currentBPObj.createReference​(supplierObj, supplierReferenceType);
        //setPrivilege(gateway, groupID, currentBPObj.getID());
    }
}

/*
* @author Mahesh Goud, Athelli 
* @param {node} Current Object
* @param {EventQueue} errorHandlingProvisioningQueue
* @param {EventTYpe} errorHandlingProvisioningQueueEventType
* @param {js String} "error message to add (cannot be null)
* @param {Logger} logger
* @returns {null} 
*/
function logErrorMessageToEP(node, errorHandlingProvisioningQueue,errorHandlingProvisioningQueueEventType, errorMessage, logger){
	if (errorMessage && errorMessage == null && errorMessage =="null"){		
		throw new Error("Error message cannot be empty function : logErrorMessageToEP" + node.getID());	
	}
	node.getValue("a_ErrorReport").deleteCurrent();
	node.getValue("a_ErrorReport").setSimpleValue(errorMessage);
	errorHandlingProvisioningQueue.queueDerivedEvent(errorHandlingProvisioningQueueEventType, node);
	
}


/* Validate UUID is of step pattern
* @author Mahesh Goud, Athelli 
* @param {js string} UUID
* @param {Logger} logger
* @return {null} 
*/
function isValidUUID( UUID, logger){

	if(UUID && UUID!='' && UUID!='null'){
        var UUIDString = new java.lang.String(UUID);
	var assetUUIDString= "[a-z0-9]{8}+-[a-z0-9]{4}+-[a-z0-9]{4}+-[a-z0-9]{4}+-[a-z0-9]{12}+";
	var patternUUID = new java.util.regex.Pattern.compile(assetUUIDString);
	var matcher = patternUUID.matcher(UUIDString);
	var matchFound = matcher.find();
    if(matchFound) {
		return true;
	}
	else{
		return false;
	}
}
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.coreProcessProvisioning = coreProcessProvisioning
exports.createSupplierClassificationStructure = createSupplierClassificationStructure
exports.createUserGroupStructure = createUserGroupStructure
exports.setPrivilege = setPrivilege
exports.linkBPToSupplier = linkBPToSupplier
exports.logErrorMessageToEP = logErrorMessageToEP
exports.isValidUUID = isValidUUID