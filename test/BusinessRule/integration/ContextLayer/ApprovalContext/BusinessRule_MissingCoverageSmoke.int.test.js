const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/ContextLayer/ApprovalContext", [
    {
        "businessRuleId": "StyleVariantApproval",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_StyleVariantApproval.js",
        "businessRuleType": "BusinessAction"
    }
]);
