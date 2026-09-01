const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/GlobalBusinessRulesRoot/MessageProcessing", [
    {
        "businessRuleId": "MessageProcessingLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_MessageProcessingLibrary.js",
        "businessRuleType": "BusinessLibrary"
    }
]);
