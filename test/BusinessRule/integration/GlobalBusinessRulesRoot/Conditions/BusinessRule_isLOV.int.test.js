var step = require("../../../config/step.js");
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_isLOV");

test('Checks if the object type is an LOV.', async () =>{
    var result = {};
    await step.test((manager) => {
        var results = {};
        var sampleLOV = manager.getListOfValuesHome().getListOfValuesByID("YesNoExternal");
        var isLOVResult = businessRuleModule.operation0(sampleLOV);
        results.trueCase = isLOVResult;

        var notLOV = manager.getListOfValuesHome().getListOfValuesByID("YesNoExternal1100");
        var isNotLOVResult = businessRuleModule.operation0(notLOV);
        results.falseCase = isNotLOVResult;

        return JSON.stringify(results);

    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = JSON.parse(data.toString());
    });
    var finalResults = JSON.parse(result.result);
    expect(finalResults.trueCase).toBeTruthy();
    expect(finalResults.falseCase).toBeFalsy();
});
