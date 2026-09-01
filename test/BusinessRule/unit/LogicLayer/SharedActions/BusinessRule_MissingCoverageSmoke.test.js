const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/LogicLayer/SharedActions", [
    {
        "businessRuleId": "SendHierarchyAttributeLinksToCurrentUser",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SendHierarchyAttributeLinksToCurrentUser.js",
        "businessRuleType": "BusinessAction"
    }
]);
