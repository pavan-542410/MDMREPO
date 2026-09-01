const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/ContextLayer/ApprovalContext", [
    {
        "businessRuleId": "StyleVariantApproval",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_StyleVariantApproval.js",
        "businessRuleType": "BusinessAction"
    }
]);
