const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/GlobalBusinessRulesRoot/Utilities", [
    {
        "businessRuleId": "GenerateUnclassifiedSKUsReport",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_GenerateUnclassifiedSKUsReport.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SKUTimeUnderUnclassifiedSKUsReport",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SKUTimeUnderUnclassifiedSKUsReport.js",
        "businessRuleType": "BusinessAction"
    }
]);
