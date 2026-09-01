var step = require("../../../config/step.js");
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_isProduct");

test('Checks if the object type is a Product.', async () =>{
    var result = "";
    await step.test((manager) => {
        var productGroup = manager.getProductHome().getProductByID("SFMPH_GRP_102689");
        var productClassification = productGroup.createProduct("JEST_PRDTCLS_1010", "ProductClassificationNode");
        var product = productClassification.createProduct("JEST_PRDT_1010", "ProductNode");

        var isProductResult = businessRuleModule.operation0(product);

        return isProductResult;
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = data.toString();
    });
    expect(result).toBeTruthy();
});
