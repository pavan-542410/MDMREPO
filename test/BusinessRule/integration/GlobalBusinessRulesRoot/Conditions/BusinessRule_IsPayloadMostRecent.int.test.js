var step = require("../../../config/step.js");
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_isColorway.js");

test('Check if the payload is most recent.', async () =>{
    var result = "";
    await step.test((manager) => {
        var colorway = manager.getProductHome().getProductByID("VAR_101085825");
        var isColorwayResult = businessRuleModule.operation0(colorway);

        return isColorwayResult;
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = data.toString();
    });
    expect(result).toBeTruthy();
});
