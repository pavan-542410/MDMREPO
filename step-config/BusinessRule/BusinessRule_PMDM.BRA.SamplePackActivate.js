/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.SamplePackActivate",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "1 - Sample Pack : activate",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,logger) {
/*	-------------------------------------------------------------------------------------
 * 	SAMPLE PACK - Activate
 * 	
 * 	Performs actions to make the Sample Pack Data ready to use, in this order:
 * 	For all products
 * 		Approve supplier classifications 
 * 		Approve supplier product folder 
 * 		Approve supplier asset cmassofocatop,
 * 		Approve supplier locations
 * 		Approve asset classification
 * 	
 * 	For guitars
 * 		Approve assets for the EXTs everywhere (productimage)
 * 		
 * 	For all products
 * 		Approve web classification
 * 	
 * 	For guitars
 * 		INT>approve
 * 		EXT>approve
 * 		put INTs in translation wf	
 * 	
 * 	For the EXT EXCLUDING the guitars
 * 		Put EXTs in the ext creation wf > Proposal approval buyer
 * 	
 * 	-------------------------------------------------------------------------------------
 */


function ApproveClassif(c) {
    if (c.getApprovalStatus() === com.stibo.core.domain.workspaceaware.ApprovalStatus.NotInApproved) {
        c.approve();
    }
    
    if (c.getChildren().size() > 0) {
        for (i in Iterator(c.getChildren())) {
            ApproveClassif(i);
        }
    }
}

function ApproveClassifAndAssets(c) {
	// Approve classification
	if (c.getApprovalStatus() === com.stibo.core.domain.workspaceaware.ApprovalStatus.NotInApproved) {
		c.approve();
	}

	// Approve all assets linked to classification
	var linkedAssets = c.getAssets().toArray();
	for (var a = 0; a < linkedAssets.length; a++) {
		var linkedAsset = linkedAssets[a];
		if (linkedAsset.getApprovalStatus() === com.stibo.core.domain.workspaceaware.ApprovalStatus.NotInApproved) {
			linkedAsset.approve();
		}
	}

	if (c.getChildren().size() > 0) {
		for (i in Iterator(c.getChildren())) {
			ApproveClassifAndAssets(i);
		}
	}
}

function ApprovedReferencedObjects(startNode, refTypeName) {
	// From the object startNode, approves all objects referenced with the reference type name "refTypeName"
	var refType = manager.getReferenceTypeHome().getReferenceTypeByID(refTypeName);
	if (refType) {
		var refs = startNode.queryReferences(refType);
		if (refs) {
			startNode.queryReferences(refType).forEach(
				function (reference) {
					var target = reference.getTarget();
					if (target.getApprovalStatus() === com.stibo.core.domain.workspaceaware.ApprovalStatus.NotInApproved) {
						target.approve();
					}
					return true;
				}
			);
		}
	} else {
		throw "Reference type \"" + refTypeName + "\" not found in function \"ApproovedReferenceObjects\"";
	}
}

// Approve Suplier classifications and children classifications
ApproveClassif(manager.getClassificationHome().getClassificationByID("SupplierClassificationsRoot"));

// Approve Product Image classifications and assets
ApproveClassifAndAssets(manager.getClassificationHome().getClassificationByID("ProductImageRoot"));

// For guitars, approve all assets
var guitarsEXTs = ["tstEXT-100904", "tstEXT-102933", "tstEXT-102994", "tstEXT-102292", "tstEXT-101015", "tstEXT-102969", "tstEXT-102938", "tstEXT-100459", "tstEXT-102287", "tstEXT-102059", "tstEXT-101999", "tstEXT-102269", "tstEXT-102296", "tstEXT-101017", "tstEXT-102063", "tstEXT-106469", "tstEXT-102978", "tstEXT-101287", "tstEXT-102900", "tstEXT-102908", "tstEXT-102918", "tstEXT-102999", "tstEXT-102117", "tstEXT-101307", "tstEXT-102889", "tstEXT-102913", "tstEXT-101420", "tstEXT-102256", "tstEXT-102277", "tstEXT-102260", "tstEXT-102981", "tstEXT-102952", "tstEXT-102273", "tstEXT-101303", "tstEXT-102957", "tstEXT-101278", "tstEXT-102923", "tstEXT-102264", "tstEXT-101295", "tstEXT-106474", "tstEXT-101414", "tstEXT-102989", "tstEXT-101311", "tstEXT-102928", "tstEXT-101317", "tstEXT-102962", "tstEXT-102283", "tstEXT-102947", "tstEXT-101279", "tstEXT-101026"];
var refTypeNames = ["PMDM.IDRT.InstallationManual", "PMDM.IDRT.OwnersManual", "PMDM.IDRT.PrimaryProductImage", "PMDM.IDRT.ProductImages"];
for (var i = 0; i < guitarsEXTs.length; i++) {
	var EXT = manager.getProductHome().getProductByID(guitarsEXTs[i]);
	if (EXT) {
		for (var r = 0; r < refTypeNames.length; r++) {
			ApprovedReferencedObjects(EXT, refTypeNames[r]);
			// Approve all assets referenced by the reference types contained in the array "refTypeNames":
		}
	} else {
		logger.warning("Product with ID " + guitarsEXTs[i] + " not found");
	}
}

// For all products approve web classification
ApproveClassif(manager.getClassificationHome().getClassificationByID("WebHierarchyRoot"));

//  For guitars EXT>approve
for (var i = 0; i < guitarsEXTs.length; i++) {
	var EXT = manager.getProductHome().getProductByID(guitarsEXTs[i]);
	if (EXT) {
		if (EXT.getApprovalStatus() === com.stibo.core.domain.workspaceaware.ApprovalStatus.NotInApproved) {
			EXT.approve();
		}
	} else {
		logger.warning("Product with ID " + guitarsEXTs[i] + " not found");
	}
}

//  For guitars INT> approve, start in WF translation

/*  The configuration object must be set to translate products:
	ConfigurationObject
		PMDM.AT.TranslationDefaultFrench based on PMDM.LOV.TranslationDefault, set it to "Enabled"
		PMDM.AT.TranslationDefaultGerman: the same
		PMDM.AT.TranslationHandlingFrench based on PMDM.LOV.TranslationHandling, set it to "PIM"
		PMDM.AT.TranslationHandlingGerman based on PMDM.LOV.TranslationHandling, set it to "PIM"

	*/

var conf = manager.getEntityHome().getEntityByID("ConfigurationObject");

conf.getValue("PMDM.AT.TranslationDefaultFrench").setLOVValueByID("Enabled");
conf.getValue("PMDM.AT.TranslationDefaultGerman").setLOVValueByID("Enabled");
conf.getValue("PMDM.AT.TranslationHandlingFrench").setLOVValueByID("PIM");
conf.getValue("PMDM.AT.TranslationHandlingGerman").setLOVValueByID("PIM");

var guitarINTs = ["tstINT-100904", "tstINT-102933", "tstINT-102994", "tstINT-102292", "tstINT-101015", "tstINT-102969", "tstINT-102938", "tstINT-100459", "tstINT-102287", "tstINT-102059", "tstINT-101999", "tstINT-102269", "tstINT-102296", "tstINT-101017", "tstINT-102063", "tstINT-106469", "tstINT-102978", "tstINT-101287", "tstINT-102900", "tstINT-102908", "tstINT-102918", "tstINT-102999", "tstINT-102117", "tstINT-101307", "tstINT-102889", "tstINT-102913", "tstINT-101420", "tstINT-102256", "tstINT-102277", "tstINT-102260", "tstINT-102981", "tstINT-102952", "tstINT-102273", "tstINT-101303", "tstINT-102957", "tstINT-101278", "tstINT-102923", "tstINT-102264", "tstINT-101295", "tstINT-106474", "tstINT-101414", "tstINT-102989", "tstINT-101311", "tstINT-102928", "tstINT-101317", "tstINT-102962", "tstINT-102283", "tstINT-102947", "tstINT-101279", "tstINT-101026"];
for (var i = 0; i < guitarINTs.length; i++) {
	var INT = manager.getProductHome().getProductByID(guitarINTs[i]);
	if (INT) {
		if (INT.getApprovalStatus() === com.stibo.core.domain.workspaceaware.ApprovalStatus.NotInApproved) {
			INT.approve();
		}
		// Start in PMDM.WF.Translation
		if (INT.isInWorkflow("PMDM.WF.Translation")) {
			INT.getWorkflowInstance(manager.getWorkflowHome().getWorkflowByID("PMDM.WF.Translation")).delete("");
		}
		INT.startWorkflowByID("PMDM.WF.Translation","");
	} else {
		logger.warning("Product with ID " + guitarINTs[i] + " not found");
	}
}

// For the EXT EXCLUDING the guitars, Put EXTs in the ext creation wf > Proposal approval buyer
var EXTs = ["tstEXT-309230", "tstEXT-309231", "tstEXT-309178", "tstEXT-309189", "tstEXT-309177", "tstEXT-309199", "tstEXT-309200", "tstEXT-309183", "tstEXT-309184", "tstEXT-309188", "tstEXT-309187", "tstEXT-309202", "tstEXT-309201", "tstEXT-309205", "tstEXT-309206", "tstEXT-309207", "tstEXT-309204", "tstEXT-309214", "tstEXT-309215", "tstEXT-309216", "tstEXT-309219", "tstEXT-309217", "tstEXT-309218", "tstEXT-309211", "tstEXT-309212", "tstEXT-309213", "tstEXT-309209", "tstEXT-309210", "tstEXT-309167", "tstEXT-309168", "tstEXT-309179", "tstEXT-309192", "tstEXT-309197", "tstEXT-309198", "tstEXT-309169", "tstEXT-309222", "tstEXT-309223", "tstEXT-309220", "tstEXT-309221", "tstEXT-309172"];

var workflow = manager.getWorkflowHome().getWorkflowByID("PMDM.WF.ExternalSourceRecordHandling");
for (var i = 0; i < EXTs.length; i++) {
	var EXT = manager.getProductHome().getProductByID(EXTs[i]);
	if (EXT) {
		// Start in PMDM.WF.Translation
		if (EXT.isInWorkflow("PMDM.WF.ExternalSourceRecordHandling")) {
			EXT.getWorkflowInstance(workflow).delete("");
		}
		EXT.startWorkflowByID("PMDM.WF.ExternalSourceRecordHandling","");
		if (EXT.isInWorkflow("PMDM.WF.ExternalSourceRecordHandling")) {
			var task = EXT.getTaskByID("PMDM.WF.ExternalSourceRecordHandling", "Proposal");
			if (task) {
				task.triggerByID("Submit", "");
			}
		}

	} else {
		logger.warning("Product with ID " + EXTs[i] + " not found");
	}
}

}