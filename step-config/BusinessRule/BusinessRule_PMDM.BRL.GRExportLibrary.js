/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "PMDM.BRL.GRExportLibrary",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "PMDM.BusinessRuleLibraries" ],
  "name" : "Golden Record Export Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
// This is the function that handles everything from this node, in/out/up/down and recurses
function handleNode(nodes, prodTypes, parentChildTypes, parentTypes, refTypes, node, logger) {
  if (nodes.get(node.getID()) != null) {
  	// Already handled
  	return;
  }

  var objectTypeID = node.getObjectType().getID();
  if (!prodTypes.contains(objectTypeID)) {
  	// Not an object type we care about
  	return;
  }
 
  // Mark as handled
  nodes.put(node.getID(), node);

  // Parent children
  var parentType = parentChildTypes.get(objectTypeID);
  if (parentType != null) {
    // This is a type where I may need to include the parent and all its children
    var parent = node.getParent();
    if (parent.getObjectType().getID().equals(parentType)) {
      //This is indeed a parent-child combination I need to handle
  	 handleNode(nodes, prodTypes, parentChildTypes, parentTypes, refTypes, parent, logger);
  	 var childrenIterator = parent.getChildren().iterator();
  	 // Always include all children in this scenario
  	 while (childrenIterator.hasNext()) {
  	   handleNode(nodes, prodTypes, parentChildTypes, parentTypes, refTypes, childrenIterator.next(), logger);
  	 }
    }
  }

  // Children directly
  if (parentTypes.contains(objectTypeID)) {
    // Always include all children in this scenario
    var childrenIterator = node.getChildren().iterator();
    while (childrenIterator.hasNext()) {
      handleNode(nodes, prodTypes, parentChildTypes, parentTypes, refTypes, childrenIterator.next(), logger);
    }
  }

  // Inbound references
  node.queryReferencedBy(com.stibo.core.domain.Product, null).forEach(
    function(reference) {
      if (refTypes.contains(reference.getReferenceType().getID())) {
        // This is a reference type we care about
        var source = reference.getSource();
        handleNode(nodes, prodTypes, parentChildTypes, parentTypes, refTypes, source, logger);
      }
      return true;
    }
  );

  // Outbound (children)
  var list = node.getProductReferences().asList();
  var iter = list.iterator();
  while (iter.hasNext()) {
    var ref = iter.next();
    var target = ref.getTarget();
    var refType = ref.getReferenceTypeString();
    if (refTypes.contains(refType)) {
      // This is a reference type we care about
      handleNode(nodes, prodTypes, parentChildTypes, parentTypes, refTypes, target, logger);
    }
  }
}

// Follow all references in and out for packaging and source reference types and for select parent/child types
function collectObjectsToInclude(logger, node){

  // The types we care about
  var prodTypes = new java.util.HashSet();
  prodTypes.add("PMDM.PRD.GoldenRecord");
  prodTypes.add("PMDM.PRD.ExternalSourceRecord");
  prodTypes.add("PMDM.PRD.InternalSourceRecord");
  prodTypes.add("PMDM.PRD.Case");
  prodTypes.add("PMDM.PRD.Pack");
  prodTypes.add("PMDM.PRD.Pallet");  

  // The special types where we need to go up to the parent and then include all children
  var parentChildTypes = new java.util.HashMap();
  //parentChildTypes.put("Item", "ItemFamily");

  // The special types where we need to directly include all children
  var parentTypes = new java.util.HashSet();
  //parentTypes.add("PMDM.PRD.InternalMasterProduct");

  // The reference type we care about following 
  var refTypes = new java.util.HashSet();
  refTypes.add("PMDM.PRT.GoldenToSourceRecord");
  refTypes.add("PMDM.PRT.CaseToChild");
  refTypes.add("PMDM.PRT.PackToChild");	
  refTypes.add("PMDM.PRT.PalletToChild");	

  // The set of all nodes we have found at any given time
  var nodes = new java.util.HashMap();

  handleNode(nodes, prodTypes, parentChildTypes, parentTypes, refTypes, node, logger);
 
  // Remove original node which is already in the queue but was added to my node list
  nodes.remove(node.getID());

  return nodes;
}

//----------
// Follow all references in and out for packaging and source reference types and for select parent/child types
function collectMasterProductsToInclude(logger, node){

  // The types we care about
  var prodTypes = new java.util.HashSet();
  prodTypes.add("PMDM.PRD.GoldenRecord");
  prodTypes.add("PMDM.PRD.InternalMasterProduct");
  //Enable the following line to include all variant Internal Source Records + their Golden Records in the export
  //prodTypes.add("PMDM.PRD.InternalSourceRecord"); 

  // The special types where we need to go up to the parent and then include all children
  var parentChildTypes = new java.util.HashMap();
  //parentChildTypes.put("Item", "ItemFamily");

  // The special types where we need to directly include all children
  var parentTypes = new java.util.HashSet();
  //Enable the following line to include all variant Internal Source Records + their Golden Records in the export
  //parentTypes.add("PMDM.PRD.InternalMasterProduct");

  // The reference type we care about following 
  var refTypes = new java.util.HashSet();
  refTypes.add("PMDM.PRT.GR2MP");
  //Enable the following line to include all variant Internal Source Records + their Golden Records in the export
  //refTypes.add("PMDM.PRT.GoldenToSourceRecord");

  // The set of all nodes we have found at any given time
  var nodes = new java.util.HashMap();

  handleNode(nodes, prodTypes, parentChildTypes, parentTypes, refTypes, node, logger);
 
  // Remove original node which is already in the queue but was added to my node list
  nodes.remove(node.getID());

  return nodes;
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.handleNode = handleNode
exports.collectObjectsToInclude = collectObjectsToInclude
exports.collectMasterProductsToInclude = collectMasterProductsToInclude