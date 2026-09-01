const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/GlobalBusinessRulesRoot/BulkUpdateActions", [
    {
        "businessRuleId": "Approve",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_Approve.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "AttributeCleanup",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AttributeCleanup.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "CleanUpAttributeLinks",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_CleanUpAttributeLinks.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "deleteProductsWithoutPayloads",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_deleteProductsWithoutPayloads.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "ExtendSellsideAttributesValidityToSV",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ExtendSellsideAttributesValidityToSV.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "FlattenAttributeLinkToClass",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_FlattenAttributeLinkToClass.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "MissingFTStatusFix",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_MissingFTStatusFix.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "overrideClassificationAndSubclass",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_overrideClassificationAndSubclass.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "populateSVtoCoreSizeSchemaRoot",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_populateSVtoCoreSizeSchemaRoot.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "removeFromAttributeGroup",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_removeFromAttributeGroup.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "removeLinksFromProductClass",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_removeLinksFromProductClass.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "Replace Dinner Party with Date Night",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_Replace Dinner Party with Date Night.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "RepublishPayloadsInWB",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_RepublishPayloadsInWB.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "RepublishSKUCNEvent",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_RepublishSKUCNEvent.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "RepublishSVToBridge",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_RepublishSVToBridge.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "RepublishToBridge",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_RepublishToBridge.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "ResurrectDeletedSKU",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ResurrectDeletedSKU.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SampleDataCleanup",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SampleDataCleanup.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SetDescription",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SetDescription.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SetMerchContactEmail",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SetMerchContactEmail.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SetVendorDescription",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SetVendorDescription.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SizeSortOrder",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SizeSortOrder.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SKUPayloadParser_Singleton",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SKUPayloadParser_Singleton.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "temp_josh_workflow_assignee",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_temp_josh_workflow_assignee.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "UnUpheritValues",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UnUpheritValues.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "UpdateDeadlineStatusAssignee",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UpdateDeadlineStatusAssignee.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "UpdateFirstMediaAvailableAt",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UpdateFirstMediaAvailableAt.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "UpdateMandatoryAndAttributeLinks",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UpdateMandatoryAndAttributeLinks.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "UpdatePrimaryPhotoAssetID",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UpdatePrimaryPhotoAssetID.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "UpheritGPC",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UpheritGPC.js",
        "businessRuleType": "BusinessAction"
    }
]);
