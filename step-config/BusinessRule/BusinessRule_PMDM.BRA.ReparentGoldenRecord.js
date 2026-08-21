/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.ReparentGoldenRecord",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Reparent Golden Record",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.GoldenRecord" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "PMDM.BRL.PDS.Library",
    "libraryAlias" : "PDSLib"
  }, {
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "goldenToSourceReference",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "PMDM.PRT.GoldenToSourceRecord",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "internalSourceRecordType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.InternalSourceRecord",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "externalSourceRecordType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.ExternalSourceRecord",
    "description" : null
  }, {
    "contract" : "ProductBindContract",
    "alias" : "defaultParent",
    "parameterClass" : "com.stibo.core.domain.impl.FrontProductImpl",
    "value" : "INT.UnCatLevel1",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "eventQueue",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.FrontEventQueueImpl",
    "value" : "step://eventqueue?id=PMDM.EQ.PDS.EventQueue",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "internalMasterProductType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "PMDM.PRD.InternalMasterProduct",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (goldenRecord,manager,logger,goldenToSourceReference,internalSourceRecordType,externalSourceRecordType,defaultParent,eventQueue,internalMasterProductType,PDSLib,logLib) {
//check if the golden record (GR) is under the same parent as the linked internal source record (INT) and external source record (EXT). If it isn't, move it.
//if an INT exists, the GR must be in the same parent in the internal structure
//if an INT does not exist yet, then the INT and GR shall be placed in the internal structure like the EXT is placed in the external structure. (If ID's correspond).
// if the internal and external structures do not correspond (e.g. as external is a data supplier structure with different setup) (not GS1/Segment/Family/Brick) then leave it
//if an INT exists, then the EXT shall be replaced in the External structure like the INT / GR is (check on structure types).

//the INT is the master !!
var forceLog = false;
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.ReparentGoldenRe_Message").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // 'The Golden Record %s neither has any Internal - nor External Source Records which means it cannot be moved to another place in the tree.'

function log(message) {
	logLib.log(logger, "Reparent Golden Record: " + message, forceLog);
}

function getInternalSourceRecord() {
	var refs = goldenRecord.getReferences(goldenToSourceReference);
	for (var i = 0; i < refs.size(); i++) {
		var target = refs.get(i).getTarget();
		if (target.getObjectType().getID().equals(internalSourceRecordType.getID())) {
			return target;
		}
	}
	return null;
}

function getFirstExternalSourceRecord() {
	var refs = goldenRecord.getReferences(goldenToSourceReference);
	for (var i = 0; i < refs.size(); i++) {
		var target = refs.get(i).getTarget();
		if (target.getObjectType().getID().equals(externalSourceRecordType.getID())) {
			log("found EXT: " + target.getID());
			return target;
		}
	}
	return null;
}

function getCorrespondingInternalProductHierarchyParent(externalsourceRecord) {
	log("getCorrespondingInternalProductHierarchyParent");
	var externalProductHierarchyParent = externalsourceRecord.getParent();
	var externalProductHierarchyParentID = externalProductHierarchyParent.getID() + "";
	log("... externalProductHierarchyParentID: " + externalProductHierarchyParentID);
	var id_without_prefix = externalProductHierarchyParentID.split(".")[1];
	var internalProductHierarchyParentID = "INT." + id_without_prefix;
	log("... internalProductHierarchyParentID: " + internalProductHierarchyParentID);
	var internalProductHierarchyParent = manager.getProductHome().getProductByID(internalProductHierarchyParentID);
	log("... internalProductHierarchyParent: " + internalProductHierarchyParent);

	if (!internalProductHierarchyParent) {
		log("... Cannot find an internal Product Hierarchy Parent corresponding to " + externalProductHierarchyParentID);
	}

	return internalProductHierarchyParent;
}

function handleExternalSourceRecords(internalSourceRecordParent) {
	log("handleExternalSourceRecords");
	log("... internalSourceRecordParent: " + internalSourceRecordParent.getID());
	var internalSourceRecordParentID = internalSourceRecordParent.getID();
	var id_without_prefix = (internalSourceRecordParentID + "").split(".")[1];
	var refs = goldenRecord.getReferences(goldenToSourceReference);
	for (var i = 0; i < refs.size(); i++) {
		var target = refs.get(i).getTarget();
		if (target.getObjectType().getID().equals(externalSourceRecordType.getID())) {
			log("... externalSourceRecord: " + target.getID());
			var currentExternalSourceRecordParent = target.getParent();
			log("... ... currentExternalSourceRecordParent: " + currentExternalSourceRecordParent.getID());
			var externalProductHierarchyParentID = "EXT." + id_without_prefix;
			var externalProductHierarchyParent = manager.getProductHome().getProductByID(externalProductHierarchyParentID);
			if (externalProductHierarchyParent && !currentExternalSourceRecordParent.getID().equals(externalProductHierarchyParentID)) {
				log("... ... externalProductHierarchyParent: " + externalProductHierarchyParent.getID());
				var pdsID = target.getValue("PMDM.AT.PDS.pdsid").getSimpleValue();
				if (pdsID) {
					// If onboarded via PDS then create event + add message - if last MessageToSupplier entry was not the same
					log("... ... ... The externalSourceRecord (" + target.getID() + ") is onboarded via PDS so notifiy Supplier that it should be re-classified in PDS");
					var messageToSupplierValue = target.getValue("PMDM.AT.MessagesToSupplier");
					if (messageToSupplierValue) {
						// Add message to Supplier
						var moveInPDSMessage = "Returned: Please move product from '" + currentExternalSourceRecordParent.getName() + "' to '" + internalSourceRecordParent.getName() + "'";
						log("... ... ... moveInPDSMessage: " + moveInPDSMessage);
						var addMessage = true;
						var values = new java.util.ArrayList(messageToSupplierValue.getValues());
						var valuesSize = values.size();
						if (valuesSize > 0) {
							var lastMessage = values.get(0).getSimpleValue() + "";
							log("... ... ... lastMessage: " + lastMessage);
							if (moveInPDSMessage.equals(lastMessage)) {
								log("... ... ... New message is the same as the last message so don't add");
								addMessage = false;
							}
						} 
						
						if (addMessage) {
							log("... ... ... Will now add move message to SupplierProcessNotes and return product to PDS");
							PDSLib.PDSSupplierProcessNotes(target, moveInPDSMessage, true, true, logger);
	
							// Set PDS status and generate event
							target.getValue("PMDM.AT.PDS.WorkflowEvent").setLOVValueByID("PDS_RETURNED");
							eventQueue.republish(target);							
						}
					}
				} else {
					// Else move EXT
					target.setParent(externalProductHierarchyParent);
					log("... " + target.getID() + " has been moved to: " + externalProductHierarchyParentID);
				}
			}
		}
	}
}

//-------   starts here  ------//
var currentGoldenRecordParentID = goldenRecord.getParent().getID();
log("golderRecordID: " + goldenRecord.getID() + ", currentGoldenRecordParentID: " + currentGoldenRecordParentID);
var internalSourceRecord = getInternalSourceRecord();
var internalSourceRecordParent = null;
if (internalSourceRecord === null) {
	log("Couldn't find internalSourceRecord, so instead now trying to find a corresponding internalProductHierarchyParent by looking up an externalSourceRecord parent");
	var externalsourceRecord = getFirstExternalSourceRecord();
	if (externalsourceRecord) {
		internalSourceRecordParent = getCorrespondingInternalProductHierarchyParent(externalsourceRecord);
		if (internalSourceRecordParent) {
			if (!internalSourceRecordParent.getID().equals(currentGoldenRecordParentID)) {
				goldenRecord.setParent(internalSourceRecordParent);
				log("goldenRecord has been moved from " + currentGoldenRecordParentID + " to " + internalSourceRecordParent.getID());
			}
		} else {
			goldenRecord.setParent(defaultParent);
			log("goldenRecord has been moved to default parent");
		}
	} else {
		log("This goldenRecord neither has any internalSourceRecord nor externalSourceRecord which means it cannot be moved to another place in the tree.");
		var message = (msg1+ "").replace("%s", goldenRecord.getID()); // 'The Golden Record %s neither has any Internal - nor External Source Records which means it cannot be moved to another place in the tree.'
		throw(message);
	}
} else {
	log("internalSourceRecord found (" + internalSourceRecord.getID() + ") so use it for reparenting");
	internalSourceRecordParent = internalSourceRecord.getParent();
	if (internalSourceRecordParent.getObjectType().getID().equals(internalMasterProductType.getID())) {
		internalSourceRecordParent = internalSourceRecordParent.getParent();
		log("... internalSourceRecord is below a Master Product. Traverse one level up and use " + internalSourceRecordParent.getID() + " as parent for golden record");
	}
	var goldenRecordParent = goldenRecord.getParent();

	if (!internalSourceRecordParent.getID().equals(goldenRecordParent.getID())) {
		goldenRecord.setParent(internalSourceRecordParent);
	}
}

if (internalSourceRecordParent) {
	handleExternalSourceRecords(internalSourceRecordParent);
}
}