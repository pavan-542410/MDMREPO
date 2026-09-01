var parser = require("../../../../../step-configs/BusinessRule/BusinessRule_SKUPayloadBatchParser");
var harness = require("../../../support/utils/skuPayloadParserTestHarness");

function buildPayload(overrides) {
    return Object.assign({
        sku_id: "LEGACY_BATCH",
        ft_data_model_style_variant_id: "SV_LEGACY_BATCH",
        colorway_variant_id: "CW_LEGACY_BATCH",
        vendor_style_id: "PRD_LEGACY_BATCH",
        classification: "Jackets",
        status: "Pending",
        vendor_style_name: "Legacy Batch Product",
        dmdm_pre_pcs_vendorcolorway_imageway_style_id: "DMDM_LEGACY_BATCH",
        item_type_id: "100",
        ft_data_model_style_id: "STYLE100",
        tag_size_schema_id: "10",
        size_name: "L"
    }, overrides || {});
}

describe("BusinessRule_SKUPayloadBatchParser", function () {
    beforeEach(function () {
        harness.installJavaMocks();
    });

    afterEach(function () {
        harness.clearJavaMocks();
    });

    test("creates hierarchy, maps style/SKU values, links schema/style and queues one colorway event", function () {
        var product = harness.runLegacyBatch(parser, buildPayload());
        var colorway = product.getChildren()[0];
        var styleVariant = colorway.getChildren()[0];
        var sku = styleVariant.getChildren()[0];
        var payloadRefs = product.__testContext.messageContainer._refsByType.PayloadToSKUReference;

        expect(colorway.getID()).toBe("VAR_CW_LEGACY_BATCH");
        expect(styleVariant.getID()).toBe("SV_SV_LEGACY_BATCH");
        expect(styleVariant.getValue("ft_status").getSimpleValue()).toBe("Pending");
        expect(sku.getID()).toBe("SKU_LEGACY_BATCH");
        expect(sku.getValue("product_name").getSimpleValue()).toBe("Legacy Batch Product");
        expect(payloadRefs).toHaveLength(1);
        expect(payloadRefs[0].getTarget().getID()).toBe("SKU_LEGACY_BATCH");
        expect(Object.keys(styleVariant._classLinksByType)).toContain("StyleVariantToStyleLink");
        expect(Object.keys(sku._classLinksByType)).toContain("SKUToSizeSchemaLink");
        expect(product.__queuedEvents).toHaveLength(1);
        expect(product.__queuedEvents[0].node.getID()).toBe("VAR_CW_LEGACY_BATCH");
    });
});
