const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/AI.TextGeneration.Setup/AI.TextGeneration.Endpoint", [
    {
        "businessRuleId": "AI.TextGeneration.GatewayAuthFunction",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AI.TextGeneration.GatewayAuthFunction.js",
        "businessRuleType": "BusinessFunction"
    }
]);
