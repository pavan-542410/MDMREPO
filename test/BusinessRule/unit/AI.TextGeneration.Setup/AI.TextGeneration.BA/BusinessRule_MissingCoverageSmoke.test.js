const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/AI.TextGeneration.Setup/AI.TextGeneration.BA", [
    {
        "businessRuleId": "AI.TextGeneration.GenerateImageAltText",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AI.TextGeneration.GenerateImageAltText.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "AI.TextGeneration.GenerateProdDesc",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AI.TextGeneration.GenerateProdDesc.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "AI.TextGeneration.GenerateTranslation",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AI.TextGeneration.GenerateTranslation.js",
        "businessRuleType": "BusinessAction"
    }
]);
