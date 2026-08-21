/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "mks_EmailTemplate",
  "type" : "BusinessAction",
  "setupGroups" : [ "mks_Actions" ],
  "name" : "mks_EmailTemplate",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "mks_PrimaryRoot", "mks_SecondaryRoot", "mks_Sku" ],
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
exports.operation0 = function (node,manager,logger) {
try {

    // Product details
    var productId = node.getID();
    var productName = node.getName();

    // Attribute values
    var brand = "";
    var email = "";

    try {
        brand = node.getValue("Brand").getSimpleValue();
    } catch(err) {}

    try {
        email = node.getValue("NotificationEmail").getSimpleValue();
    } catch(err) {}

    // Subject
    var subject =
        "Product Approved : " + productName;

    // HTML Body
    var htmlBody =
        "<html>" +
        "<body style='font-family:Arial,sans-serif'>" +

        "<table width='100%' " +
        "style='background-color:#0078D4;color:white'>" +
        "<tr>" +
        "<td style='padding:10px'>" +
        "<h2>Product Approval Notification</h2>" +
        "</td>" +
        "</tr>" +
        "</table>" +

        "<br/>" +

        "<table border='1' cellpadding='5'" +
        " style='border-collapse:collapse'>" +

        "<tr>" +
        "<td><b>Product ID</b></td>" +
        "<td>" + productId + "</td>" +
        "</tr>" +

        "<tr>" +
        "<td><b>Product Name</b></td>" +
        "<td>" + productName + "</td>" +
        "</tr>" +

        "<tr>" +
        "<td><b>Brand</b></td>" +
        "<td>" + brand + "</td>" +
        "</tr>" +

        "</table>" +

        "<br/>" +
        "<p>The product has been approved.</p>" +
        "<p>Regards,<br/>STEP MDM</p>" +

        "</body>" +
        "</html>";

    logger.info(htmlBody);

}
catch(e) {

    logger.severe(
        "Error generating email : " + e);

}
}