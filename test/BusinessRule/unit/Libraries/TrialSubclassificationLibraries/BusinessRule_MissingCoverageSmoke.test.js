const path = require('path');
const { runUnitSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runUnitSmokeCases("Unit smoke coverage for test/BusinessRule/unit/Libraries/TrialSubclassificationLibraries", [
    {
        "businessRuleId": "TrialSubclassification_AdvancedMappings",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_TrialSubclassification_AdvancedMappings.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "TrialSubclassification_ClassSiloMappings",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_TrialSubclassification_ClassSiloMappings.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "TrialSubclassification_JoinedLibraries",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_TrialSubclassification_JoinedLibraries.js",
        "businessRuleType": "BusinessLibrary"
    },
    {
        "businessRuleId": "TrialSubclassification_KeywordMappings",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_TrialSubclassification_KeywordMappings.js",
        "businessRuleType": "BusinessLibrary"
    }
]);
