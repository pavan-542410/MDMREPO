const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/GlobalBusinessRulesRoot/Conditions", [
    {
        "businessRuleId": "BCForDuplicateSVandSKU",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_BCForDuplicateSVandSKU.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "CheckMandatoryAttributesBeforeApprove",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_CheckMandatoryAttributesBeforeApprove.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "DeduplicationCheckForSKU",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_DeduplicationCheckForSKU.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "DeduplicationCheckForStyleVariant",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_DeduplicationCheckForStyleVariant.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "hasMajorRevision",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_hasMajorRevision.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "hasSFMPHOverrideMappings",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_hasSFMPHOverrideMappings.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "hasStitchFixID",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_hasStitchFixID.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "hasStyleVariant",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_hasStyleVariant.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "hasUserInAssigneeGroup",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_hasUserInAssigneeGroup.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isChildless",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isChildless.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isColorway",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isColorway.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isColorwayWithPOSince2023",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isColorwayWithPOSince2023.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isDerivedEvent",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isDerivedEvent.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isLOV",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isLOV.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isNotColorway",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isNotColorway.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isNotProduct",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isNotProduct.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isNotSKU",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isNotSKU.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isNotStyleVariant",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isNotStyleVariant.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isProduct",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isProduct.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isSKU",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isSKU.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isSKUorSV",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isSKUorSV.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isSKUorSVorCW",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isSKUorSVorCW.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isSKUorSVorCWorPRD",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isSKUorSVorCWorPRD.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isStyleVariant",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isStyleVariant.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "isUserSuper",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_isUserSuper.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "MaintenanceEligibleCondition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_MaintenanceEligibleCondition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "SellsideEligibleCondition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SellsideEligibleCondition.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "SilhouetteInvalidValidationCheck",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SilhouetteInvalidValidationCheck.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "styleVariantApprovalCheck",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_styleVariantApprovalCheck.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "SVHasValidImagery",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SVHasValidImagery.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "VerifySizeSchemaAttributes",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_VerifySizeSchemaAttributes.js",
        "businessRuleType": "BusinessCondition"
    }
]);
