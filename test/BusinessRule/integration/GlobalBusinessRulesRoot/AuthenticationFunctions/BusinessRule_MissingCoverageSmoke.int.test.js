const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/GlobalBusinessRulesRoot/AuthenticationFunctions", [
    {
        "businessRuleId": "FetchAccessTokenCreativeForce",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_FetchAccessTokenCreativeForce.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "FetchAuthCodeCreativeForce",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_FetchAuthCodeCreativeForce.js",
        "businessRuleType": "BusinessFunction"
    }
]);
