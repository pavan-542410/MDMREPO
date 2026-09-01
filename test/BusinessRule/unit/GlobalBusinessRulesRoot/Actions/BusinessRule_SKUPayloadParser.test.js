var parser = require("../../../../../step-configs/BusinessRule/BusinessRule_SKUPayloadParser");
var harness = require("../../../support/utils/skuPayloadParserTestHarness");

function buildPayload(overrides) {
    return Object.assign({
        sku_id: "LEGACY_SINGLETON",
        ft_data_model_style_variant_id: "SV_LEGACY_SINGLETON",
        colorway_variant_id: "CW_LEGACY_SINGLETON",
        vendor_style_id: "PRD_LEGACY_SINGLETON",
        classification: "Jackets",
        status: "Pending",
        vendor_style_name: "Legacy Product",
        dmdm_pre_pcs_vendorcolorway_imageway_style_id: "DMDM_LEGACY_SINGLETON",
        item_type_id: "100",
        ft_data_model_style_id: "STYLE100",
        tag_size_schema_id: "10",
        size_name: "M"
    }, overrides || {});
}

describe("BusinessRule_SKUPayloadParser", function () {
    beforeEach(function () {
        harness.installJavaMocks();
    });

    afterEach(function () {
        harness.clearJavaMocks();
    });

    test("creates Product, Colorway, StyleVariant, SKU and wires payload/style/schema references", function () {
        var product = harness.runLegacySingleton(parser, buildPayload());
        var colorway = product.getChildren()[0];
        var styleVariant = colorway.getChildren()[0];
        var sku = styleVariant.getChildren()[0];
        var payloadRefs = product.__testContext.messageContainer._refsByType.PayloadToSKUReference;

        expect(colorway.getID()).toBe("VAR_CW_LEGACY_SINGLETON");
        expect(styleVariant.getID()).toBe("SV_SV_LEGACY_SINGLETON");
        expect(styleVariant.getValue("status").getSimpleValue()).toBe("Pending");
        expect(styleVariant.getValue("style_name").getSimpleValue()).toBe("STYLE100");
        expect(sku.getID()).toBe("SKU_LEGACY_SINGLETON");
        expect(sku.getValue("vendor_style_id").getSimpleValue()).toBe("PRD_LEGACY_SINGLETON");
        expect(sku.getValue("sku_id").getSimpleValue()).toBe("LEGACY_SINGLETON");
        expect(sku.getValue("ft_data_model_style_variant_id").getSimpleValue()).toBe("SV_LEGACY_SINGLETON");
        expect(sku.getValue("size_name").getSimpleValue()).toBe("M");
        expect(sku.getName()).toBe("-  - M");
        expect(payloadRefs).toHaveLength(1);
        expect(payloadRefs[0].getTarget().getID()).toBe("SKU_LEGACY_SINGLETON");
        expect(Object.keys(styleVariant._classLinksByType)).toContain("StyleVariantToStyleLink");
        expect(Object.keys(sku._classLinksByType)).toContain("SKUToSizeSchemaLink");
    });
});
