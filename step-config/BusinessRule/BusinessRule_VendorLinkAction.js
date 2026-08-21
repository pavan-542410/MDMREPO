/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "VendorLinkAction",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Vendor Link Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "Provisioning_Library",
    "libraryAlias" : "provisionalLib"
  } ]
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
    "contract" : "WebUiContextBind",
    "alias" : "portal",
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
    "contract" : "GatewayBinding",
    "alias" : "gateway",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.gateway.FrontGatewayIntegrationEndpointImpl",
    "value" : "giep_GatewaySTEPXml",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,portal,logger,gateway,provisionalLib) {
var VendorList = portal.getSelection();
if(VendorList.size() > 1){
    portal.showAlert("ERROR", "Mutiple selection of Vendor is not allowed, Business partner cannot be linked to multiple Vendor ");
    logger.info("Mutiple selection of Vendor is not allowed, Business partner cannot be linked to multiple Vendor "+ VendorList)
    return false;
}
var vendorObj = VendorList.get(0);

var object = portal.getSelectedSetOfNodes();
logger.info('object ' + object + " linking to Vendor " + vendorObj);
provisionalLib.linkBPToSupplier(manager, vendorObj,gateway,object,portal,logger);
}