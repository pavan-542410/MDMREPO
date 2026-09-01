const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/UtilityLayer/Adaptors", [
    {
        "businessRuleId": "ExecuteInstructionPlan",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ExecuteInstructionPlan.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "SendAttachmentToEmail",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SendAttachmentToEmail.js",
        "businessRuleType": "BusinessFunction"
    }
]);
