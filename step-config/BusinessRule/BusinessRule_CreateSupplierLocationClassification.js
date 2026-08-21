/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "CreateSupplierLocationClassification",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Create Supplier Location Classification",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "SupplierLocationsClassification" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "supplierLocationClassificationObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "SupplierLocationClassification",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "providerGLNInput",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">PMDM.AT.ProviderGLN</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssuesReport",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "providerGLNAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.ProviderGLN",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "isActiveInput",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">PMDM.AT.IsActive</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "isActiveAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.IsActive",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,manager,supplierLocationClassificationObjectType,providerGLNInput,dataIssuesReport,providerGLNAttribute,isActiveInput,isActiveAttribute) {
var msg1 = "You must provide a Provider GLN";
var msg1Entity = manager.getEntityHome().getEntityByID("SysMsg_CreateSupplierLocationClass_msg1");
if (msg1Entity) {
	msg1 = msg1Entity.getValue("PMDM.AT.SystemMessage").getSimpleValue(); // You must provide a Provider GLN
}

var msg2 = "An existing Supplier Location with the same GLN exists";
var msg2Entity = manager.getEntityHome().getEntityByID("SysMsg_CreateSupplierLocationClass_msg2");
if (msg2Entity) {
	msg2 = msg2Entity.getValue("PMDM.AT.SystemMessage").getSimpleValue(); // An existing Supplier Location with the same GLN exists
}

if (!providerGLNInput) {
	dataIssuesReport.addError(msg1); // Convert to translatable string
	return dataIssuesReport;
}

var existingLocation = manager.getNodeHome().getObjectByKey('PMDM.Key.PDS.GLN', providerGLNInput);
if (existingLocation) {
	dataIssuesReport.addError(msg2); // Convert to translatable string
	return dataIssuesReport;
}

var supplierLocationClassification = node.createClassification("", supplierLocationClassificationObjectType);
supplierLocationClassification.setName(providerGLNInput);
supplierLocationClassification.getValue(providerGLNAttribute.getID()).setValue(providerGLNInput);

if (isActiveInput) {
	supplierLocationClassification.getValue(isActiveAttribute.getID()).setLOVValueByID(isActiveInput);
} else {
	supplierLocationClassification.getValue(isActiveAttribute.getID()).setLOVValueByID("N");
}

supplierLocationClassification.approve();
}