const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/ContextLayer/EventQueueContext", [
    {
        "businessRuleId": "ProcessStyleVariantAssets",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ProcessStyleVariantAssets.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "ProcessWorkflowTransitions",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ProcessWorkflowTransitions.js",
        "businessRuleType": "BusinessAction"
    }
]);
