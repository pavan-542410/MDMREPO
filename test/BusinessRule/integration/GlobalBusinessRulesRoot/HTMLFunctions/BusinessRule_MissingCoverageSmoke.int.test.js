const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/GlobalBusinessRulesRoot/HTMLFunctions", [
    {
        "businessRuleId": "parseAIResponseHTML",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_parseAIResponseHTML.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnAttributeLinkDetailsHTML",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnAttributeLinkDetailsHTML.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnPackageLink",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnPackageLink.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnPrimaryImageHTML",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnPrimaryImageHTML.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnPrimarySVImageCarousel",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnPrimarySVImageCarousel.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnQuickLinks",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnQuickLinks.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnSimpleImage",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnSimpleImage.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnUserClasses",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnUserClasses.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnWorkflowLogHTML",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnWorkflowLogHTML.js",
        "businessRuleType": "BusinessFunction"
    }
]);
