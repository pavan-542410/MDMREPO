/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "LineOfBusinessSurvivorship",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Line Of Business Survivorship",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "OrganizationCustomer" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AccumulativeSurvivorshipLib",
    "libraryAlias" : "AccumulativeSurvivorshipLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "targetNode",
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
    "contract" : "LoggerBindContract",
    "alias" : "log",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "SurvivorshipSourcesBindContract",
    "alias" : "sourceNodes",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (targetNode,manager,log,sourceNodes,AccumulativeSurvivorshipLib) {
// The data container types that this survivorship javascript will handle. 
var survivorDataContainerTypeIDsInput = ["LineOfBusinessData"];

// This description of your data model describes which attributes and references to handle for each data container type, and how. 
var survivorshipDataModelInput = {
    "LineOfBusinessData": {
		// To compare if the source dc instance is the same as the target dc instance, we compare the CombinedUnique Attribute values and Reference targets.
		// This defines the equals key of your data container instances!
        "CombinedUniqueAttributeIDs" : [
            "LineOfBusiness"
        ],
	   "CombinedUniqueDctReferenceTypes" : [
        ],
		// These are the attributes and references that will be surviving. Values of Attributes and References not listed will not be copied to the target.
        "SurvivingAttributes" : [
        ],
	   "SurvivingDctReferenceTypes" : [
        ],
		// These values of attributes and references will not be deleted when any source system delivers a blank value. 
        "SurvivingAttributesDoNotDelete" : [
        		"LineOfBusiness",
			"LineOfBusinessInitialInvoiceDate",
			"LastEditDateLOB",
			"PriceListType",
			"Currency",
			"TermsOfPayment",
			"LineOfBusinessInvoiceSchedule"
        ],
        "SurvivingDctRefTypesDoNotDelete" : [
        		"ShipTo"
        ]
    }
}

AccumulativeSurvivorshipLib.promoteDataContainersAccumulatively(sourceNodes, targetNode, survivorDataContainerTypeIDsInput, survivorshipDataModelInput);

}