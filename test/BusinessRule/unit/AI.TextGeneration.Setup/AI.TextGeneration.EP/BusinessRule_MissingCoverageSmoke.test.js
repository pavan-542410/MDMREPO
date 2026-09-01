const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/AI.TextGeneration.Setup/AI.TextGeneration.EP", [
    {
        "businessRuleId": "AI.TextGeneration.GenProdEvent",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AI.TextGeneration.GenProdEvent.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "AI.TextGeneration.ProdDescEventFilter",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AI.TextGeneration.ProdDescEventFilter.js",
        "businessRuleType": "BusinessCondition"
    }
]);
