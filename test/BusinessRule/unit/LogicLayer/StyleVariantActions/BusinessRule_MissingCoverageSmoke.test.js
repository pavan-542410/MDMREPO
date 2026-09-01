const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/LogicLayer/StyleVariantActions", [
    {
        "businessRuleId": "AutoAssignPrimaryAsset",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AutoAssignPrimaryAsset.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "HandleStyleVariantAssets",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_HandleStyleVariantAssets.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "PopulateFacetedSearchAttributes",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_PopulateFacetedSearchAttributes.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SyncStyleVariantAssets",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SyncStyleVariantAssets.js",
        "businessRuleType": "BusinessAction"
    }
]);
