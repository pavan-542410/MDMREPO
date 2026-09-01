const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/Workflows/ProductWorkflows", [
    {
        "businessRuleId": "calculateAssigneeInWorkflow",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_calculateAssigneeInWorkflow.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "cwHasImagery",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_cwHasImagery.js",
        "businessRuleType": "BusinessCondition"
    },
    {
        "businessRuleId": "resetDeadlineWhileWaitingForPO",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_resetDeadlineWhileWaitingForPO.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "WaitingForImageryEligible",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_WaitingForImageryEligible.js",
        "businessRuleType": "BusinessCondition"
    }
]);
