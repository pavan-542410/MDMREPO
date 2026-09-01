const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/GlobalBusinessRulesRoot/BusinessRuleParameters", [
    {
        "businessRuleId": "StyleVariantApprovalConfig",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_StyleVariantApprovalConfig.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "StyleVariantApprovalValidationConfig",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_StyleVariantApprovalValidationConfig.js",
        "businessRuleType": "BusinessFunction"
    }
]);
