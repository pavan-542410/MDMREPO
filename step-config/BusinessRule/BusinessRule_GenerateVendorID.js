/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "GenerateVendorID",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Generate Vendor ID",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "VendorIDGeneratorEntity" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "AssignGeneratedValueAction",
  "parameters" : [ {
    "id" : "Attribute",
    "type" : "com.stibo.core.domain.Attribute",
    "value" : "MDM_VendorID"
  }, {
    "id" : "ValueGeneratorConfiguration",
    "type" : "com.stibo.valuegenerator.domain.configuration.ValueGeneratorConfiguration",
    "value" : "VendorGroupIDGenerator"
  } ],
  "pluginType" : "Operation"
}
*/
