/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.ApproveExternalAndPackaging",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Approve External Source Record and Packaging",
  "description" : "Approves the External Source Record as well as all linked packaging objects.",
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.ExternalSourceRecord" ],
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
    "contract" : "BusinessFunctionBindContract",
    "alias" : "getAllPackagingFromExternalBusinessFunction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>PMDM.BF.GetAllPackagingFromExternal</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,manager,getAllPackagingFromExternalBusinessFunction,logLib) {
var forceLog = false;
var msg1 = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.ApproveExternalAnd_msg1").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // 'Parent node has never been approved so "%s" cannot be approved.'

function log(message) {
	logLib.log(logger, "Approve Node and Packaging: " + message, forceLog);
}

function getChild(parent, title, classificationType, byID) {
	title = title.replace(" ", "_");
	log("... ... getChild(" + title + ")");
	var children = parent.getChildren().toArray();
	for (var i = 0; i < children.length; i++) {
		if (byID) {
			if (title.equalsIgnoreCase(children[i].getObjectType().getID())) {
				return children[i];
			}
		} else {
			if (title.equalsIgnoreCase(children[i].getTitle())) {
				return children[i];
			}
		}
	}
	if (byID) {
		return null;
	}
	log("... ... Create new asset classification");
	var objType = manager.getObjectTypeHome().getObjectTypeByID(classificationType);
	var newClassification = parent.createClassification("", objType);
	newClassification.setName(title.toUpperCase());
	newClassification.approve();
	return newClassification;
}

function isBelowAssets(top) {
	if (top == null) {
		return false;
	}
	var parent = top.getParent();
	if (parent != null && "AssetsRoot".equals(top.getParent().getID())) {
		return true;
	}
	return isBelowAssets(parent);
}

function relinkAsset(asset) {
	var objType = asset.getObjectType().getID();
	log("... ... classify and approve asset [" + asset.getTitle() + "] objType=[" + objType + "]");
	var assetRoot = manager.getClassificationHome().getClassificationByID("AssetsRoot");

	// link asset to asset root if not already linked
	var currentClassifications = asset.getClassifications().toArray();

	var linkedBelowRoot = false;
	for (var i = 0; i < currentClassifications.length; i++) {
		if (isBelowAssets(currentClassifications[i])) {
			log("... ... Asset is already linked to [" + currentClassifications[i].getID() + "] below AssetRoot");
			var linkedBelowRoot = true;
		}
	}

	if (!linkedBelowRoot) {
		// the recategorize asset
		var level1 = getChild(assetRoot, objType + "Root", null, true);
		if (level1 != null) {
			var level2 = getChild(level1, asset.getTitle().substring(0, 1), "AssetLevel1", false);
			if (level2 != null) {
				var level3 = getChild(level2, asset.getTitle().substring(0, 2), "AssetLevel2", false);
				if (level3 != null) {
					asset.addClassification(level3);
					log("... ... Asset linked to " + level3.getID());
				}
			}
		}
	}

	// Approve asset
	asset.approve();
}

function relinkAssets(nodeToProcess) {
	var refTypes = new java.util.HashSet();
	refTypes.add("PMDM.IDRT.PrimaryProductImage");
	refTypes.add("PMDM.IDRT.ProductImages");
	refTypes.add("PMDM.IDRT.InstallationManual");
	refTypes.add("PMDM.IDRT.OwnersManual");

	var assetRefs = nodeToProcess.getAssetReferences().asList();
	for (var i = 0; i < assetRefs.size(); i++) {
		var assetRef = assetRefs.get(i);
		var assetRefType = assetRef.getReferenceType().getID();
		if (refTypes.contains(assetRefType)) {
			log("... Will now relink asset: " + assetRef.getTarget().getID());
			relinkAsset(assetRef.getTarget());
			log("... Done relinking asset");
		}
	}
}

function approveNode(nodeToApprove) {
	// Approve current object cross-context
	var contextsToApprove = ["Context1", "Context2", "Context3"];
	for (var i = 0; i < contextsToApprove.length; i++) {
		var contextToApprove = contextsToApprove[i];
		log("... Will now appove node in context: " + contextToApprove);
		manager.executeInContext(contextToApprove, function(managerInContext){
			var nodeInContext = managerInContext.getObjectFromOtherManager(nodeToApprove);
			try {
				nodeInContext.approve();
			} catch (e) {
				log(e);
				throw (e);
			}
		});
	}
}

function approveNodeAndRelinkAssets(nodeToProcess) {
	log("Start approve and relink assets: " + nodeToProcess.getID());

	// Check is parent product is approved
	var parent = nodeToProcess.getParent();
	if (parent.getApprovalStatus().name().equals("NotInApproved")) {
		var message = (msg1 + "").replace("%s", nodeToProcess.getName()); // Parent node has never been approved so "%s" cannot be approved.
		throw message;
	}

	// Link supplier assets below asset root
	relinkAssets(nodeToProcess);

	// Approve node
	approveNode(nodeToProcess);

	log("Done approving: " + nodeToProcess.getID());
}


// Starts here

// Approve current object and relink assets
approveNodeAndRelinkAssets(node);

// Approve the packaging string of current object
var allPackaging = getAllPackagingFromExternalBusinessFunction.evaluate({
	"node": node
});

allPackaging.toArray().forEach(
	function (packagingObject) {
		approveNodeAndRelinkAssets(packagingObject);
	}
);
}