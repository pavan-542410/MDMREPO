const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/GlobalBusinessRulesRoot/Actions", [
    {
        "businessRuleId": "AttributionCompleteCheck",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AttributionCompleteCheck.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "BYMessageJoiner",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_BYMessageJoiner.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "calculateAssigneeInWorkflow_BU",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_calculateAssigneeInWorkflow_BU.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "CalculateStatus",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_CalculateStatus.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "ClearMerchMoments",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ClearMerchMoments.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "DetermineOnHoldFromCatalogStatus",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_DetermineOnHoldFromCatalogStatus.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "ExternalAssetImporter",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ExternalAssetImporter.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "FailSafeNodeApproval",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_FailSafeNodeApproval.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "FixProductClassification",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_FixProductClassification.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "josh_test",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_josh_test.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "LinkAttributesToProductClassification",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_LinkAttributesToProductClassification.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "LinkJobToStyleVariant",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_LinkJobToStyleVariant.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "minMaxLOVValues",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_minMaxLOVValues.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "MoveChildlessNodesToDeletedFolders",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_MoveChildlessNodesToDeletedFolders.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "PCH-1446_CleanUpBr",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_PCH-1446_CleanUpBr.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "PopulateAttributionCompleteness",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_PopulateAttributionCompleteness.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "populateBrandID",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_populateBrandID.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "PopulateIVDBasedonLVN",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_PopulateIVDBasedonLVN.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "RollUpInventoryDates",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_RollUpInventoryDates.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "RollUpSubclassification",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_RollUpSubclassification.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SampleOpsWeekdaySetup",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SampleOpsWeekdaySetup.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "sankr_test",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_sankr_test.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "sb_reassign",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_sb_reassign.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "sendEventToDevAssetReferenceChecker",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_sendEventToDevAssetReferenceChecker.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SKUCreationInWorkflow",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SKUCreationInWorkflow.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SKUPayloadParser",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SKUPayloadParser.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "StyleVariantApprovalAction",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_StyleVariantApprovalAction.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "TempBusinessAction",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_TempBusinessAction.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "UpheritAndApprove",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UpheritAndApprove.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "UploadLocalAssetToCloudinary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UploadLocalAssetToCloudinary.js",
        "businessRuleType": "BusinessAction"
    }
]);
