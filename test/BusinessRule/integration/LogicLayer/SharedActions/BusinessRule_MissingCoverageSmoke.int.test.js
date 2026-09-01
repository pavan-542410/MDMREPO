const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/LogicLayer/SharedActions", [
    {
        "businessRuleId": "SendHierarchyAttributeLinksToCurrentUser",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SendHierarchyAttributeLinksToCurrentUser.js",
        "businessRuleType": "BusinessAction"
    }
]);
