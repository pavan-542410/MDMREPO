const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/GlobalBusinessRulesRoot/MerchSetProcessing", [
    {
        "businessRuleId": "EvaluateAndLinkFromMerchSets",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_EvaluateAndLinkFromMerchSets.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "EvaluateListCriteria",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_EvaluateListCriteria.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "EvaluateMerchSet",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_EvaluateMerchSet.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "EvaluateSearchCriteria",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_EvaluateSearchCriteria.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "EvaluateSKUForMerchSets",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_EvaluateSKUForMerchSets.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "LoadAttributesToCriteria",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_LoadAttributesToCriteria.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "LoadCategoryFromMerchSets",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_LoadCategoryFromMerchSets.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "MerchSetAttributeCriteriaCrossValidation",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_MerchSetAttributeCriteriaCrossValidation.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "MerchSetFunctionLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_MerchSetFunctionLibrary.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "ReevaluateMerchSets",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ReevaluateMerchSets.js",
        "businessRuleType": "BusinessAction"
    }
]);
