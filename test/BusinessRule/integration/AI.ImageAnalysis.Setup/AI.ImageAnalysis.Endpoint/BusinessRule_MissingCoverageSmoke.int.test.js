const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/AI.ImageAnalysis.Setup/AI.ImageAnalysis.Endpoint", [
    {
        "businessRuleId": "AI.ImageAnalysis.GatewayAuthFunction",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AI.ImageAnalysis.GatewayAuthFunction.js",
        "businessRuleType": "BusinessFunction"
    }
]);
