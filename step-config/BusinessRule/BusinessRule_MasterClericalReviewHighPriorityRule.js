/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "MasterClericalReviewHighPriorityRule",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "MasterClericalReviewHighPriorityRule",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "IndividualCustomer" ],
  "allObjectTypesValid" : false,
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
    "alias" : "currentNode",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentWorkflowBindContract",
    "alias" : "wf",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (currentNode,wf) {
var crThreshold = 60;
var reviewStateID = "Review";
function getAlgorithmID(node, wf) {
	return node.getWorkflowInstance(wf).getSimpleVariable("MatchingAlgorithmID");
}

function getOtherNode(currentNode, rankscore) {
	return currentNode.equals(rankscore.getNode1())?rankscore.getNode2():rankscore.getNode1();
}

function mustEscalateNode(node) {
	if(java.lang.String.valueOf("Y").equalsIgnoreCase(node.getValue("RiskFlag").getSimpleValue())){
		return true;
	} else {
		return false;
	}
}

var rankscores = currentNode.getRankScores(currentNode.getManager().getHome(com.stibo.matching.domain.matchingalgorithm.MatchingAlgorithmHome).getMatchingAlgorithmByID(getAlgorithmID(currentNode, wf)));
var nodes = new Array();
var mustEscalate =false;
nodes.push(currentNode);
if(mustEscalateNode(currentNode)) {
				mustEscalate = true;
			}
if(rankscores) {
	var iter = rankscores.iterator();
	while(iter.hasNext()) {
		var rankscore = iter.next();
		if(rankscore.getEquality()>crThreshold) {
			var otherNode = getOtherNode(currentNode, rankscore);
			if(mustEscalateNode(otherNode)) {
				mustEscalate = true;
			}
			if(otherNode.isInState(wf.getID(), reviewStateID)) {
				nodes.push(otherNode);
			}
		}
	}
}

if(mustEscalate) {
	for(var i=0;i<nodes.length;i++) {
		var node = nodes[i];
		var wfInstance = node.getWorkflowInstance(wf);
		wfInstance.getTaskByID(reviewStateID).triggerLaterByID("escalate", "Task escalated automatically");
	}
}

}