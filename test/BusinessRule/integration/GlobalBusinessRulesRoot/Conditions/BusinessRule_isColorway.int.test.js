var step = require("../../../config/step.js");
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_isColorway.js");

test('Checks if the object type is a Colorway.', async () =>{
    var result = "";
    await step.test((manager) => {
        var productGroup = manager.getProductHome().getProductByID("SFMPH_GRP_102689");
        var productClassification = productGroup.createProduct("JEST_PRDTCLS_1010", "ProductClassificationNode");
        var product = productClassification.createProduct("JEST_PRDT_1010", "ProductNode");
        var colorway = product.createProduct("JEST_CLRWY_1010", "ColorwayVariantNode");

        var isColorwayResult = businessRuleModule.operation0(colorway);

        return isColorwayResult;
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = JSON.parse(data);
    });
    expect(result.result).toBeTruthy();
});
