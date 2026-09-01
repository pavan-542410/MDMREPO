const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/UtilityLayer/Adaptors", [
    {
        "businessRuleId": "ExecuteInstructionPlan",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ExecuteInstructionPlan.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "SendAttachmentToEmail",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SendAttachmentToEmail.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "SendGenericEmail",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SendGenericEmail.js",
        "businessRuleType": "BusinessFunction"
    }
]);
