/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "CreateSupplier",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Create Supplier",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "SupplierClassificationsRoot" ],
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
    "contract" : "ObjectTypeBindContract",
    "alias" : "supplierProductsClassificationObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "SupplierProductsClassification",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "supplierAssetsClassificationObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "SupplierAssetsClassification",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "supplierLocationsClassificationObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "SupplierLocationsClassification",
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "supplierUserGroupRoot",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "Suppliers",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "supplierClassificationObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "SupplierClassification",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "supplierEntitiesClassificationObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "SupplierEntitiesClassification",
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "web",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "supplierName",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">PMDM.AT.SupplierName</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">b_supplier_name</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssuesReport",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "supplierID",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">PMDM.AT.SupplierID</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">a_supplier_id</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "supplierIDAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.SupplierID",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "supplierNameAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.SupplierName",
    "description" : null
  }, {
    "contract" : "ClassificationBindContract",
    "alias" : "supplierClassificationsRoot",
    "parameterClass" : "com.stibo.core.domain.impl.FrontClassificationImpl",
    "value" : "SupplierClassificationsRoot",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,supplierProductsClassificationObjectType,supplierAssetsClassificationObjectType,supplierLocationsClassificationObjectType,logger,supplierUserGroupRoot,supplierClassificationObjectType,supplierEntitiesClassificationObjectType,web,supplierName,dataIssuesReport,supplierID,manager,supplierIDAttribute,supplierNameAttribute,supplierClassificationsRoot,logLib) {
var forceLog = false;

var msg1 = manager.getEntityHome().getEntityByID("SysMsg_CreateSupplier_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // You already have a supplier with the same Supplier ID
var msg2 = manager.getEntityHome().getEntityByID("SysMsg_CreateSupplier_msg2").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // A supplier ID must be provided
var msg3 = manager.getEntityHome().getEntityByID("SysMsg_CreateSupplier_msg3").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // A supplier name must be provided
var msg4 = manager.getEntityHome().getEntityByID("SysMsg_CreateSupplier_msg4").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // Classification with ID %s already exist, but does not have the expected Object Type" %o. Unable to create supplier
var msg5 = manager.getEntityHome().getEntityByID("SysMsg_CreateSupplier_msg5").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // Supplier User Group %g already has supplier classification root %v It must be %s. Unable to create supplier
var msg6 = manager.getEntityHome().getEntityByID("SysMsg_CreateSupplier_msg6").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // Supplier successfully created

function log(message) {
	logLib.log(logger, "Create Supplier: " + message, forceLog);
}

// Auto-generated supplier ID
var newID = java.util.UUID.randomUUID().toString();

var userGroupHome = node.getManager().getGroupHome();
var classificationHome = node.getManager().getClassificationHome();

// Sanity checks:
var showError = false;
log("supplierID: " + supplierID);
if(supplierID) {
	var existingSupplier = manager.getNodeHome().getObjectByKey('Key.SupplierClass.SupplierID', supplierID);
	log("existingSupplier: " + existingSupplier);
	if(existingSupplier){
		dataIssuesReport.addError(msg1);
		showError = true;
	}
} else {
	dataIssuesReport.addError(msg2);
	showError = true;
}

if(supplierName === null){
	dataIssuesReport.addError(msg3);
	showError = true;
}

if (showError) {
	return dataIssuesReport;
}

// Create User Group
var groupID = newID + "-GRP";
var group = userGroupHome.getGroupByID(groupID);
if(!group) {
	group = supplierUserGroupRoot.createGroup(groupID);
}
group.setName(supplierName);

// Create Supplier Classification Structure
var supplierClassificationID = newID + "-CL";
var supplierClassification = classificationHome.getClassificationByID(supplierClassificationID);
if(supplierClassification && !supplierClassification.getObjectType().equals(supplierClassificationObjectType)) {
	//dataIssuesReport.addError("Classification with ID " + supplierClassificationID + " already exist, but does not have the expected Object Type" + supplierClassificationObjectType.getName() + ". Unable to create supplier");
	var message = String(msg4).replace("%s", supplierClassificationID).replace("%o", supplierClassificationObjectType.getName());
	dataIssuesReport.addError(message);
	return dataIssuesReport;
}

if(!supplierClassification) {
	supplierClassification = supplierClassificationsRoot.createClassification(supplierClassificationID, supplierClassificationObjectType);
	supplierClassificationsRoot.approve();
}
supplierClassification.setName(supplierName);
supplierClassification.getValue(supplierIDAttribute.getID()).setSimpleValue(supplierID);
supplierClassification.getValue(supplierNameAttribute.getID()).setSimpleValue(supplierName);
supplierClassification.approve();

var supplierEntityClassificationID = newID + "-ECL";
var supplierEntityClassification = classificationHome.getClassificationByID(supplierEntityClassificationID);
if(supplierEntityClassification && !supplierEntityClassification.getObjectType().equals(supplierEntitiesClassificationObjectType)) {
	//dataIssuesReport.addError("Classification with ID " + supplierEntityClassificationID + " already exist, but does not have the expected Object Type" + supplierEntitiesClassificationObjectType.getName() + ". Unable to create supplier");
	var message = String(msg4).replace("%s", supplierEntityClassificationID).replace("%o", supplierEntitiesClassificationObjectType.getName());
	dataIssuesReport.addError(message);
	return dataIssuesReport;
}
if(!supplierEntityClassification) {
	supplierEntityClassification=supplierClassification.createClassification(supplierEntityClassificationID, supplierEntitiesClassificationObjectType);
}
supplierEntityClassification.setName(supplierName + " Entities");
supplierEntityClassification.approve();

var supplierProductClassificationID = newID + "-PCL";
var supplierProductClassification = classificationHome.getClassificationByID(supplierProductClassificationID);
if(supplierProductClassification && !supplierProductClassification.getObjectType().equals(supplierProductsClassificationObjectType)) {
	//dataIssuesReport.addError("Classification with ID " + supplierProductClassificationID + " already exist, but does not have the expected Object Type" + supplierProductsClassificationObjectType.getName() + ". Unable to create supplier");
	var message = String(msg4).replace("%s", supplierProductClassificationID).replace("%o", supplierProductsClassificationObjectType.getName());
	dataIssuesReport.addError(message);
	return dataIssuesReport;
}
if(!supplierProductClassification) {
	supplierProductClassification=supplierClassification.createClassification(supplierProductClassificationID, supplierProductsClassificationObjectType);
}
supplierProductClassification.setName(supplierName + " Products");
supplierProductClassification.approve();

var supplierAssetClassificationID = newID + "-ACL";
var supplierAssetClassification = classificationHome.getClassificationByID(supplierAssetClassificationID);
if(supplierAssetClassification && !supplierAssetClassification.getObjectType().equals(supplierAssetsClassificationObjectType)) {
	//dataIssuesReport.addError("Classification with ID " + supplierAssetClassification + " already exist, but does not have the expected Object Type" + supplierAssetsClassificationObjectType.getName() + ". Unable to create supplier");
	var message = String(msg4).replace("%s", supplierAssetClassification).replace("%o", supplierAssetsClassificationObjectType.getName());
	dataIssuesReport.addError(message);
	return dataIssuesReport;
}
if(!supplierAssetClassification) {
	supplierAssetClassification=supplierClassification.createClassification(supplierAssetClassificationID, supplierAssetsClassificationObjectType);
}
supplierAssetClassification.setName(supplierName + " Assets");
supplierAssetClassification.approve();

var supplierLocationClassificationID = newID + "-LCL";
var supplierLocationClassification = classificationHome.getClassificationByID(supplierLocationClassificationID);
if(supplierLocationClassification && !supplierLocationClassification.getObjectType().equals(supplierLocationsClassificationObjectType)) {
	//dataIssuesReport.addError("Classification with ID " + supplierLocationClassification + " already exist, but does not have the expected Object Type" + supplierLocationsClassificationObjectType.getName() + ". Unable to create supplier");
	var message = String(msg4).replace("%s", supplierLocationClassification).replace("%o", supplierLocationsClassificationObjectType.getName());
	dataIssuesReport.addError(message);
	return dataIssuesReport;
}
if(!supplierLocationClassification) {
	supplierLocationClassification=supplierClassification.createClassification(supplierLocationClassificationID, supplierLocationsClassificationObjectType);
}
supplierLocationClassification.setName(supplierName + " Locations");
supplierLocationClassification.approve();

var hasVendorRoot = false;
if(group.getVendorRoot()) {
	hasVendorRoot = true;
	if(!group.getVendorRoot().equals(supplierClassification)) {
		//dataIssuesReport.addError("Supplier User Group " + group.getID() + " already has supplier classification root" + group.getVendorRoot().getID() + " It must be" + supplierClassification.getID() + ". Unable to create supplier");
		var message = String(msg4).replace("%g", group.getID()).replace("%v", group.getVendorRoot().getID().replace("%s", supplierClassification.getID()));
		dataIssuesReport.addError(message);
		return dataIssuesReport;
	}
}
if(!hasVendorRoot) {
	group.setVendorRoot(supplierClassification);
}

web.navigate("Object Type - PMDM.CLS.SupplierClassification", supplierClassification);
web.showAlert("ACKNOWLEDGMENT", msg6);
}