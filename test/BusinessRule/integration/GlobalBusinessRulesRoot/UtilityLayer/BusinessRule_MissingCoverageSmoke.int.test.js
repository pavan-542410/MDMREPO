const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/GlobalBusinessRulesRoot/UtilityLayer", [
    {
        "businessRuleId": "WriteOperationsLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_WriteOperationsLibrary.js",
        "businessRuleType": "BusinessLibrary"
    }
]);
