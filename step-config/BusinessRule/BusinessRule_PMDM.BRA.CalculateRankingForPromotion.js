/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.CalculateRankingForPromotion",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Calculate Ranking For Promotion",
  "description" : "Sets the calculated Source Rank for Promotion on the External Source Record.",
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.ExternalSourceRecord", "PMDM.PRD.InternalSourceRecord" ],
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
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
    "contract" : "ClassificationProductLinkTypeBindContract",
    "alias" : "supplierLinkType",
    "parameterClass" : "com.stibo.core.domain.impl.ClassificationProductLinkTypeImpl",
    "value" : "PMDM.P2CLT.SupplierLink",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "categoryRankingForSupplier",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "PMDM.CRT.CategoryRankingForSupplier",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "internalSourceRecordObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.InternalSourceRecord",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "externalSourceRecordObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.ExternalSourceRecord",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,logger,supplierLinkType,categoryRankingForSupplier,internalSourceRecordObjectType,externalSourceRecordObjectType,logLib) {
/*  -----------------------------------------------------------------------
	Business rule:  PMDM.BRA.CalculateRakingForPromotion

    For Internal Source Record: 
    Set the ranking to "MDM"

    For External Source Record:
    Checks if the EXT is in a supplier classification.
    If yes, it will initiate the following values on the EXT:
            EXT attributes                      Supplier Classification bound attribute
            --------------                      ---------------------------------------
            PMDM.AT.SupplierID =                supplierID
            PMDM.AT.SupplierName =              supplierName
            PMDM.AT.TypeOfSupplier =            typeOfSupplier

    Calculate the Source Rank for Promotion:
    If the EXT has a category specific ranking defined for the supplier then use the category specific rank type and rank if either of them exist
    If the EXT does not have a category specific ranking defined for the suppleir then use the general raking defined on the supplier classification
    Sets the calculated Source Rank for Promotion on the EXT

    Calculate the Source Rank for Promotion part 2:
    newSourceRecordHandling: On Supplier Classification: PMDM.AT.GeneralHandlingNewEXT, on ranking link: PMDM.AT.CategoryHandlingNewEXT
    updatedSourceRecordHandling: On Supplier Classification: PMDM.AT.GeneralHandlingUpdatedEXT, on ranking link: PMDM.AT.CategoryHandlingUpdatedEXT
    Values can be:
    Automatic approval of new Source Records	  Auto1
    Manual approval of new Source Records      Manual

    If the EXT has a category specific handling of new source records defined for the supplier then use the category specific instead of the general 
    If the EXT has a category specific handling of updated source records defined for the supplier then use the category specific instead of the general 

	----------------------------------------------------------------------
*/

var forceLog = false;
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.CalculateRanking_Message").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // 'Supplier reference does not exist. The Supplier is not configured correctly'
var msg2 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.CalculateRankin_Message2").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // 'No value for attribute %s on Supplier'


function log(message) {
	logLib.log(logger, "Calculate Ranking: " + message, forceLog);
}

function getSimpleValue(product, attributeID) {
	var value = product.getValue(attributeID);
	if (value) {
		return value.getSimpleValue();
	}
	return null;
}

function getSingleValueLovID(product, attributeID) {
	var value = product.getValue(attributeID);
	if (value) {
		return value.getID();
	}
	return null;
}

function checkNotNull(value, attributeID) {
	if (value === null) {
		var message = (msg2+ "").replace("%s", attributeID); // 'No value for attribute %s on Supplier' 
		throw(message);
	}
}

function getCategoryRankingRef(supplierClassification) {
	// Check if the EXT has a category specifc ranking defined for the supplier (= a ranking specific to a product classification for this supplier, which overrides the default ranking for the supplier).
	log("Check for category specific ranking for supplier");
	var linkList = node.getReferences(categoryRankingForSupplier);
	if (linkList.size() > 0) {
		for (var i = 0; i < linkList.size(); i++) {
			var link = linkList.get(i);
			var classification = link.getTarget();
			log("classification: " + classification.getID() + " product: " + link.getSource().getID());
			if (classification.getID().equals(supplierClassification.getID())) {
				log("Match found");
				return link;
			}
		}
	}
}

function setSourceRankForPromotion(supplierClassification) {
	log("Calculating SourceRankForPromotion");

	var categoryRankTypeOfSupplierID = null;
	var categoryRankForSupplier = null;
	var rankTypeOfSupplierID = "NA"; // NA = Not appoved content source
	var rankForSupplier = "99"; // Lowest ranking

	var categoryHandlingNewEXT = null;
	var categoryHandlingUpdatedEXT = null;
	var handlingNewEXT = "Manual"; // Default to manual approval if no Handling for New External Source Records is found
	var handlingUpdatedEXT = "Manual"; // Default to manual approval if no Handling for Updated External Source Records is found

	var categoryRankingRef = getCategoryRankingRef(supplierClassification);
	if (categoryRankingRef) {
		categoryRankTypeOfSupplierID = getSingleValueLovID(categoryRankingRef, "PMDM.AT.CategoryRankTypeOfSupplier");
		log("categoryRankTypeOfSupplierID: " + categoryRankTypeOfSupplierID);
		categoryRankForSupplier = getSingleValueLovID(categoryRankingRef, "PMDM.AT.CategoryRankForSupplier");
		log("categoryRankForSupplier: " + categoryRankForSupplier);
		categoryHandlingNewEXT = getSingleValueLovID(categoryRankingRef, "PMDM.AT.CategoryHandlingNewEXT");
		log("categoryHandlingNewEXT: " + categoryHandlingNewEXT);
		categoryHandlingUpdatedEXT = getSingleValueLovID(categoryRankingRef, "PMDM.AT.CategoryHandlingUpdatedEXT");
		log("categoryHandlingUpdatedEXT: " + categoryHandlingUpdatedEXT);
	}

	// If a category specific rank type is found then use it, if not, use the generalt rank type on the Supplier Classification
	if (categoryRankTypeOfSupplierID) {
		rankTypeOfSupplierID = categoryRankTypeOfSupplierID;
	} else {
		var generalRankTypeOfSupplierID = getSingleValueLovID(supplierClassification, "PMDM.AT.GeneralRankTypeOfSupplier");
		if (generalRankTypeOfSupplierID) {
			rankTypeOfSupplierID = generalRankTypeOfSupplierID;
		}
	}

	// If a category specific rank is found then use it, if not, use the generalt rank on the Supplier Classification
	if (categoryRankForSupplier) {
		rankForSupplier = categoryRankForSupplier;
	} else {
		var generalRankForSupplier = getSingleValueLovID(supplierClassification, "PMDM.AT.GeneralRankForSupplier");
		if (generalRankForSupplier) {
			rankForSupplier = generalRankForSupplier;
		}
	}
	
	var sourceRanking = rankTypeOfSupplierID + rankForSupplier;
	log("SourceRankForPromotion: " + sourceRanking);
	var currentSourceRanking = getSimpleValue(node, "MatchingDataSource");
	log("currentSourceRanking: " + currentSourceRanking);
	if (!currentSourceRanking || !currentSourceRanking.equals(sourceRanking)) {
		log("Will set value");
		node.getValue("MatchingDataSource").setSimpleValue(sourceRanking);
	}

	// If a category specific new EXT handling is found then use it, if not, use the general new EXT handling on the Supplier Classification
	if (categoryHandlingNewEXT) {
		handlingNewEXT = categoryHandlingNewEXT;
	} else {
		var generalHandlingNewEXT = getSingleValueLovID(supplierClassification, "PMDM.AT.GeneralHandlingNewEXT");
		if (generalHandlingNewEXT) {
			handlingNewEXT = generalHandlingNewEXT;
		}
	}
	node.getValue("PMDM.AT.HandlingNewEXT").setLOVValueByID(handlingNewEXT);

	// If a category specific updated EXT handling is found then use it, if not, use the general updated EXT handling on the Supplier Classification
	if (categoryHandlingUpdatedEXT) {
		handlingUpdatedEXT = categoryHandlingUpdatedEXT;
	} else {
		var generalHandlingUpdatedEXT = getSingleValueLovID(supplierClassification, "PMDM.AT.GeneralHandlingUpdatedEXT");
		if (generalHandlingUpdatedEXT) {
			handlingUpdatedEXT = generalHandlingUpdatedEXT;
		}
	}
	node.getValue("PMDM.AT.HandlingUpdatedEXT").setLOVValueByID(handlingUpdatedEXT);
}

function doStuff(linkedSupplierProductsClassssification) {
	log("Do stuff");

	var supplierClassification = linkedSupplierProductsClassssification.getParent();

	// Read the values of the following attributes on the Supplier Classification
	var supplierID = getSimpleValue(supplierClassification, "PMDM.AT.SupplierID");
	var supplierName = getSimpleValue(supplierClassification, "PMDM.AT.SupplierName");
	var typeOfSupplier = supplierClassification.getValue("PMDM.AT.TypeOfSupplier").getID();
	log("supplierID: " + supplierID + ", supplierName: " + supplierName + ", typeOfSupplier: " + typeOfSupplier);

	// If one of these attributes is null, it will throw an error and stop
	checkNotNull(supplierID, "PMDM.AT.SupplierID");
	checkNotNull(supplierName, "PMDM.AT.SupplierName");
	checkNotNull(typeOfSupplier, "PMDM.AT.TypeOfSupplier");
	log("Not Null");

	// If all the above are not null, copy the values to the equivalent attributes on the EXT
	var currentSupplierID = getSimpleValue(node, "PMDM.AT.SupplierID");
	if (!currentSupplierID) {
		node.getValue("PMDM.AT.SupplierID").setSimpleValue(supplierID); // PMDM.AT.SupplierID is used as part of key so don't change if it has value.
	}
	node.getValue("PMDM.AT.SupplierName").setSimpleValue(supplierName);
	node.getValue("PMDM.AT.TypeOfSupplier").setLOVValueByID(typeOfSupplier);
	log("Values set");

	setSourceRankForPromotion(supplierClassification);
}

function run() {
	if (node.getObjectType().getID().equals(externalSourceRecordObjectType.getID())) {
		// Get ranking etc. from Supplier Classification
		var classificationRefList = node.getClassificationProductLinks(supplierLinkType);
		if (classificationRefList.size() > 0) {
			var classificationRef = classificationRefList.get(0);
			var linkedSupplierProductsClassssification = classificationRef.getClassification();
			doStuff(linkedSupplierProductsClassssification);
		} else {
			throw msg1;
		}
	}

	if (node.getObjectType().getID().equals(internalSourceRecordObjectType.getID())) {
		var currentSourceRanking = getSimpleValue(node, "MatchingDataSource");
		log("currentSourceRanking: " + currentSourceRanking);
		if (!currentSourceRanking || !currentSourceRanking.equals("MDM")) {
			log("Internal Source Record so set Source Rank For Promotion to MDM");
			node.getValue("MatchingDataSource").setSimpleValue("MDM");
		}
	}
}

// *************** START ***************///

run();

// *************** END ***************///

}