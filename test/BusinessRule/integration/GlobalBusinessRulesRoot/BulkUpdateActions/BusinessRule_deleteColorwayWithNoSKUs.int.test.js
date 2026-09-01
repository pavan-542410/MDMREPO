/*
 * Copyright (c) 2023. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

var step = require("../../../config/step.js");
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_deleteColorwayWithNoSKUs");

test('Test Delete Colorway With No SKUs.', async () => {
    var result = "";
    await step.test(function (manager) {
        var productGroup = manager.getProductHome().getProductByID("SFMPH_GRP_102689");
        var productClassification = productGroup.createProduct("JEST_PRDTCLS_1010", "ProductClassificationNode");
        var product = productClassification.createProduct("JEST_PRDT_1010", "ProductNode");
        var colorway = product.createProduct("JEST_CLRWY_1010", "ColorwayVariantNode");
        var workflow = manager.getWorkflowHome().getWorkflowByID("ColorwayEnrichment");
        var wfi = workflow ? colorway.getWorkflowInstance(workflow) : null;
        if (wfi) {
            wfi.delete("Completing the Workflow");
        }

        businessRuleModule.operation0(colorway);

        var deletedColorway = manager.getProductHome().getProductByID("JEST_CLRWY_1010");
        return deletedColorway+"";
    }, ["businessRuleModule", businessRuleModule], []).then(async (data) => {
        result = JSON.parse(data);
    });
    expect(result.result).toBe("null");
});
