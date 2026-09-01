const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/GlobalBusinessRulesRoot/AuthenticationFunctions", [
    {
        "businessRuleId": "BlueYonderAuthHeader",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_BlueYonderAuthHeader.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "ChangeNotificationService_Authorization",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ChangeNotificationService_Authorization.js",
        "businessRuleType": "BusinessFunction"
    },
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
