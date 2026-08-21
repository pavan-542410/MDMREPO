/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "SetVendorNameFull",
  "type" : "GeneralBusinessRule",
  "setupGroups" : [ "VendorManagement" ],
  "name" : "Set Vendor Name Full",
  "description" : "Sets the full vendor name attribute based on business logic",
  "scope" : null,
  "validObjectTypes" : [ "Company" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessRule",
  "binds" : [
    {
      "name" : "object",
      "definition" : {
        "className" : "com.stibosystems.oo.api.dto.step.data.DataContainerDTO"
      }
    },
    {
      "name" : "w",
      "definition" : {
        "className" : "com.stibosystems.oo.api.businessrule.javascript.scriptlibraries.WriteOperationsLibrary"
      }
    }
  ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/

// ============================================
// CONTEXT LAYER: STEP API Interactions
// ============================================
function contextLayer() {
  var context = {};
  
  try {
    // Validate object
    if (!object || !object.getId) {
      logMessage("ERROR: Invalid object context");
      return null;
    }
    
    context.objectId = object.getId();
    context.objectType = object.getObjectType();
    
    logMessage("Context - Processing object: " + context.objectId + " (Type: " + context.objectType + ")");
    
    // Read current attribute values if needed
    var vendorNameAttribute = object.getSimpleValue("A_VendornameFull");
    context.currentVendorName = vendorNameAttribute ? vendorNameAttribute : "";
    
    return context;
  } catch (error) {
    logMessage("ERROR in contextLayer: " + error.message);
    return null;
  }
}

// ============================================
// LOGIC LAYER: Pure Business Logic
// ============================================
function logicLayer(context) {
  try {
    if (!context) {
      return null;
    }
    
    logMessage("Logic - Evaluating vendor name for: " + context.objectId);
    
    // TODO: Add your business logic here
    // Example: Construct vendor name from multiple attributes
    var vendorNameFull = "Vendor_" + context.objectId;
    
    return {
      vendorNameFull: vendorNameFull,
      shouldUpdate: true
    };
  } catch (error) {
    logMessage("ERROR in logicLayer: " + error.message);
    return null;
  }
}

// ============================================
// UTILITY LAYER: Reusable Helpers
// ============================================
function buildVendorName(objectId, prefix) {
  return prefix + "_" + objectId;
}

function validateVendorName(name) {
  return name && name.length > 0;
}

// ============================================
// MAIN EXECUTION
// ============================================
function execute() {
  try {
    logMessage("=== Starting SetVendorNameFull BR ===");
    
    // Phase 1: Context
    var context = contextLayer();
    if (!context) {
      logMessage("Context layer failed");
      return false;
    }
    
    // Phase 2: Logic
    var result = logicLayer(context);
    if (!result || !result.shouldUpdate) {
      logMessage("Logic determined no update needed");
      return true;
    }
    
    // Phase 3: Write via WriteOperationsLibrary
    if (validateVendorName(result.vendorNameFull)) {
      logMessage("Setting A_VendornameFull to: " + result.vendorNameFull);
      w.setSimpleValue(object, "A_VendornameFull", result.vendorNameFull);
      logMessage("Successfully set A_VendornameFull");
    } else {
      logMessage("ERROR: Invalid vendor name value");
      return false;
    }
    
    logMessage("=== SetVendorNameFull BR completed successfully ===");
    return true;
  } catch (error) {
    logMessage("ERROR in execute: " + error.message);
    return false;
  }
}

// ============================================
// LOGGING
// ============================================
function logMessage(message) {
  //log("SetVendorNameFull: " + message);
}

// Execute the business rule
execute();
