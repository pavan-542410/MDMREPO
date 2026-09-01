const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/UtilityLayer/NodeFetchers", [
    {
        "businessRuleId": "returnClassificationByLinkTypeID",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnClassificationByLinkTypeID.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnProductsByLinkTypeID",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnProductsByLinkTypeID.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnSourceByRefTypeID",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnSourceByRefTypeID.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnTargetsByRefTypeID",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnTargetsByRefTypeID.js",
        "businessRuleType": "BusinessFunction"
    }
]);
