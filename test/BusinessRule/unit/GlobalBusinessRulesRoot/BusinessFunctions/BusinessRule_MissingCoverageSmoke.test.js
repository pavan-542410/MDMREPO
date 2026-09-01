const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/GlobalBusinessRulesRoot/BusinessFunctions", [
    {
        "businessRuleId": "AssetMetricFunction",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AssetMetricFunction.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "AttributionCompleteFunction",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_AttributionCompleteFunction.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "doesColorwayHaveMatchingSizeSKU",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_doesColorwayHaveMatchingSizeSKU.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "getBusinessLine",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_getBusinessLine.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "getExampleSKU",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_getExampleSKU.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "getFirstClassFromLinkType",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_getFirstClassFromLinkType.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "getMultipleITNodesFromPPHNodes",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_getMultipleITNodesFromPPHNodes.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "getParent",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_getParent.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "getParentMatchingObjTypeID",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_getParentMatchingObjTypeID.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "getPrimarySV",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_getPrimarySV.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "GetRecentlyCreatedPrimaryAsset",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_GetRecentlyCreatedPrimaryAsset.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "GetSKUTimeUnderUnclassifiedSKUs",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_GetSKUTimeUnderUnclassifiedSKUs.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "getStyleFromPPH",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_getStyleFromPPH.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "isAlreadyReferenced",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isAlreadyReferenced.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "isBelowItemTypeHierarchy",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isBelowItemTypeHierarchy.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "isClassAttrLinkMandatory",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isClassAttrLinkMandatory.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "isFabricContent100",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isFabricContent100.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "isSellsideWorkflowEligible",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isSellsideWorkflowEligible.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "IsTransitionedAStateOnADate",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_IsTransitionedAStateOnADate.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "PartialApproveNodeAttributes",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_PartialApproveNodeAttributes.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "ProductDetailsMetricFunction",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ProductDetailsMetricFunction.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnMaterialForNodeSelector",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnMaterialForNodeSelector.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnNewNodeID",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnNewNodeID.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnRefSourceArray",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnRefSourceArray.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnRefTargetArray",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnRefTargetArray.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnSVsMatchingFabrication",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnSVsMatchingFabrication.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "StyleVariantApprovalValidationFunction",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_StyleVariantApprovalValidationFunction.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "sv_match_code_generator",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_sv_match_code_generator.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "svHasImagery",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_svHasImagery.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "WashInstructionsMetricFunction",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_WashInstructionsMetricFunction.js",
        "businessRuleType": "BusinessFunction"
    }
]);
