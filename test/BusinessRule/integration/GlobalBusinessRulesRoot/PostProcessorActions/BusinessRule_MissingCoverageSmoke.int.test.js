const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/GlobalBusinessRulesRoot/PostProcessorActions", [
    {
        "businessRuleId": "ExternalAssetImportPostProcessor",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ExternalAssetImportPostProcessor.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "ExternalAssetSplitter",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ExternalAssetSplitter.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "ProcessDeletedSKUs",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ProcessDeletedSKUs.js",
        "businessRuleType": "BusinessAction"
    }
]);
