const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/WebUI/DataIssuesReportActions", [
    {
        "businessRuleId": "checkUpheritanceIssuesCondition",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_checkUpheritanceIssuesCondition.js",
        "businessRuleType": "BusinessCondition"
    }
]);
