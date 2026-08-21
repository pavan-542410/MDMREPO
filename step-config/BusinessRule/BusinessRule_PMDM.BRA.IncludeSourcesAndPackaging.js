/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRA.IncludeSourcesAndPackaging",
  "type" : "BusinessAction",
  "setupGroups" : [ "PMDM.BusinessRuleActions" ],
  "name" : "Include Sources And Packaging",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "PMDM.PRD.GoldenRecord" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "PMDM.BRL.GRExportLibrary",
    "libraryAlias" : "GRExportLibrary"
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
    "contract" : "CurrentEventBatchBinding",
    "alias" : "batch",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,batch,GRExportLibrary) {
var events = batch.getEvents();
for (var i = 0; i < events.size(); i++) {
	var event = events.get(i);
	var eventNode = event.getNode();
	if (eventNode != null){
		var objectsToInclude = GRExportLibrary.collectObjectsToInclude(logger, eventNode);
		// Go through nodes and add to queue
		var iter = objectsToInclude.values().iterator();
		while (iter.hasNext()) {
			var newNode = iter.next();	
			batch.addAdditionalNode(newNode);
		}
	}
}
}