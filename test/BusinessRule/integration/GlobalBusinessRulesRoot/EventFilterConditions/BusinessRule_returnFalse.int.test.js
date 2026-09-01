var step = require("../../../config/step.js");
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_returnFalse");

test('Checks if this returns False.', async () =>{
    var result = "";
    await step.test((manager) => {
        var returnResult = businessRuleModule.operation0();

        return returnResult;
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = data.toString();
    });
    expect(result).toBeTruthy();
});
