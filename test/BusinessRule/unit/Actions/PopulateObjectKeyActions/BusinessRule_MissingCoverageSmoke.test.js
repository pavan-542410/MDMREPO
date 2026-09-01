const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/Actions/PopulateObjectKeyActions", [
    {
        "businessRuleId": "populateColorwayID",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_populateColorwayID.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "populateProductID",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_populateProductID.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "populateSKUID",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_populateSKUID.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "populateStyleID",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_populateStyleID.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "populateSVID",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_populateSVID.js",
        "businessRuleType": "BusinessAction"
    }
]);
