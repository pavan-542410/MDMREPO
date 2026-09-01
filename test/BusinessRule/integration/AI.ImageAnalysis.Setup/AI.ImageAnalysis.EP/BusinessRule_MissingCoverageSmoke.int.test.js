const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/AI.ImageAnalysis.Setup/AI.ImageAnalysis.EP", [
    {
        "businessRuleId": "AI.ImageAnalysis.AnalyzeImageEvent",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AI.ImageAnalysis.AnalyzeImageEvent.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "AI.ImageAnalysis.EventFilter",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AI.ImageAnalysis.EventFilter.js",
        "businessRuleType": "BusinessCondition"
    }
]);
