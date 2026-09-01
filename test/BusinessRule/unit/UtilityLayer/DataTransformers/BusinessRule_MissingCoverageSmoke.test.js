const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/UtilityLayer/DataTransformers", [
    {
        "businessRuleId": "BuildHierarchyAttributeLinksPayload",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_BuildHierarchyAttributeLinksPayload.js",
        "businessRuleType": "BusinessFunction"
    },
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
