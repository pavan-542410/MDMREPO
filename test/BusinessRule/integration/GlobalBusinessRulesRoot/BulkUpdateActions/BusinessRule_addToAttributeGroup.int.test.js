/*
 * Copyright (c) 2023. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

var step = require("../../../config/step.js");
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_addToAttributeGroup");

test('Test removing and adding attribute from/to an attribute group.', async () => {
    var result = "";
    await step.test(function (manager) {
        var colorAttribute = manager.getAttributeHome().getAttributeByID("color");
        var group1 = manager.getAttributeGroupHome().getAttributeGroupByID("GraphQLReferences");
        var group2 = manager.getAttributeGroupHome().getAttributeGroupByID("GraphQLAttributes");
        colorAttribute.removeAttributeGroup(group2);
        colorAttribute.addAttributeGroup(group1);

        businessRuleModule.operation0(colorAttribute, group1, group2);

        var colorAttributeGroups = colorAttribute.getAttributeGroups();

        return (colorAttributeGroups.toString().includes(group2));

    }, ["businessRuleModule", businessRuleModule], []).then(async (data) => {
        result = data.toString();
    });
    expect(result).toBeTruthy();
});
