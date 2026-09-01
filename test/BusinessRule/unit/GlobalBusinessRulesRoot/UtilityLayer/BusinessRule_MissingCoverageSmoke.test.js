const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/GlobalBusinessRulesRoot/UtilityLayer", [
    {
        "businessRuleId": "WriteOperationsLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_WriteOperationsLibrary.js",
        "businessRuleType": "BusinessLibrary"
    }
]);
