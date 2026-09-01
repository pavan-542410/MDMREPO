const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/UtilityLayer/DataFetchers", [
    {
        "businessRuleId": "returnAllValuesJSON",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnAllValuesJSON.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnChangedData",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnChangedData.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnClassificationIDs",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnClassificationIDs.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnHierarchyAsNames",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnHierarchyAsNames.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnHierarchyAttributeLinksJSON",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnHierarchyAttributeLinksJSON.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnHierarchyNames",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnHierarchyNames.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnLinksJSON",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnLinksJSON.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnReferencesJSON",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnReferencesJSON.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnValueSearchResultsJSON",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnValueSearchResultsJSON.js",
        "businessRuleType": "BusinessFunction"
    },
    {
        "businessRuleId": "returnValuesJSON",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_returnValuesJSON.js",
        "businessRuleType": "BusinessFunction"
    }
]);
