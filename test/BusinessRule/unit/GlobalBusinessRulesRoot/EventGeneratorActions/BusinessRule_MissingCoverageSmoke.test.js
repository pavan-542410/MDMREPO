const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/GlobalBusinessRulesRoot/EventGeneratorActions", [
    {
        "businessRuleId": "eventCascadeCNS",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_eventCascadeCNS.js",
        "businessRuleType": "BusinessAction"
    }
]);
