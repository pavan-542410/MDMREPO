const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/ContextLayer/WebUIContext", [
    {
        "businessRuleId": "DevLocalAssetUploadToCloudinary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_DevLocalAssetUploadToCloudinary.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "ExportHierarchyAttributeLinks",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ExportHierarchyAttributeLinks.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "MakeSelectedAssetPrimary",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_MakeSelectedAssetPrimary.js",
        "businessRuleType": "BusinessAction"
    }
]);
