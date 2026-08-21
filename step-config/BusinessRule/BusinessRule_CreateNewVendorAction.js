/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "CreateNewVendorAction",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Create New Vendor Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "VendorGroupRoot" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "Provisioning_Library",
    "libraryAlias" : "provisioningLib"
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
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "vendorName",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">MDM_VendorName</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">Vendor name</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "portal",
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
exports.operation0 = function (node,manager,vendorName,portal,logger,provisioningLib) {
logger.info(vendorName);

logger.info("Vendor group to onboard : " + vendorName);
if (!(validateVendorName(vendorName))) {
    return false;
}
var conds = com.stibo.query.condition.Conditions;
var qHome = manager.getHome(com.stibo.query.home.QueryHome);
var mainVendorsRootClassification = manager.getClassificationHome().getClassificationByID('Vendor Group Root');
var querySpecification = qHome.queryFor(com.stibo.core.domain.Classification).where(
        conds.name().ignoreCase().like("*" + vendorName).and(
            conds.hierarchy().simpleBelow(mainVendorsRootClassification)));
var matchingVendors = querySpecification.execute().asList(10);
var matchingVendorName = null;
for (var i = 0; i < matchingVendors.size(); i++) {
    var venIdName = matchingVendors.get(i).getName();
    var venName = venIdName.substring(10, venIdName.length());
    logger.info(" venIdName: " + venIdName +" venName "+ venName);
	
    if (venName == vendorName) {
    	logger.info(" venIdName: and  venName are same");
		logger.info(" vendorName by user: " + vendorName +" venName "+ venName);
        if (matchingVendorName) {
            matchingVendorName = matchingVendorName + ", " + matchingVendors.get(i).getName() + "(" + matchingVendors.get(i).getID() + ")";
        } else {
            matchingVendorName = matchingVendors.get(i).getName() + "(" + matchingVendors.get(i).getID() + ")";
        }
    }
}
if (matchingVendorName) {
    portal.showAlert("ERROR", "The following Vendor Group already exist with this name " + matchingVendorName);
    return false;
}
var vendorIDSeqObj = manager.getEntityHome().getEntityByID("VendorIDGenerateEntity");
manager.getHome(com.stibo.core.domain.businessrule.BusinessRuleHome).getBusinessActionByID("GenerateVendorID").execute(vendorIDSeqObj);
var supplierID = vendorIDSeqObj.getValue('MDM_VendorID').getSimpleValue();
provisioningLib.coreProcessProvisioning(manager, supplierID, vendorName, logger);

function validateVendorName(name) {
    var regExSpecialChar = /[&\/\\#,+()$~%@^.=!":*?<>{}_-]/g;
    if (name == null || name == "null" || name == '' || name.trim() == '') {
        portal.showAlert("ERROR", "Invalid vendor Name: vendor Name cannot be empty ");
        return false;
    } else if (regExSpecialChar.test(name)) {
        portal.showAlert("ERROR", "Please review and revise your vendor name. No special characters are allowed in the Vendor Name. Please use only alphanumeric characters.");
        return false;
    }
    return true;
}

portal.showAlert("WARNING", "New vendor group ID: " + supplierID + " and vendor Root ID: Supplier_" + supplierID + " have been created successfully.");
}