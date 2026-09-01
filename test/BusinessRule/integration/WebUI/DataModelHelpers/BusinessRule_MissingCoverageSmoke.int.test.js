const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/WebUI/DataModelHelpers", [
    {
        "businessRuleId": "BringFromSelectedStyleVariant",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_BringFromSelectedStyleVariant.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "BringSelectedColorways",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_BringSelectedColorways.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "BringSelectedSKUs",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_BringSelectedSKUs.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "BringSelectedStyleVariants",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_BringSelectedStyleVariants.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "CreateLOVValuesWebUI",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_CreateLOVValuesWebUI.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "CreateNewSVFromSourceSV",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_CreateNewSVFromSourceSV.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "goToColorway",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_goToColorway.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "goToProduct",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_goToProduct.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "goToStyleVariant",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_goToStyleVariant.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "navigateFromStoP",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_navigateFromStoP.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "navigateFromSVtoCW",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_navigateFromSVtoCW.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "NavigateToFT_Style",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_NavigateToFT_Style.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "NavigateToFT_SV",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_NavigateToFT_SV.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "RemoveAttributeLink",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_RemoveAttributeLink.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SendSKUs",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SendSKUs.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SendStyleVariants",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SendStyleVariants.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SendSVtoNewCWProduct",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SendSVtoNewCWProduct.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SendToNewProduct",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SendToNewProduct.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SendToSelectedColorway",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SendToSelectedColorway.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SendToSelectedProduct",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SendToSelectedProduct.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "UpdateProductName",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UpdateProductName.js",
        "businessRuleType": "BusinessAction"
    }
]);
