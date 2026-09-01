const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/AI.ImageAnalysis.Setup/AI.ImageAnalysis.BA", [
    {
        "businessRuleId": "AI.ImageAnalysis.AnalyzeImage",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AI.ImageAnalysis.AnalyzeImage.js",
        "businessRuleType": "BusinessAction"
    }
]);
