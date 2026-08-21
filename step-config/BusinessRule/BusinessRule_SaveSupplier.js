/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "SaveSupplier",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Save Supplier",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Supplier" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "ReferenceOtherBABusinessAction",
  "parameters" : [ {
    "id" : "ReferencedBA",
    "type" : "com.stibo.core.domain.businessrule.BusinessAction",
    "value" : "StandardizeAddressAction"
  } ],
  "pluginType" : "Operation"
}
*/
