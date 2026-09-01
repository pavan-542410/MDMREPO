const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/Conditions/HierarchicalConditions", [
    {
        "businessRuleId": "hierarchicalLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_hierarchicalLibrary.js",
        "businessRuleType": "BusinessLibrary"
    }
]);
