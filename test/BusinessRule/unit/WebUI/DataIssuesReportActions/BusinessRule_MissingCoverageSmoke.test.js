const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/WebUI/DataIssuesReportActions", [
    {
        "businessRuleId": "checkUpheritanceIssuesCondition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_checkUpheritanceIssuesCondition.js",
        "businessRuleType": "BusinessCondition"
    }
]);
