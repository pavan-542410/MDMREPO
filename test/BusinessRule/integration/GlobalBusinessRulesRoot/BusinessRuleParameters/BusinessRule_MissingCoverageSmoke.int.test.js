const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/GlobalBusinessRulesRoot/BusinessRuleParameters", [
    {
        "businessRuleId": "StyleVariantApprovalConfig",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_StyleVariantApprovalConfig.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "StyleVariantApprovalValidationConfig",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_StyleVariantApprovalValidationConfig.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "WorkflowTransitionConfig",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_WorkflowTransitionConfig.js",
        "businessRuleType": "BusinessFunction"
    }
]);
