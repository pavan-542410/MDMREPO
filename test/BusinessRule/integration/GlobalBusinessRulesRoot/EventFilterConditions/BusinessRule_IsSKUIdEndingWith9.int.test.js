var step = require("../../../config/step.js");
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_IsSKUIdEndingWith9");

test('Checks if the SKU Id is ending with 9.', async () =>{
    var results = {};
    await step.test((manager) => {
        var results = {};
        var productGroup = manager.getProductHome().getProductByID("SFMPH_GRP_102689");
        var productClassification = productGroup.createProduct("JEST_PRDTCLS_1010", "ProductClassificationNode");
        var product = productClassification.createProduct("JEST_PRDT_1010", "ProductNode");
        var colorway = product.createProduct("JEST_CLRWY_1010", "ColorwayVariantNode");
        var styleVariant = colorway.createProduct("JEST_STYLVRNT_1010", "StyleVariant");
        var skuIdNotEndingWith9 = styleVariant.createProduct("JEST_SKU_1010", "SKUNode");
        var isNotSKUIdEndingWith9Result = businessRuleModule.operation0(skuIdNotEndingWith9);

        results.notEndingWith9 = isNotSKUIdEndingWith9Result;

        var skuIdEndingWith9 = styleVariant.createProduct("JEST_SKU_1019", "SKUNode");
        var isSKUIdEndingWith9Result = businessRuleModule.operation0(skuIdEndingWith9);

        results.endingWith9 = isSKUIdEndingWith9Result;

        return JSON.stringify(results);
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        results = JSON.parse(data);
    });
    var finalResults = JSON.parse(results.result);
    expect(finalResults.notEndingWith9).toBeFalsy();
    expect(finalResults.endingWith9).toBeTruthy();
});
