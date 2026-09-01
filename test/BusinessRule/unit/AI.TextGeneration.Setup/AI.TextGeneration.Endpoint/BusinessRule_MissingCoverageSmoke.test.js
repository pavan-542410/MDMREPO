const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/AI.TextGeneration.Setup/AI.TextGeneration.Endpoint", [
    {
        "businessRuleId": "AI.TextGeneration.GatewayAuthFunction",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AI.TextGeneration.GatewayAuthFunction.js",
        "businessRuleType": "BusinessFunction"
    }
]);
