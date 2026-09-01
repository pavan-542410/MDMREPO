const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/MatchCodesAndMatchingAlgorithms/StyleVariantToStyleMatching", [
    {
        "businessRuleId": "CreateSVtoStyleMLRefType",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_CreateSVtoStyleMLRefType.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "StyleBrandSKUMatcher",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_StyleBrandSKUMatcher.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "styleMatchCode",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_styleMatchCode.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "StyleProductNameMatcher",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_StyleProductNameMatcher.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "StyleStyleIDMatcher",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_StyleStyleIDMatcher.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "StyleVariantToStyleSurvivorshipAction",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_StyleVariantToStyleSurvivorshipAction.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SVtoStyleEventFilter",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SVtoStyleEventFilter.js",
        "businessRuleType": "BusinessCondition"
    }
]);
