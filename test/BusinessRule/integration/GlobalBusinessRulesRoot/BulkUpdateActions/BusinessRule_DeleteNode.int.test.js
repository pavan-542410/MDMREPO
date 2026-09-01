/*
 * Copyright (c) 2023. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

var step = require("../../../config/step");
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_DeleteNode");

test('Test Delete Node.', async () => {
    var result = null;
    await step.test(function (manager) {
        var productGroup = manager.getProductHome().getProductByID("SFMPH_GRP_102689");
        var productClassification = productGroup.createProduct("JEST_PRDTCLS_1010", "ProductClassificationNode");
        businessRuleModule.operation0(productClassification);
        var deletedProductClassification = manager.getProductHome().getProductByID("JEST_PRDTCLS_1010");
        return deletedProductClassification +"";
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = JSON.parse(data);
    });
    expect(result.result).toBe("null");
});
