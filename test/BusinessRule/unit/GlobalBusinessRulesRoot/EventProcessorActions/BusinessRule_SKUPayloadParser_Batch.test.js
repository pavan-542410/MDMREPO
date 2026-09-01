var parser = require("../../../../../step-configs/BusinessRule/BusinessRule_SKUPayloadParser_Batch");
var harness = require("../../../support/utils/skuPayloadParserTestHarness");

function buildPayload(suffix, overrides) {
    return Object.assign({
        sku_id: "SKU_" + suffix,
        ft_data_model_style_variant_id: "SV_" + suffix,
        colorway_variant_id: "CW_" + suffix,
        vendor_style_id: "PRD_" + suffix,
        classification: "Jackets",
        status: "Pending",
        brand_id: "1000",
        brand: "Test Brand",
        vendor_style_name: "Batch Product " + suffix,
        dmdm_pre_pcs_vendorcolorway_imageway_style_id: "DMDM_" + suffix
    }, overrides || {});
}

describe("BusinessRule_SKUPayloadParser_Batch ProductNode coverage", function () {
    beforeEach(function () {
        harness.installJavaMocks();
    });

    afterEach(function () {
        harness.clearJavaMocks();
    });

    test("populates ProductNode attributes from batch payload", function () {
        var payload = buildPayload("BATCH");
        var product = harness.runBatch(parser, payload);

        expect(product.getValue("product_name").getSimpleValue()).toBe("Batch Product BATCH");
        expect(product.getValue("vendor_style_id").getSimpleValue()).toBe("PRD_BATCH");
        expect(product.getValue("dmdm_vendor_style_id").getSimpleValue()).toBe("DMDM_BATCH");
        expect(product.getName()).toBe("Batch Product BATCH");
    });

    test("creates Colorway, StyleVariant, SKU hierarchy and wires the payload reference to SKU", function () {
        var payload = buildPayload("BATCH_GRAPH");
        var product = harness.runBatch(parser, payload);
        var colorway = product.getChildren()[0];
        var styleVariant = colorway.getChildren()[0];
        var sku = styleVariant.getChildren()[0];
        var payloadRefs = product.__testContext.messageContainer._refsByType.PayloadToSKUReference;

        expect(colorway.getID()).toBe("VAR_CW_BATCH_GRAPH");
        expect(colorway.getObjectType().getID()).toBe("ColorwayVariantNode");
        expect(colorway.getValue("colorway_variant_id").getSimpleValue()).toBe("CW_BATCH_GRAPH");

        expect(styleVariant.getID()).toBe("SV_SV_BATCH_GRAPH");
        expect(styleVariant.getObjectType().getID()).toBe("StyleVariant");
        expect(styleVariant.getValue("ft_data_model_style_variant_id").getSimpleValue()).toBe("SV_BATCH_GRAPH");
        expect(styleVariant.getValue("catalog_status").getSimpleValue()).toBe("Pending");
        expect(styleVariant.getValue("status").getSimpleValue()).toBe("Receivable");

        expect(sku.getID()).toBe("SKU_SKU_BATCH_GRAPH");
        expect(sku.getObjectType().getID()).toBe("SKUNode");
        expect(payloadRefs).toHaveLength(1);
        expect(payloadRefs[0].getTarget().getID()).toBe("SKU_SKU_BATCH_GRAPH");
    });

    test("preserves existing ProductNode product_name when batch payload vendor_style_name is null", function () {
        var payload = buildPayload("BATCH_NULL", {
            vendor_style_name: null
        });
        var product = harness.runBatch(parser, payload, {
            product_name: "Existing Batch Product Name"
        });

        expect(product.getValue("product_name").getSimpleValue()).toBe("Existing Batch Product Name");
        expect(product.getName()).toBe("Existing Batch Product Name");
        expect(product.getValue("vendor_style_id").getSimpleValue()).toBe("PRD_BATCH_NULL");
    });

    test("rethrows approval validation exceptions so the batch import can halt", function () {
        var payload = buildPayload("BATCH_FAIL");
        var sentMails = [];

        expect(function () {
            harness.runBatch(parser, payload, null, {
                sentMails: sentMails,
                onApprove: function (node) {
                    if (node.getObjectType().getID() === "StyleVariant") {
                        var error = new Error("Validation failed for StyleVariant");
                        error.javaException = {
                            getClass: function () {
                                return {
                                    getName: function () {
                                        return "com.stibo.core.domain.approve.ApproveValidationException";
                                    }
                                };
                            },
                            getMessage: function () {
                                return "Validation failed for StyleVariant";
                            }
                        };
                        throw error;
                    }
                }
            });
        }).toThrow("Validation failed for StyleVariant");

        expect(sentMails).toHaveLength(1);
        expect(sentMails[0].to).toContain("step-non-prod-alerts-aaaao43xqbwegseopvawzmk7xq@stitchfix.org.slack.com");
        expect(sentMails[0].subject).toContain("Inbound approval validation failed");
        expect(sentMails[0].plain).toContain("Validation failed for StyleVariant");
        expect(sentMails[0].sent).toBe(true);
    });

    test("skips processing when the inbound payload is not FT-managed", function () {
        var payload = buildPayload("BATCH_REJECTED");
        var messageContainer = harness.runBatch(parser, payload, null, {
            isFTManagedRejected: true
        });

        expect(messageContainer.__testContext.homes.product.getProductByID("PRD_PRD_BATCH_REJECTED")).toBeNull();
        expect(messageContainer.__testContext.messageContainer._refsByType.PayloadToSKUReference).toBeUndefined();
        expect(messageContainer.__testContext.messageContainer.getValue("processedAt").getSimpleValue()).toBe("");
    });

    test("ignores malformed JSON payloads without creating product hierarchy nodes", function () {
        var payload = buildPayload("BATCH_BAD_JSON");
        var messageContainer = harness.runBatch(parser, payload, null, {
            rawSkuPayload: "{bad-json"
        });

        expect(messageContainer.__testContext.homes.product.getProductByID("PRD_PRD_BATCH_BAD_JSON")).toBeNull();
        expect(messageContainer.__testContext.messageContainer._refsByType.PayloadToSKUReference).toBeUndefined();
        expect(messageContainer.__testContext.messageContainer.getValue("processedAt").getSimpleValue()).toBe("");
    });

    test("falls back to UnclassifiedSKUs when product/colorway IDs are null but style variant and SKU IDs exist", function () {
        var payload = buildPayload("BATCH_UNCLASSIFIED", {
            vendor_style_id: null,
            colorway_variant_id: null
        });
        var messageContainer = harness.runBatch(parser, payload);
        var styleVariant = messageContainer.__testContext.homes.product.getProductByID("SV_SV_BATCH_UNCLASSIFIED");
        var sku = messageContainer.__testContext.homes.product.getProductByID("SKU_SKU_BATCH_UNCLASSIFIED");

        expect(styleVariant.getParent().getID()).toBe("UnclassifiedSKUs");
        expect(sku.getParent().getID()).toBe("SV_SV_BATCH_UNCLASSIFIED");
        expect(messageContainer.__testContext.messageContainer._refsByType.PayloadToSKUReference[0].getTarget().getID()).toBe("SKU_SKU_BATCH_UNCLASSIFIED");
        expect(messageContainer.__testContext.messageContainer.getValue("processedAt").getSimpleValue()).toBe("2026-03-27 12:00:00");
    });

    test("reparents existing SV/CW to override targets and copies values from the legacy hierarchy", function () {
        var payload = buildPayload("BATCH_OVERRIDE", {
            sku_id: "SKU_BATCH_OVERRIDE",
            ft_data_model_style_variant_id: "SV_BATCH_OVERRIDE",
            vendor_style_id: "DEST_BATCH",
            vendor_style_name: null,
            colorway_variant_id: "IGNORED_BATCH"
        });

        var product = harness.runBatch(parser, payload, {
            product_name: ""
        }, {
            onBuildContext: function (context, registry) {
                var legacyProduct = registry.createNode("PRD_LEGACY_BATCH", "ProductNode", context.sfmphRoot, {
                    product_name: "Legacy Batch Product"
                });
                var legacyColorway = registry.createNode("VAR_LEGACY_BATCH", "ColorwayVariantNode", legacyProduct, {
                    brand_color: "Legacy Blue"
                });
                registry.createNode("SV_SV_BATCH_OVERRIDE", "StyleVariant", legacyColorway, {
                    udp_colorway_override: "CW_OVERRIDE_BATCH"
                });
                registry.createNode("VAR_CW_OVERRIDE_BATCH", "ColorwayVariantNode", context.homes.product.getProductByID("PRD_DEST_BATCH"), {
                    udp_product_override: "DEST_BATCH"
                });
            }
        });
        var colorway = product.getChildren()[0];
        var styleVariant = colorway.getChildren()[0];

        expect(product.getID()).toBe("PRD_DEST_BATCH");
        expect(product.getValue("product_name").getSimpleValue()).toBe("Legacy Batch Product");
        expect(colorway.getID()).toBe("VAR_CW_OVERRIDE_BATCH");
        expect(colorway.getValue("brand_color").getSimpleValue()).toBe("Legacy Blue");
        expect(styleVariant.getParent().getID()).toBe("VAR_CW_OVERRIDE_BATCH");
    });

    test("currently fails label creation when a new label is required because labelRoot is not initialized", function () {
        var payload = buildPayload("BATCH_STYLE", {
            brand_color: "Cerulean",
            fabric_content: "{bad-material-json",
            ft_data_model_style_id: "STYLE_BATCH",
            item_type_id: "100",
            legacy_size_id: "10",
            sku_labels: ["Care Label"],
            tag_size_schema_name: "schema_10"
        });
        expect(function () {
            harness.runBatch(parser, payload);
        }).toThrow("labelRoot is not defined");
    });
});
