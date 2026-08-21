/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "StandardizeAddressAction",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Standardize Address Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "ContactPerson", "IndividualCustomer", "OrganizationCustomer", "Supplier" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "StandardizeAddressOperation",
  "parameters" : [ {
    "id" : "OverwriteExisting",
    "type" : "java.lang.Boolean",
    "value" : "true"
  }, {
    "id" : "OnlyRegenerateHashValues",
    "type" : "java.lang.Boolean",
    "value" : "false"
  }, {
    "id" : "CASSValidation",
    "type" : "java.lang.Boolean",
    "value" : "false"
  }, {
    "id" : "RenewValidationsInterval",
    "type" : "java.lang.Integer",
    "value" : "160"
  }, {
    "id" : "CASSCertificationReportEventProcessor",
    "type" : "com.stibo.core.domain.eventprocessor.EventProcessor",
    "value" : null
  } ],
  "pluginType" : "Operation"
}
*/
