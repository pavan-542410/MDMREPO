/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "Test Gateway",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Test Gateway",
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
    "contract" : "GatewayBinding",
    "alias" : "gateway",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.gateway.FrontGatewayIntegrationEndpointImpl",
    "value" : "DemoGIEP",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,gateway) {
var desc = node.getValue("TestDescription").getSimpleValue();
var refType = manager.getReferenceTypeHome().getReferenceTypeByID("PMDM.IDRT.PrimaryProductImage");
var asset = node.queryReferences(refType).asList(1).get(0).getTarget();
var base64Encoded = getBase64EncodedString(asset);

var queryParam = new java.util.HashMap();
queryParam.put("img_desc", desc);
queryParam.put("b64_encoded_img", base64Encoded);

var request = gateway
    .post()
    .path("/homedepo/analyzeImage/b64Image")
    .header("accept", "application/json")
    .header("Content-Type", "application/x-www-form-urlencoded")
    .urlEncodedBody(queryParam);

try{
	var response = request.invoke();
	logger.info(response);
}
catch(e){
	logger.info(e);
	throw e;
}


function getBase64EncodedString(asset){
	if(asset && asset.hasContent()) {
	     var outputStream = new java.io.ByteArrayOutputStream();
	     asset.download(outputStream);
	     var byteArray = outputStream.toByteArray();
		var base64encoding = java.util.Base64.getEncoder().encodeToString(byteArray);
		if (base64encoding) {
			return base64encoding;
			//logger.info(base64encoding);
		}
	}
}



}