const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/AI.ImageAnalysis.Setup/AI.ImageAnalysis.Endpoint", [
    {
        "businessRuleId": "AI.ImageAnalysis.GatewayAuthFunction",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AI.ImageAnalysis.GatewayAuthFunction.js",
        "businessRuleType": "BusinessFunction"
    }
]);
