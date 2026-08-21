/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "HouseholdNameSurvivorship",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "HouseholdNameSurvivorship",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Household" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "BulkUpdateSetName",
  "parameters" : [ {
    "id" : "Formula",
    "type" : "java.lang.String",
    "value" : "concatenate(value('LastName'), ', ',\nlist(iterate(datacontainers('MainAddressDataContainer'),'list(multivalue2list(value(\"StandardizedCity\")),\"; \")'),', ')\n)"
  }, {
    "id" : "Value",
    "type" : "java.lang.String",
    "value" : ""
  } ],
  "pluginType" : "Operation"
}
*/
