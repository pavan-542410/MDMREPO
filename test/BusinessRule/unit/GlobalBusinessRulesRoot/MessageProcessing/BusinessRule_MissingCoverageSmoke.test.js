const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/GlobalBusinessRulesRoot/MessageProcessing", [
    {
        "businessRuleId": "MessageProcessingLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_MessageProcessingLibrary.js",
        "businessRuleType": "BusinessLibrary"
    }
]);
