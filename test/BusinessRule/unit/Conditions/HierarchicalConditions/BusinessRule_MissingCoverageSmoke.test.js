const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/Conditions/HierarchicalConditions", [
    {
        "businessRuleId": "hierarchicalLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_hierarchicalLibrary.js",
        "businessRuleType": "BusinessLibrary"
    }
]);
