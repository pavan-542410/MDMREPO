const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/UtilityLayer/NodeFetchers", [
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
