/*
 * Copyright (c) 2023. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

var step = require("../../../config/step.js");
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_ChangeNotificationService_Authorization");

test('Test Change Notification Service Authorization.', async () => {
    var result = "";
    await step.test(function (manager) {
        var resultMap = businessRuleModule.operation0();
        var authorization = resultMap.get("Authorization");

        return authorization;
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = JSON.parse(data);
    });
    expect(result.result).toBe("StitchFixInternal key=525ca26d-131b-4ffb-b99a-6dbd5843370e");
});
