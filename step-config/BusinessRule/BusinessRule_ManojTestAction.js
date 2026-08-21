/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "ManojTestAction",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Manoj Test Action",
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
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webUI",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,gateway,webUI) {
//ADDED COMMENT FROM GIT
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
	//logger.info("response: " + response);
	//response = String(["\"{'Model_Scrore': 0.8455471396446228, 'Model_Analysis': 'The description aligns with the image, indicating a potential match as identified by the machine learning model.'}\"", 200])
	//logger.info(response.indexOf("Model_Scrore"));
	if(response && response.indexOf("Blurry")<0){
		var modelScore = response.substring(response.indexOf("Model_Scrore")+15, response.indexOf("Model_Analysis")-4);
		var modelAnalysis = response.substring(response.indexOf("Model_Analysis")+18, response.indexOf('}')-2);
	
		node.getValue("TestScore").setSimpleValue(modelScore);
		node.getValue("TestWorkflowComment").setSimpleValue(modelAnalysis);
		var wfInstance = node.getWorkflowInstanceByID("TestValidateAssets");
		
		if(parseFloat(modelScore)<0.5 || parseFloat(modelScore)>1){
			webUI.showAlert("ERROR", "Action Needed", "Please upload a new image or correct the description");
		}
		else if(parseFloat(modelScore)<0.7){
			wfInstance.getTaskByID("UploadAsset").triggerByID("Submit",null);
			webUI.showAlert("INFO","INFO","Submitted for Review");
			webUI.navigate("homepage",null);
		}
		else{
			wfInstance.getTaskByID("UploadAsset").triggerByID("Submit",null);
			wfInstance.getTaskByID("ReviewAsset").triggerByID("Approve",null);
			webUI.showAlert("INFO","INFO","Image Validated Successfully");
			webUI.navigate("homepage",null);
		}
	}
	else{
		webUI.showAlert("ERROR","Action Needed","Image is blurry, please upload better quality image");
	}
/*	var jsonPart = {
  'Model_Scrore': 0.8455471396446228,
  'Model_Analysis': 'The description aligns with the image, indicating a potential match as identified by the machine learning model.'
}
var str = JSON.stringify(jsonPart);
var parsedJson = JSON.parse(str);
logger.info(parsedJson.Model_Scrore);*/

//	var jsonPart = response.substring(response.indexOf("{"), response.indexOf("}")+1);
//	logger.info("jsonPart: " + jsonPart);
//	var firstParse = JSON.parse(jsonPart);
//	logger.info("after parsing: " + JSON.stringify(firstParse));
//	var modelScore = firstParse.Model_Scrore; // Corrected key spelling
//	var modelAnalysis = firstParse.Model_Analysis; // Corrected key spelling
//	logger.info(modelScore + " " + modelAnalysis);
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


function getResponse(desc,base64Encoded){
	var requestJSON = {};
	requestJSON.img_desc = desc;
	requestJSON.b64_encoded_img = base64Encoded;
	var requestBody = JSON.stringify(requestJSON);
		
	// Build request
	var request = gateway
		.post()
		.pathElements("/homedepo/analyzeImage/b64Image")
		.bodyContentType("application/x-www-form-urlencoded")
		.body(requestBody);
	
	try {
		var response = request.invoke();
		log("Response: " + response);
	} catch (e) {
		if (e.javaException instanceof com.stibo.gateway.rest.RESTGatewayException) {
			var javaExceptionMessage = e.javaException.getMessage();
			if (e.javaException instanceof com.stibo.gateway.rest.exception.RESTGatewayStatusCodeWithBodyException) {
				var body = parseMessage(e.javaException.getBody());
				var statusCode = e.javaException.getHttpStatusCode();
				log("... RESTGatewayStatusCodeWithBodyException - statusCode: " + statusCode + " - body: " + body + " - message: " + javaExceptionMessage);
				var errorMessage = new returnMessage();
				errorMessage.text = "<b>" + msg1 + "</b>\n" + body + " (" + statusCode + ")";
				throw errorMessage;	
			} else if (e.javaException instanceof com.stibo.gateway.rest.RESTGatewayStatusCodeException) {
				var statusCode = e.javaException.getHttpStatusCode();
				log("... RESTGatewayStatusCodeException - statusCode: " + statusCode + " - message: " + javaExceptionMessage);
				var errorMessage = new returnMessage();
				errorMessage.text = "<b>" + msg1 + "</b>\n" + javaExceptionMessage + " (" + statusCode + ")";
				throw errorMessage;	
			} else if (e.javaException instanceof com.stibo.gateway.rest.RESTGatewayIOException) {
				log("... RESTGatewayIOException - message: " + javaExceptionMessage);
				var errorMessage = new returnMessage();
				errorMessage.text = "<b>" + msg1 + "</b>\n" + javaExceptionMessage;
				throw errorMessage;	
			} else {
				throw (e);
			}
		} else {
			throw (e);		
		}
	}
	return response;
	//logger.info(response);
}
}