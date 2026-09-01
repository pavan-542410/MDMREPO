const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/GlobalBusinessRulesRoot/Libraries", [
    {
        "businessRuleId": "AssetLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AssetLibrary.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "DataHandlingLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_DataHandlingLibrary.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "DateTimeLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_DateTimeLibrary.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "GIEPLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_GIEPLibrary.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "GlobalConstants",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_GlobalConstants.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "MetricsLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_MetricsLibrary.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "SFMPHOverrideConditions",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SFMPHOverrideConditions.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "STEPLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_STEPLibrary.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "trialSubclassificationMappings",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_trialSubclassificationMappings.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "UtilityLibrary_v1",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UtilityLibrary_v1.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "UtilityLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UtilityLibrary.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "ValidationsLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ValidationsLibrary.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "WebUILibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_WebUILibrary.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "WorkflowHelpersLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_WorkflowHelpersLibrary.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "WorkflowHelpersLibraryv1",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_WorkflowHelpersLibraryv1.js",
        "businessRuleType": "BusinessLibrary"
    }
]);
