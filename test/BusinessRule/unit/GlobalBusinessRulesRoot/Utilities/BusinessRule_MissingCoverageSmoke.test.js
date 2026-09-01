const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/GlobalBusinessRulesRoot/Utilities", [
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
