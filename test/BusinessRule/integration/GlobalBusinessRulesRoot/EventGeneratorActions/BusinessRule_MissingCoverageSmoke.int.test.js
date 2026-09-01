const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/GlobalBusinessRulesRoot/EventGeneratorActions", [
    {
        "businessRuleId": "eventCascadeCNS",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_eventCascadeCNS.js",
        "businessRuleType": "BusinessAction"
    }
]);
