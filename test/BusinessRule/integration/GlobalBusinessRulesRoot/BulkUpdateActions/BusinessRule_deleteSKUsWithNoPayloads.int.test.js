/*
 * Copyright (c) 2023. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

var step = require("../../../config/step.js");
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_deleteProductsWithoutPayloads");

test('Test delete SKUs with no payloads.', async () => {
    var result = "";
    await step.test(function (manager) {
        var productGroup = manager.getProductHome().getProductByID("SFMPH_GRP_102689");
        var productClassification = productGroup.createProduct("JEST_PRDTCLS_1010", "ProductClassificationNode");
        var product = productClassification.createProduct("JEST_PRDT_1010", "ProductNode");
        var colorway = product.createProduct("JEST_CLRWY_1010", "ColorwayVariantNode");
        var styleVariant = colorway.createProduct("JEST_STYLVRNT_1010", "StyleVariant");
        var sku = styleVariant.createProduct("JEST_SKU_1010", "SKUNode");

        var referenceType = manager.getReferenceTypeHome().getReferenceTypeByID("PayloadToSKUReference");
        businessRuleModule.operation0(referenceType, sku);

        var deletedSKU = manager.getProductHome().getProductByID("JEST_SKU_1010");
        return deletedSKU+"";
    }, ["businessRuleModule", businessRuleModule], []).then((data) => {
        result = step.parseResponse(data);
    });
    expect(result).toBe("null");
});
