/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.HandleInternalSourceRecord",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Handle Internal Source Record",
  "description" : "From the Golden Record, creates the Internal Source Records and creates / updates relevant references.",
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.GoldenRecord" ],
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
    "alias" : "goldenRecord",
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
    "contract" : "ObjectTypeBindContract",
    "alias" : "internalSourceRecordType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.InternalSourceRecord",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "goldenToSourceReferenceType",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "PMDM.PRT.GoldenToSourceRecord",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "externalSourceRecordType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.ExternalSourceRecord",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "blockPublishToERPAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.BlockPublishToERP",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "blockPublishToEcommerceAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.BlockPublishToEcommerce",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "packagingUnitReferencesAttributeGroup",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "PMDM.ATG.PackagingUnitReferences",
    "description" : null
  }, {
    "contract" : "BusinessFunctionBindContract",
    "alias" : "getAllPackagingFromExternalBusinessFunction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>PMDM.BF.GetAllPackagingFromExternal</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  }, {
    "contract" : "BusinessFunctionBindContract",
    "alias" : "getAllExternalFromGoldenBusinessFunction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>PMDM.BF.GetAllExternalFromGolden</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "copyToInternalPackagingAttributeGroup",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "PMDM.ATG.CopyToInternalPackaging",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "copyToInternalSourceRecordAttributeGroup",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "PMDM.ATG.CopyToInternalSourceRecord",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "internalSourceToExternalSourceReferenceType",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "PMDM.PRT.INT2EXT",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "goldenToInternalSourceReferenceType",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "PMDM.PRT.GR2INT",
    "description" : null
  }, {
    "contract" : "BusinessFunctionBindContract",
    "alias" : "getGoldenFromSourceBusinessFunction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>PMDM.BF.GetGoldenFromSource</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "confirmedDuplicateReferenceType",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ConfirmedDuplicateProduct",
    "description" : null
  }, {
    "contract" : "EntityBindContract",
    "alias" : "configurationObject",
    "parameterClass" : "com.stibo.core.domain.impl.entity.FrontEntityImpl$$Generated$$28",
    "value" : "ConfigurationObject",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "useInternalPackaging",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.UseInternalPackaging",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (goldenRecord,manager,logger,internalSourceRecordType,goldenToSourceReferenceType,externalSourceRecordType,blockPublishToERPAttribute,blockPublishToEcommerceAttribute,packagingUnitReferencesAttributeGroup,getAllPackagingFromExternalBusinessFunction,getAllExternalFromGoldenBusinessFunction,copyToInternalPackagingAttributeGroup,copyToInternalSourceRecordAttributeGroup,internalSourceToExternalSourceReferenceType,goldenToInternalSourceReferenceType,getGoldenFromSourceBusinessFunction,confirmedDuplicateReferenceType,configurationObject,useInternalPackaging,logLib) {
/*	-----------------------------------------------------------------------------------------------------------------
 * 	Business rule:	"Create Internal Source Record" (PMDM.BRA.CreateInternalSourceRecord)
 * 
 *  Checks if there is an Internal Source Record attached to the current Golden Record.
 *  If not, an Internal Source Record is created and linked to the Golden Record.
 *  Creates or deletes references between the Internal Source Record and the External Source Records,
 *  to reflect the references between the Golden Record and its sources.
	-----------------------------------------------------------------------------------------------------------------
*/

var forceLog = false;

function log(message) {
	logLib.log(logger, "Handle Internal Source Record: " + message, forceLog);
}

/*  ----------------------------------------------------------------------------------------------------------------------
 *  Declarations
 *  ----------------------------------------------------------------------------------------------------------------------
 */

// Arrays to store all the External and Internal Source Records linked to the Golden Record
var EXTs = [];
var nbEXTs = 0;
var INTs = [];
var nbINTs = 0;

var internalSourceRecord;

/*  ----------------------------------------------------------------------------------------------------------------------
 *  Functions
 *  ----------------------------------------------------------------------------------------------------------------------
 */

function getAllInternalSourceRecords(goldenRecord) {
	// Gets all Internal Source Records linked from a Golden Record
	var result = [];
	var references = goldenRecord.getReferences(goldenToSourceReferenceType);
	references.toArray().forEach(
		function(reference) {
			if (reference.getTarget().getObjectType().getID().equals(internalSourceRecordType.getID())) {
				result.push(reference.getTarget());
			}
		}
	);
	return result;
}

function getAllINT2EXT(externalSourceRecord) {
	// Gets all Internal Source Records linking to the External Source Record
	var result = [];
	var query = externalSourceRecord.queryReferencedBy(internalSourceToExternalSourceReferenceType);
	query.forEach(
		function(reference) {
			if (reference.getSource().getObjectType().getID().equals(internalSourceRecordType.getID())) {
				result.push(reference.getSource());
			}
			return true;
		}
	);
	return result;
}

function getAllGR2INT(goldenRecord) {
	// Gets all Internal Source Records linking to the Golden Record
	var result = [];
	var references = goldenRecord.getReferences(goldenToInternalSourceReferenceType);
	references.toArray().forEach(
		function(reference) {
			result.push(reference.getTarget());
     		return true;
 		}
 	);
	return result;
}

function isINT2EXT(internalSourceRecord, externalSourceRecord) {
	// Tests if there is a reference between an Internal Source Record and an External Source Record passed as a parameter.
	var result = false;
	internalSourceRecord.getReferences(internalSourceToExternalSourceReferenceType).toArray().forEach(
		function(reference) {
			var referenceTargetID = reference.getTarget().getID();
			if (referenceTargetID.equals(externalSourceRecord.getID())) {
				result = true;
			}
		}
	);
	//log("... ... isINT2EXT - INT: " + internalSourceRecord.getID() + " EXT: " + externalSourceRecord.getID() + " - result: " + result);
	return result;
}

function copyReferences(source, target, attributeGroup) {
	// Copy references
	attributeGroup.getLinkTypes().toArray().forEach (
		function (referenceType) {
			if(referenceType instanceof com.stibo.core.domain.ReferenceType) {
				var references = source.getReferences(referenceType);
				if(references.size() > 0) {
					references.toArray().forEach(
						function (reference) {
							log("... Creating " + referenceType.getID() + " reference from " + target.getID() + " to " + reference.getTarget().getID());
							target.createReference(reference.getTarget(), referenceType);
						}
					);
				}
			}
		}
	);					
}

function copyAttributeValues(source, target, attributeGroup) {
	// Copy attribute values
	attributeGroup.getAllAttributes().toArray().forEach(
		function(attribute) {
			var attributeID = attribute.getID();
			var value = source.getValue(attributeID);
			if (value) {
				var simpleValue = value.getSimpleValue();
				if (simpleValue) {
					var targetValue = target.getValue(attributeID);
					if (!simpleValue.equals(targetValue.getSimpleValue()) && targetValue.canSetValue()) {
						log("... ... Setting value of: " + attributeID + " = " + simpleValue + " on " + target.getID());
						targetValue.setSimpleValue(simpleValue);
					} else {
						log("... ... Did not set value of: " + attributeID + ". Value already exists, the attribute is not valid for " + target.getID() + " or user is not privileged to set value");
					}
				}
			}
		}
	);
}

function copyAttributeValuesCrossContext(source, target, attributeGroup) {
	var contextsToApprove = ["Context1", "Context2", "Context3"];
	for (var i = 0; i < contextsToApprove.length; i++) {
		var contextToApprove = contextsToApprove[i];
		log("... Will now copy attribute values in context: " + contextToApprove);
		manager.executeInContext(contextToApprove, function(managerInContext){
			var sourceInContext = managerInContext.getObjectFromOtherManager(source);
			var targetInContext = managerInContext.getObjectFromOtherManager(target);
			copyAttributeValues(sourceInContext, targetInContext, attributeGroup);
		});
	}
}

function createInternalPackaging(packagingObject, internalPackagingRoot, attributeGroup, extToIntMap) {
	var objectType = packagingObject.getObjectType();
	var newInternalPackaging = internalPackagingRoot.createProduct("", objectType);
	log("... The external " + packagingObject.getID() + " has been duplicated to the internal " + newInternalPackaging.getID());

	if (extToIntMap.containsKey(packagingObject.getID())) {
		extToIntMap.put(packagingObject.getID(), newInternalPackaging);
	}

	// Set name of internal packaging
	newInternalPackaging.setName(goldenRecord.getName() + " " + objectType.getName());

	// Copy attribute values
	attributeGroup.getAllAttributes().toArray().forEach(
		function(attribute) {
			var attributeID = attribute.getID();
			var value = packagingObject.getValue(attributeID);
			if (value) {
				var simpleValue = value.getSimpleValue();
				if (simpleValue) {
					log("... ... Setting value on created packaging. Attribute: " + attributeID + "=" + simpleValue);
					newInternalPackaging.getValue(attributeID).setSimpleValue(simpleValue);
				}
			}
		}
	);
}

function linkInternalPackaging(packagingObject, referenceTypesIDs, attributeGroup, extToIntMap) {
	packagingObject.getReferences().asList().toArray().filter(function(reference) {return referenceTypesIDs.contains(reference.getReferenceType().getID());}).forEach(
		function(packageReference) {
			log("... Handling link of the internal duplicate of " + packagingObject.getID());
			var target = packageReference.getTarget();
			if (extToIntMap.containsKey(target.getID())) {
				var currentSourceID = packageReference.getSource().getID();
				var newSource = extToIntMap.get(currentSourceID);
				var currentTargetID = packageReference.getTarget().getID();
				var newTarget = extToIntMap.get(currentTargetID);
				log("... ... External ref: " + currentSourceID + " -> " + currentTargetID + " - Internal ref: " + newSource.getID() + " -> " + newTarget.getID());
				var newPackagingReference = newSource.createReference(newTarget, packageReference.getReferenceType());

				// Copy referece meta-data attribute values
				attributeGroup.getAllAttributes().toArray().forEach(
					function(attribute) {
						var attributeID = attribute.getID();
						var value = packageReference.getValue(attributeID);
						if (value) {
							var simpleValue = value.getSimpleValue();
							if (simpleValue) {
								log("... ... Setting value on created reference. Attribute: " + attributeID + "=" + simpleValue);
								newPackagingReference.getValue(attributeID).setSimpleValue(simpleValue);
							}
						}
					}
				);
			}
		}
	);
}

function gatherAllPackages(packageMap, referenceTypesIDs, node, extToIntMap) {
	node.queryReferencedBy(com.stibo.core.domain.Product, null).forEach(
		function(reference) {
			if (referenceTypesIDs.contains(reference.getReferenceType().getID())) {
				var source = reference.getSource();
				if(!packageMap.containsKey(source.getID())) {
					packageMap.put(source.getID(), source);
					extToIntMap.put(source.getID(), "");
					gatherAllPackages(packageMap, referenceTypesIDs, source, extToIntMap);
				}
			}
			return true;
		}
	);
}

function getPackages(node, referenceTypesIDs, packagingObjects, extToIntMap) {
	var packageMap = new java.util.LinkedHashMap();
	gatherAllPackages(packageMap, referenceTypesIDs, node, extToIntMap);
	packagingObjects.addAll(packageMap.values());
}

function getFirstExternalSourceRecordWithPackaging() {
	var allExternalSourceRecords = getAllExternalFromGoldenBusinessFunction.evaluate({"node" : goldenRecord});
	var externalSourceRecords = allExternalSourceRecords.toArray();
	for (var i=0; i < externalSourceRecords.length; i++) {
		var externalSourceRecord = externalSourceRecords[i];
		var allPackaging = getAllPackagingFromExternalBusinessFunction.evaluate({"node" : externalSourceRecord});
		if (allPackaging.toArray().length>0){
 			return externalSourceRecord;
		}
	}
	return null;
}

function handleInternalPackaging(goldenRecord, internalSourceRecord) {
	log("... Handle internal Packaging - begin");
	var externalSourceRecordWithPackaging = getFirstExternalSourceRecordWithPackaging();
	if (externalSourceRecordWithPackaging) {
		log("... ... externalSourceRecordWithPackaging: " + externalSourceRecordWithPackaging.getID());

		// Collect relevant packaging reference types
		var referenceTypesIDs = new java.util.HashSet();
		packagingUnitReferencesAttributeGroup.getLinkTypes().toArray().filter(function (linktype) {return linktype instanceof com.stibo.core.domain.ReferenceType}).forEach(function (referenceType) {referenceTypesIDs.add(referenceType.getID());});

		// Get relevant packaging objects and start on map of external -> internal
		var packagingObjects = new java.util.ArrayList();
		var extToIntMap = new java.util.HashMap();
		getPackages(externalSourceRecordWithPackaging, referenceTypesIDs, packagingObjects, extToIntMap);
		log("... ... packagingObjects: " + packagingObjects);
		
		// Create internal packaging objects and copy relevant attribute values from teh external packaging objects
		// This will also populate the extToIntMap
		var internalPackagingRoot = manager.getProductHome().getProductByID("INT.Packaging");
		packagingObjects.toArray().forEach(
			function (packagingObject) {
				createInternalPackaging(packagingObject, internalPackagingRoot, copyToInternalPackagingAttributeGroup, extToIntMap);
			}
		);

		// Add a mapping between external source record and internal source record to extToIntMap
		extToIntMap.put(externalSourceRecordWithPackaging.getID(), internalSourceRecord);
		log("... ... Populated extToIntMap: " + extToIntMap);

		// Create references between the internal packaging and add meta-data on the references
		packagingObjects.toArray().forEach(
			function (packagingObject) {
				linkInternalPackaging(packagingObject, referenceTypesIDs, packagingUnitReferencesAttributeGroup, extToIntMap);
			}
		);
	}
	log("... Handle internal Packaging - end");
}

function setDefaultTranslations(internalSourceRecord) {
	var configObject = manager.getEntityHome().getEntityByID("ConfigurationObject");
	
	if (configObject && configObject.getValue("PMDM.AT.TranslationDefaultFrench").getID().equals("Enabled")) {
		internalSourceRecord.getValue("PMDM.AT.TranslateToFrench").setLOVValueByID("Y");
	} else {
		internalSourceRecord.getValue("PMDM.AT.TranslateToFrench").setLOVValueByID("N");
	}

	if (configObject && configObject.getValue("PMDM.AT.TranslationDefaultGerman").getID().equals("Enabled")) {
		internalSourceRecord.getValue("PMDM.AT.TranslateToGerman").setLOVValueByID("Y");
	} else {
		internalSourceRecord.getValue("PMDM.AT.TranslateToGerman").setLOVValueByID("N");
	}

	var translationStatusValueFR = internalSourceRecord.getValue("PMDM.AT.TranslationStatusFrench");
	if (!translationStatusValueFR.getID()) {
		translationStatusValueFR.setLOVValueByID("NOT");
	}

	var translationStatusValueDE = internalSourceRecord.getValue("PMDM.AT.TranslationStatusGerman");
	if (!translationStatusValueDE.getID()) {
		translationStatusValueDE.setLOVValueByID("NOT");
	}
}

function deleteReference(sourceNode, targetNode, referenceType) {
	var references = sourceNode.getReferences(referenceType);
	for (var i = 0; i < references.size(); i++) {
		var reference = references.get(i);
		var referenceTarget = reference.getTarget();
		if (referenceTarget.getID().equals(targetNode.getID())) {
			log("... ... deleteReference: Deleting '" + referenceType.getID() + "' reference between " + sourceNode.getID() + " (" + sourceNode.getName() + ") and " + targetNode.getID() + " (" + targetNode.getName() + ")");
			reference.delete();
		}
	}
}

function approveInternalSourceRecord(internalSourceRecord) {
	var parent = internalSourceRecord.getParent();
	if (!parent.getApprovalStatus().name().equals("NotInApproved")) {
		internalSourceRecord.approve();
		log("INT was approved");
	} else {
		log("Parent has never been approved so INT cannot be approved"); // Should we throw an error so it appears in the event processor execution report?
	}
}

function maintainConfirmedDuplicateReferences(internalSourceRecords, externalSourceRecords) {
	/* ----------------------------------------------------------------------------------------------------------------------
	 *  Creation and Deletion of a Confirmed Duplicate reference between the Internal Source Record and the External Source Record
	 *  
	 *  ---------------------------------------------------------------------------------------------------------------------
	 */

	log("-----------------------------------------------------------------------------");
	log("Create and maintain Confirmed Duplicate references between the INT and an EXT");
	log("-----------------------------------------------------------------------------");

	for (var i = 0; i < internalSourceRecords.length; i++) {
		var internalSourceRecord = internalSourceRecords[i];
		log("internalSourceRecord: " + internalSourceRecord.getID());
		var confirmedDuplicateReferences = internalSourceRecord.getReferences(confirmedDuplicateReferenceType).toArray();
		log("... confirmedDuplicateReferences length: " + confirmedDuplicateReferences.length);
		
		if (confirmedDuplicateReferences.length == 0 && externalSourceRecords && externalSourceRecords.length > 0) {
			// INT has no Confirmed Duplicate reference and Golden Record has at least one EXT
			log("... ... Create new Confirmed Duplicate reference to " + externalSourceRecords[0].getID());
			internalSourceRecord.createReference(externalSourceRecords[0], confirmedDuplicateReferenceType);
		}
		if (confirmedDuplicateReferences.length > 0) {
			// INT has one or more existing Confirmed Duplicate references
			for (var j = 0; j < confirmedDuplicateReferences.length; j++) {
				var confirmedDuplicateReference = confirmedDuplicateReferences[j];
				var confirmedDuplicateReferenceTargetID = confirmedDuplicateReference.getTarget().getID();
				log("... ... confirmedDuplicateReferenceTargetID: " + confirmedDuplicateReferenceTargetID);
				if (EXTs.indexOf(confirmedDuplicateReferenceTargetID) == -1) {
					// Confirmed Duplicate reference points to an EXT not being linked to the Golden Record (Should never happen though)
					log("... ... Reference points to an EXT which is not included in current Golden Record so delete reference");
					confirmedDuplicateReference.delete();
					if (externalSourceRecords && externalSourceRecords.length > 0) {
						log("... ... Create new Confirmed Duplicate reference to " + externalSourceRecords[0].getID());
						internalSourceRecord.createReference(externalSourceRecords[0], confirmedDuplicateReferenceType);
					}
				} else {
					log("... ... Reference points to an EXT included in current Golden Record so keep reference");
				}
			}
		} 
	}
}

function maintainINT2EXTReferences (goldenRecord, internalSourceRecords) {
	/* ----------------------------------------------------------------------------------------------------------------------
	 *  Creation and Deletion of references between the Internal Source Record and the External Source Record,
	 *  to reflect the references between the Golden Record and its sources (PMDM.PRT.GoldenToSourceRecord is the reference type between the Golden Record and its sources).
	 *  Requirement: from the Internal Source Record, we may need to view data which is on the External Source Records. 
	 *  To do that, a reference between the Internal Source Records and the External Source Records is maintained (Reference type: PMDM.PRT.INT2EXT)
	 *  
	 *  Step 1. First, all the references of type PMDM.PRT.GoldenToSourceRecord are scanned. For each of them, there must be an equivalent reference of type PMDM.PRT.INT2EXT between the Internal Source Record and the External Source Records.
	 *  Step 2. Then, all the references of type PMDM.PRT.INT2EXT are looped through. If one of them does not have an equivalent of type PMDM.PRT.GoldenToSourceRecord, it is deleted.
	 *  
	 *  ---------------------------------------------------------------------------------------------------------------------
	 */
	
	log("-----------------------------------------------------------");
	log("Create and maintain references between the INT and the EXTs");
	log("-----------------------------------------------------------");
	
	/*  Step 1
	 *  ------
	 *  All the references of type PMDM.PRT.GoldenToSourceRecord are scanned. For each of them, there must be an equivalent reference of type PMDM.PRT.INT2EXT between the External Source Record and the Internal Source Record.
	 */
	log("### Step 1 ###");
	// List all the goldenRecord references to EXT
	var goldenRecordReferences = goldenRecord.getReferences(goldenToSourceReferenceType).toArray();
	if (goldenRecordReferences.length > 0) {
		log("Number of " + goldenToSourceReferenceType.getID() + " references from Golden Record: " + goldenRecordReferences.length);
		goldenRecordReferences.forEach(
			function(refSourceRecord) {
				var targetObjectTypeID = refSourceRecord.getTarget().getObjectType().getID();
				log("Target object: " + refSourceRecord.getTarget().getID() + ", type: " + targetObjectTypeID);
				if (targetObjectTypeID.equals(externalSourceRecordType.getID())) {
					// If not already exists, create a reference of type PMDM.PRT.EXT2INT between internalSourceRecord and externalSourceRecord
					for (var i = 0; i < internalSourceRecords.length; i++) {
						var internalSourceRecord = internalSourceRecords[i];
						log("... internalSourceRecord: " + internalSourceRecord.getID());
						var existingReferenceExists = isINT2EXT(internalSourceRecord, refSourceRecord.getTarget());
						log("... ... Is there a reference between INT (" + internalSourceRecord.getID() + ") and EXT (" + refSourceRecord.getTarget().getID() + ") ? " + existingReferenceExists);
						if (!existingReferenceExists) {
							log("... ... Create " + internalSourceToExternalSourceReferenceType.getID() + " reference from " + internalSourceRecord.getID() + " to " + refSourceRecord.getTarget().getID());
							internalSourceRecord.createReference(refSourceRecord.getTarget(), internalSourceToExternalSourceReferenceType);
						}
					}
	
					// Populate the EXTs array
					nbEXTs = EXTs.push(refSourceRecord.getTarget().getID()); // Ca je ne suis pas sûr. J'en suis là.
					log("... EXT added to EXTs array: " + refSourceRecord.getTarget().getID());
				}
	
				if (targetObjectTypeID == "PMDM.PRD.InternalSourceRecord") {
					// Populate the INTs array
					nbINTs = INTs.push(refSourceRecord.getTarget().getID());
					log("... INT added to INTs array: " + refSourceRecord.getTarget().getID());
				}
	
			}
		);
	
		log("----------------------------------------------------------------");
		log(nbEXTs + " EXT's linked to Golden Record: " + EXTs);
		log(nbINTs + " INT's linked to Golden Record: " + INTs);
		log("----------------------------------------------------------------");
	
		/*  Step 2 
		 *  ------
		 *   
		 *  All the references of type PMDM.PRT.INT2EXT are looped through. If one of them does not have an equivalent of type PMDM.PRT.GoldenToSourceRecord, it is deleted.
		 */
		log("### Step 2 ###");
		var isFound = false;
		var internalSourceRecord;
	
		for (var i = 0; i < internalSourceRecords.length; i++) {
			var internalSourceRecord = internalSourceRecords[i];
			log("internalSourceRecord: " + internalSourceRecord.getID());
			internalSourceRecord.getReferences(internalSourceToExternalSourceReferenceType).toArray().forEach(
				function(refINT2EXT) {
					var refINT2EXTTargetID = refINT2EXT.getTarget().getID();
					log("... Search for " + refINT2EXTTargetID + " : Position: " + EXTs.indexOf(refINT2EXTTargetID));
					if (EXTs.indexOf(refINT2EXTTargetID) == -1) {
						log("... ... " + refINT2EXTTargetID + " was not found in EXTs array so delete the reference.");
						refINT2EXT.delete();
					} else {
						log("... ... " + refINT2EXTTargetID + " was found in EXTs array");
					}
				}
			);
		}
	}
	
	/*  --------------------------------------------------------------------------------------------------------
	    Maintenance of the reference between the INT and the EXT. Ensure that there are no orphan INTs.
	
	   	On the GOLD:
			For each EXT
				If there is an INT
					If this INT is not linked to the same GOLD then delete the link between the INT and the EXT
	    --------------------------------------------------------------------------------------------------------
	*/
	
	log("-------------------------------------------");
	log("Ensure there is no PMDM.PRT.INT2EXT orphans");
	log("-------------------------------------------");
	
	// For each EXT linked from the GOLD (goldenToSourceReferenceType)
	var goldenToSourceReferences = goldenRecord.getReferences(goldenToSourceReferenceType).toArray();
	if (goldenToSourceReferences.length > 0) {
		log("Number of references from Golden Record: " + goldenRecordReferences.length);
		goldenToSourceReferences.forEach(
			function(goldenToSourceReference) {
				var goldenToSourceReferenceTarget = goldenToSourceReference.getTarget();
				log(goldenToSourceReferenceType.getID() + " target object: " + goldenToSourceReferenceTarget.getID() + ", type: " + goldenToSourceReferenceTarget.getObjectType().getID());
				if (goldenToSourceReferenceTarget.getObjectType().getID().equals(externalSourceRecordType.getID())) {
					var internalSourceRecordsFromExternalSourceRecord = getAllINT2EXT(goldenToSourceReferenceTarget);
					for (var i = 0; i < internalSourceRecordsFromExternalSourceRecord.length; i++) {
						var internalSourceRecordFromExternalSourceRecord = internalSourceRecordsFromExternalSourceRecord[i];
						log("... internalSourceRecordFromExternalSourceRecord: " + internalSourceRecordFromExternalSourceRecord.getID());
						if (INTs.indexOf(internalSourceRecordFromExternalSourceRecord.getID()) >= 0) {
							// INT is official
							log("... ... " + internalSourceRecordFromExternalSourceRecord.getID() + " is referenced from Golden Record so keep link");
						} else {
							log("... ... " + internalSourceRecordFromExternalSourceRecord.getID() + " is NOT referenced from Golden Record so delete the link to " + goldenToSourceReferenceTarget.getID());
							deleteReference(internalSourceRecordFromExternalSourceRecord, goldenToSourceReferenceTarget, internalSourceToExternalSourceReferenceType)
						}
					}
				}
			}
		);
	}	
}

function maintainGR2INTReferences(goldenRecord, internalSourceRecords) {
	// ----------------------------------------------------------------------------------------------------------------------
	//  Creation and Deletion of PMDM.PRT.GR2INT references between the Golden Record and the Internal Source Record(s)
	//  These references are used to identify the INT which the Golden Record was linked to previously if the INT being unlinked as part of the matching
	//  ---------------------------------------------------------------------------------------------------------------------

	log("------------------------------------------------- ----------");
	log("Create and maintain references between the GR and the INT(s)");
	log("-------------------------------------------------- ---------");

	var internalSourceRecordIDs = [];
	internalSourceRecords.forEach(
		function(internalSourceRecord) {
			internalSourceRecordIDs.push(internalSourceRecord.getID());
		}
	);
	log("Internal Source Records via PMDM.PRT.GoldenToSourceRecord: " + internalSourceRecordIDs);
	
	goldenRecord.getReferences(goldenToInternalSourceReferenceType).toArray().forEach(
		function(reference) {
			var referenceTargetID = reference.getTarget().getID()
			log("... Check PMDM.PRT.GR2INT reference to " + referenceTargetID);
			var internalSourceRecordIndex = internalSourceRecordIDs.indexOf(referenceTargetID)
			if (internalSourceRecordIndex > -1) {
				internalSourceRecordIDs.splice(internalSourceRecordIndex, 1);
				log("... ... Reference exists for both reference types");
			} else if (internalSourceRecordIndex == -1) {
				log("... ... Deleting MDM.PRT.GR2INT reference");
				reference.delete();
			}
		}
	);

	log("Create references to the following Internal Source Records: " + internalSourceRecordIDs);

	for (var i = 0; i < internalSourceRecordIDs.length; i++) {
		var internalSourceRecordID = internalSourceRecordIDs[i];
		var targetRecord = manager.getProductHome().getProductByID(internalSourceRecordID);
		log("... Create MDM.PRT.GR2INT reference to " + targetRecord.getID());
		goldenRecord.createReference(targetRecord, goldenToInternalSourceReferenceType);
	}
}

function getInternalSourceRecordViaGR2INT(goldenRecord) {
	var internalSourceRecordsFromGoldenRecord = getAllGR2INT(goldenRecord);
	for (var i = 0; i < internalSourceRecordsFromGoldenRecord.length; i++) {
		var internalSourceRecordFromGoldenRecord = internalSourceRecordsFromGoldenRecord[i];
		log("... Checking INT: " + internalSourceRecordFromGoldenRecord.getID());
		var goldenRecordForSource = getGoldenFromSourceBusinessFunction.evaluate({"node" : internalSourceRecordFromGoldenRecord});
		if (!goldenRecordForSource) {
			log("... ... No Golden for INT so use this")
			return internalSourceRecordFromGoldenRecord;
		} else {
			log("... ... Golden Record for INT: " + goldenRecordForSource.getID());
		}
	}
}

/*  ----------------------------------------------------------------------------------------------------------------------
 *  Main
 *  ----------------------------------------------------------------------------------------------------------------------
 */

/*
 * Check if there is an Internal Source Record attached to the current Golden Record. 
 * If not, check if an existing INT has a PMDM.PRT.INT2GR reference to the Golden Record. 
 * If yes, link the INT found to Golden Record.
 * If not, create a new INT, link it to the Golden Record, copy necessary values from GR to INT, start it in a workflow and approve the INT.
 */

log("--------------------------------------------------------");
log("Create an Internal Source Record for " + goldenRecord.getID() + " if needed");
log("--------------------------------------------------------");

// Get all External Source Records linked from the Golden Record
var allExternalSourceRecords = getAllExternalFromGoldenBusinessFunction.evaluate({"node" : goldenRecord});
var externalSourceRecords = allExternalSourceRecords.toArray();

var internalSourceRecords = getAllInternalSourceRecords(goldenRecord);
if (internalSourceRecords.length == 0) {
	// Check if the GR has an existing PMDM.PRT.GR2INT reference to an INT. If yes, link INT to GR
	log("The Golden Record has no Internal Source Record so check if an Internal Source Record in linked using PMDM.PRT.GR2INT")
	internalSourceRecord = getInternalSourceRecordViaGR2INT(goldenRecord);

	if (internalSourceRecord) {
		log("... internalSourceRecord found via PMDM.PRT.INT2GR: " + internalSourceRecord.getID());
		goldenRecord.createReference(internalSourceRecord, goldenToSourceReferenceType);
		log("... Reference created");
		// Add a matching message so it can be catched in the Golden Record Gating workflow
		goldenRecord.getValue("PMDM.AT.MatchingMessages").addValue("The Golden Record had no Internal Source Record linked so the previous used " + internalSourceRecord.getID() + " has been relinked");
		internalSourceRecords.push(internalSourceRecord);
	} else {
		// There is no Internal Source Record so we will create one.
		// The Internal Source Record has to be created at the same level as the Golden Record.
		log("The Golden Record has no Internal Source Record so a new will be created")
		internalSourceRecord = goldenRecord.getParent().createProduct("", "PMDM.PRD.InternalSourceRecord");
	
		// Blocking the Golden Record from going out to downstream at this point in time
		// The block will be removed when the INT enters "Waiting for Gating" during onboarding
		goldenRecord.getValue(blockPublishToERPAttribute.getID()).setLOVValueByID("Y");
		goldenRecord.getValue(blockPublishToEcommerceAttribute.getID()).setLOVValueByID("Y");
	
		// Add INT to internalSourceRecords array
		internalSourceRecords.push(internalSourceRecord);
	
		// ------------------------------------------------
		// Enrichment of the created Internal Source Record
		// ------------------------------------------------
	
		// Set name on Internal Source Record
		internalSourceRecord.setName(goldenRecord.getName());
	
		// Create a reference from the Golden Record to the Internal Source Record
		goldenRecord.createReference(internalSourceRecord, goldenToSourceReferenceType);

		/*
		 * If there is a requirement to use clerical reveiw for matching & linking then 
		 * the creation of a Confirmed Duplicate references can be enabled to create/maintain confirmed 
		 * duplicate reference between the Internal Source Record and the External Source Record 
		 * that caused the Golden Record to be created in the first place.
		 */
		// Create a Confirmed Duplicate reference from the Internal Source Record to an External Source Record
		//if (externalSourceRecords && externalSourceRecords.length > 0) {
		//	internalSourceRecord.createReference(externalSourceRecords[0], confirmedDuplicateReferenceType);
		//}

		// Set Source Rank for Promotion - hardcoded to MDM
		internalSourceRecord.getValue("MatchingDataSource").setSimpleValue("MDM");

		// Copy GTIN from Golden Record
		// PIM for Retail is delivered with matching on GTIN only which is why this is hardcoded. 
		var goldenRecordGtinValue = goldenRecord.getValue("PMDM.AT.GTIN");
		if (goldenRecordGtinValue) {
			internalSourceRecord.getValue("PMDM.AT.GTIN").setSimpleValue(goldenRecordGtinValue.getSimpleValue());
			log("... GTIN copied to INT");
		}

		// Copy attribute values and references from Golden Record to Internal Source Record
		// ### IMPORTANT: If additional attributes than GTIN are used for matching then they MUST be added to the PMDM.ATG.CopyToInternalSourceRecord attribute group ###
		copyAttributeValuesCrossContext(goldenRecord, internalSourceRecord, copyToInternalSourceRecordAttributeGroup);
		copyReferences(goldenRecord, internalSourceRecord, copyToInternalSourceRecordAttributeGroup);
		//copyAttributeValuesAndReferences(goldenRecord, internalSourceRecord, copyToInternalSourceRecordAttributeGroup);

		// Handle internal packaging
		if ("Y".equals(configurationObject.getValue(useInternalPackaging.getID()).getID())) {
			handleInternalPackaging(goldenRecord, internalSourceRecord);
		}

		// Set default translation languages on Internal Source Record
		setDefaultTranslations(internalSourceRecord);

		// Start the new Internal Source Record in Internal Source Record Creation workflow
		var internalSourceRecordCreationWorkflow = internalSourceRecord.startWorkflowByID("PMDM.WF.InternalSourceRecordCreation", "Initiated in workflow");

		// Make an initial approved of the INT
		approveInternalSourceRecord(internalSourceRecord);

		log("Internal Source Record created : " + internalSourceRecord.getID());
	}	
} else {
	log("There is already one or more Internal Source Record(s) for this Golden Record");
}

// Maintain PMDM.PRT.GR2INT references between the Golden Record and the Internal Source Record(s)
maintainGR2INTReferences(goldenRecord, internalSourceRecords);

// Maintain PMDM.PRT.INT2EXT references between the Internal Source Record(s) and the External Source Record(s)
// This reference is used in the WebUI on an Internal Source Record screen to view data stored on the related External Source Record(s)
maintainINT2EXTReferences(goldenRecord, internalSourceRecords);

/*
 * If there is a requirement to use clerical reveiw for matching & linking then 
 * maintainConfirmedDuplicateReferences can be enabled to create/maintain confirmed 
 * duplicate reference between the Internal Source Record and the External Source Record 
 * that caused the Golden Record to be created in the first place.
 */
// Maintain confirmedDuplicateReferenceType
//maintainConfirmedDuplicateReferences(internalSourceRecords, externalSourceRecords);

}