const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/UtilityLayer/DataFetchers", [
    {
        "businessRuleId": "returnChangedData",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnChangedData.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnHierarchyAsNames",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnHierarchyAsNames.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnHierarchyNames",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnHierarchyNames.js",
        "businessRuleType": "BusinessFunction"
    }
]);
