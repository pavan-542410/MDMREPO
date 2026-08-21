/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.PDS.UploadAssetOnImport",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "PDX: Upload Asset On Import",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Asset user-type root", "InstallationManual", "OwnersManual", "ProductImage" ],
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
    "alias" : "asset",
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
    "contract" : "AttributeBindContract",
    "alias" : "assetFileNameAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.PDS.AssetFileName",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "assetURLAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.PDS.AssetURL",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "assetContentHashAttribute",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "PMDM.AT.PDS.AssetContentHash",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "getAssetContentByURLEventQueue",
    "parameterClass" : "com.stibo.core.domain.impl.eventprocessor.EventProcessorImpl",
    "value" : "step://eventprocessor?id=GetAssetContentByURL",
    "description" : null
  }, {
    "contract" : "ImportChangeInfoBind",
    "alias" : "importChangeInfo",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (asset,manager,logger,assetFileNameAttribute,assetURLAttribute,assetContentHashAttribute,getAssetContentByURLEventQueue,importChangeInfo,logLib) {
"use strict";

var forceLog = false;

var FileNotExist = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.PDS.UploadA_FileNotExist").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // 'File (%s) does not exist'
var InvalidUploadPath = manager.getEntityHome().getEntityByID("SysMsg_PMDM.BRA.PDS.Up_InvalidUploadPath").getValue("PMDM.AT.SystemMessage").getSimpleValue(); // 'Invalid upload source path'

function log(message) {
	logLib.log(logger, "PDX: Upload Asset on Import: " + message, forceLog);
}

function getAssetURL() {
	if (assetURLAttribute) {
		var assetURLValue = asset.getValue(assetURLAttribute.getID()).getSimpleValue();
		if (assetURLValue) {
			return assetURLValue;
		}
	}
	return null;
}

function getAssetContentByURL() {
	getAssetContentByURLEventQueue.republish(asset);
}

function getAssetFileName() {
	if (assetFileNameAttribute) {
		var assetFileNameValue = asset.getValue(assetFileNameAttribute.getID()).getSimpleValue();
		if (assetFileNameValue) {
			return assetFileNameValue;
		}
	}
	return null;
}

function getAssetContentByFileName(fileName) {
	var basePath = java.lang.System.getProperty("Tagglo.UploadDir.ASSETS");
	if (basePath) {
		var baseDir = new java.io.File(basePath);
		var assetFile = new java.io.File(baseDir, fileName);
		if (!assetFile.exists()) {
			var message = (FileNotExist+ "").replace("%s", fileName); // 'File (%s) does not exist'
			throw message;
		}
		if (!assetFile.getParentFile().equals(baseDir)) {
			throw InvalidUploadPath;
		}
		
		var fis = new java.io.FileInputStream(assetFile);
		asset.upload(fis, fileName);
		fis.close();
	} else {
		throw "The 'Tagglo.UploadDir.ASSETS' config property is not defined";
	}
}

function handleAssetImport() {
	var assetURL = getAssetURL();
	if (assetURL) {
		getAssetContentByURL();
	} 
	
	if (!assetURL) {
		var assetFileName = getAssetFileName();
		if (assetFileName) {
			getAssetContentByFileName(assetFileName);
		}
	}

	if (!assetURL && !assetFileName) {
		throw "Neither Asset URL nor Asset File Name was received from PDX";
	}
}

// Import asset content unless:
// - Asset Content Hash has a value, Asset is not created by current import and asset is not modified in current import
// - Asset Content Hash has a value, Asset is not created by current import and Asset Content Hash is not changed in current import
var importAsset = true;
var assetContentHashValue = asset.getValue(assetContentHashAttribute.getID()).getSimpleValue();
var isCreatedByCurrentProcess = importChangeInfo.isCreatedByCurrentProcess();
var isUnmodified = importChangeInfo.isUnmodified();

if (assetContentHashValue && !isCreatedByCurrentProcess && isUnmodified ) {
	log("Asset has Asset Content Hash && Asset is not created by current process && Asset is unmodified -> Skip import of asset content");
	importAsset = false;
}

if (assetContentHashValue && !isCreatedByCurrentProcess && !isUnmodified) {
	log("Asset has Asset Content Hash && Asset is not created by current process && Asset is modified -> Check if Asset Content Hash is changed. If not, skip import of asset content");
	var changedAttributesArray = importChangeInfo.getChanges().getAttributes().toArray();
	if (changedAttributesArray.indexOf(assetContentHashAttribute.getID()) == -1) {
		log("... Asset Content Hash not changed so skip import of asset content");
		importAsset = false;
	}
}

if (importAsset) {
	log("Asset content will be imported");
	handleAssetImport();
}

}