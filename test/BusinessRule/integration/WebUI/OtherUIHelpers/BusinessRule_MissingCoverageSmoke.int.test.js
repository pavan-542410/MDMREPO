const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/WebUI/OtherUIHelpers", [
    {
        "businessRuleId": "DoNothing",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_DoNothing.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "isLOVEditableByMerch",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isLOVEditableByMerch.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "IsMerchMomentsLOV",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_IsMerchMomentsLOV.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "IsReplayPayloads",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_IsReplayPayloads.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "ReprocessPayloads",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ReprocessPayloads.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "Return1",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_Return1.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "Return2",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_Return2.js",
        "businessRuleType": "BusinessFunction"
    }
]);
