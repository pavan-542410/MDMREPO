const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/GlobalBusinessRulesRoot/Workflow", [
    {
        "businessRuleId": "autopopulateColorwayValues",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_autopopulateColorwayValues.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "autoPopulateLegacyMaterials",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_autoPopulateLegacyMaterials.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "autopopulateStyleVariantValues",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_autopopulateStyleVariantValues.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "CategoryMandatoryAttribueCheck",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_CategoryMandatoryAttribueCheck.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "EditorialImageValidation",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_EditorialImageValidation.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "FreestyleReadiness",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_FreestyleReadiness.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "GenerateUUID",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_GenerateUUID.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "IconImageValidation",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_IconImageValidation.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "IsSVLinkedToExternalAsset",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_IsSVLinkedToExternalAsset.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "LogoImageValidation",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_LogoImageValidation.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "PartiallyApproveSellsideAttributes",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_PartiallyApproveSellsideAttributes.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "PartiallyApproveCoreReferences",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_PartiallyApproveCoreReferences.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "ProductsLinkedValidation",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ProductsLinkedValidation.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "SetAttributionDeadlineAndStatus",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SetAttributionDeadlineAndStatus.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SetDeadlineAndStatus_ProductOnboarding",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SetDeadlineAndStatus_ProductOnboarding.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SetSampleAndMediaDeadlineAndStatus",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SetSampleAndMediaDeadlineAndStatus.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "StylingReadiness",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_StylingReadiness.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "SubmitInWorkflow",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SubmitInWorkflow.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "svCreationWorkflowCondition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_svCreationWorkflowCondition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "webUISendNodeToMaintain",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_webUISendNodeToMaintain.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "WorkflowLibrary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_WorkflowLibrary.js",
        "businessRuleType": "BusinessLibrary"
    }
]);
