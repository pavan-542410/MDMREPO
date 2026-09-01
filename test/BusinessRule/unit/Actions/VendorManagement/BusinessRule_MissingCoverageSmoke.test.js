const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/Actions/VendorManagement", [
    {
        "businessRuleId": "SetVendorNameFull",
        "businessRulePath": "step-config/BusinessRule/BusinessRule_SetVendorNameFull.js",
        "businessRuleType": "GeneralBusinessRule"
    }
]);
