const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/UtilityLayer/DataTransformers", [
    {
        "businessRuleId": "BuildNodeAssetsSyncPlan",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_BuildNodeAssetsSyncPlan.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "mapObjectJSON",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_mapObjectJSON.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnNodeDeltaJSON",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnNodeDeltaJSON.js",
        "businessRuleType": "BusinessFunction"
    }
]);
