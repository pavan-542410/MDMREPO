const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/WebUI/SampleOperationsUI", [
    {
        "businessRuleId": "CompleteInternalTransfer",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_CompleteInternalTransfer.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "CreatePackage",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_CreatePackage.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "CreateSample",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_CreateSample.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "CreateSampleToMaterialRef",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_CreateSampleToMaterialRef.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "NavigateToSampleDetails",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_NavigateToSampleDetails.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "NavigateToSamplePackage",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_NavigateToSamplePackage.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "returnHangtagJSON",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnHangtagJSON.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "SampleCheckIn_CleanUp",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SampleCheckIn_CleanUp.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SampleCheckIn",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SampleCheckIn.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SampleOpsBRLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SampleOpsBRLibrary.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "SampleReprint",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SampleReprint.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "sb_initiateTransfer",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_sb_initiateTransfer.js",
        "businessRuleType": "BusinessAction"
    }
]);
