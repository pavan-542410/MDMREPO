const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/AI.TextGeneration.Setup/AI.TextGeneration.EP", [
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
