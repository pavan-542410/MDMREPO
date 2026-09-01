const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/AI.ImageAnalysis.Setup/AI.ImageAnalysis.EP", [
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
