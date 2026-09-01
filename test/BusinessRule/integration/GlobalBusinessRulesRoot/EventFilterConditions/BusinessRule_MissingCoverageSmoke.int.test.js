const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/GlobalBusinessRulesRoot/EventFilterConditions", [
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
        "businessRuleId": "isStiboSOTForBuyside",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isStiboSOTForBuyside.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "SV_OIEP_Filter",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SV_OIEP_Filter.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "SVAssetsProcessorHoldFilter",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SVAssetsProcessorHoldFilter.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "SVWorkflowStateFilter",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SVWorkflowStateFilter.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "UpheritEventFilter",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UpheritEventFilter.js",
        "businessRuleType": "BusinessCondition"
    }
]);
