const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/WebUI/MerchOperationsUI", [
    {
        "businessRuleId": "BasketApprove",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_BasketApprove.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "initiateInternalTransfer",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_initiateInternalTransfer.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "isInApproval",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isInApproval.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isInAttribution",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isInAttribution.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isInMedia",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isInMedia.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "merchOperationsLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_merchOperationsLibrary.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "PopulateIsExclusiveAtSvLevel",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_PopulateIsExclusiveAtSvLevel.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "ReassignWithUserInput",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ReassignWithUserInput.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "RemoveFromOnHold",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_RemoveFromOnHold.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "RemoveFromWorkflow",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_RemoveFromWorkflow.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "UpdateCoreMerchGroupsUI",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UpdateCoreMerchGroupsUI.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "UpdatePrimaryAddlMaterials",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UpdatePrimaryAddlMaterials.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "VerifyAndAddValuesToMerchMoments",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_VerifyAndAddValuesToMerchMoments.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "WorkflowApprove",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_WorkflowApprove.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "WorkflowAttributionComplete",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_WorkflowAttributionComplete.js",
        "businessRuleType": "BusinessAction"
    }
]);
