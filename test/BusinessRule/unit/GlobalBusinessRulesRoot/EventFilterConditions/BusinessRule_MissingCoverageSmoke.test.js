const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/GlobalBusinessRulesRoot/EventFilterConditions", [
    {
        "businessRuleId": "CNS_Filter",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_CNS_Filter.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "HasItemTypeHierarchyDetails",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_HasItemTypeHierarchyDetails.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isFashionThingSOTForBuyside",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isFashionThingSOTForBuyside.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "IsPayloadMostRecent",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_IsPayloadMostRecent.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "IsPrimarySVWithProdImagery",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_IsPrimarySVWithProdImagery.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "IsSKUIdEndingWith9",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_IsSKUIdEndingWith9.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isStiboSOTForBuyside",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isStiboSOTForBuyside.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "returnFalse",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnFalse.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "SV_OIEP_Filter",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SV_OIEP_Filter.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "UpheritEventFilter",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UpheritEventFilter.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "valid_item_type_hierarchy",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_valid_item_type_hierarchy.js",
        "businessRuleType": "BusinessCondition"
    }
]);
