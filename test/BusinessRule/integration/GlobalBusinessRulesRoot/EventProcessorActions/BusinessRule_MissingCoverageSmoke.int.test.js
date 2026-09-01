const path = require('path');
const { runIntegrationSmokeCases } = require(path.resolve(process.cwd(), 'test/BusinessRule/support/utils/businessRuleCoverage'));

runIntegrationSmokeCases("Integration smoke coverage for test/BusinessRule/integration/GlobalBusinessRulesRoot/EventProcessorActions", [
    {
        "businessRuleId": "ChangeNotification_Deduplicator",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_ChangeNotification_Deduplicator.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "eventCascadeForRefDataUpdates",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_eventCascadeForRefDataUpdates.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SKUPayloadBatchParser",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SKUPayloadBatchParser.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SKUPayloadParser_Batch",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SKUPayloadParser_Batch.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "SVtoSKUEvent",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_SVtoSKUEvent.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "udp_inbound-batch-processor",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_udp_inbound-batch-processor.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "udp_inbound-singleton-processor",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_udp_inbound-singleton-processor.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "UDPtoBYPublishDatadog",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UDPtoBYPublishDatadog.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "UpdatePrimaryImage",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UpdatePrimaryImage.js",
        "businessRuleType": "BusinessAction"
    },
    {
        "businessRuleId": "UpperProductChangeProcessor",
        "businessRulePath": "step-configs/BusinessRule/BusinessRule_UpperProductChangeProcessor.js",
        "businessRuleType": "BusinessAction"
    }
]);
