var step = require("../../../config/step.js");
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_isStyleVariant");

test('Checks if the object type is a Style Variant.', async () =>{
    var result = "";
    await step.test((manager) => {
        var productGroup = manager.getProductHome().getProductByID("SFMPH_GRP_102689");
        var productClassification = productGroup.createProduct("JEST_PRDTCLS_1010", "ProductClassificationNode");
        var product = productClassification.createProduct("JEST_PRDT_1010", "ProductNode");
        var colorway = product.createProduct("JEST_CLRWY_1010", "ColorwayVariantNode");
        var styleVariant = colorway.createProduct("JEST_STYLVRNT_1010", "StyleVariant");
        var isStyleVariantResult = businessRuleModule.operation0(styleVariant);

        return isStyleVariantResult;
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = data.toString();
    });
    expect(result).toBeTruthy();
});
